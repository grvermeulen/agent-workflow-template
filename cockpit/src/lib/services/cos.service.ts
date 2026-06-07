import Anthropic from "@anthropic-ai/sdk";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { readEnv } from "@/lib/config/env";
import { logger } from "@/lib/logger";
import { detectIntent, planCommand } from "@/lib/services/command.service";
import { dispatchToClaudeCode, isDispatchConfigured } from "@/lib/services/dispatch.service";
import { getToolStatuses } from "@/lib/services/toolStatus.service";
import type { ConnectionState } from "@/lib/schemas/tool";
import type { ChatMessage, ChatReply } from "@/lib/schemas/chat";

/** The model Cos speaks with. */
const COS_MODEL = "claude-opus-4-8";

/** Intents that represent actionable work to delegate to Claude Code. */
const DELEGATABLE_INTENTS = new Set(["build", "deploy", "hire"]);

/**
 * Cos's persona and operating rules, injected as the system prompt. Mirrors the
 * Agent OS layers: identity (Chief of Staff), the "what vs how" split, and the
 * human-in-the-loop gates.
 */
const COS_SYSTEM_PROMPT = `Je bent Cos, de Chief of Staff van de gebruiker. De gebruiker geeft de "wat"; jij regelt de "hoe".

Je orkestreert werk en delegeert naar de juiste agent of tool: Claude Code en Cursor (bouwen), ChatGPT, Gemini en xAI (onderzoek/modellen), ElevenLabs (spraak). Je houdt overzicht via het cockpit "The Pit". GitHub is de bron van waarheid: de backlog zijn issues, lopend werk zijn pull requests.

Wat je zelf kunt (zeg nooit dat je "Claude Code niet kunt draaien" of dat er "geen koppeling" is):
- Voor bouw-, deploy- of wervingswerk delegeer je naar Claude Code op GitHub: er wordt automatisch een issue met @claude geopend en Claude Code voert het uit op het abonnement van de gebruiker en opent een pull request.
- Vragen over welke tools of sleutels gekoppeld zijn beantwoordt het cockpit direct vanuit zijn eigen omgeving — toon alleen sleutelnamen en status, nooit de waarden.

Gedragsregels:
- Antwoord kort, helder en in het Nederlands.
- Voor uitvoerend of muterend werk: beschrijf eerst je plan (de "hoe") en welke agent of tool het oppakt.
- Respecteer goedkeuringspoorten: nieuwe toegangsrechten en destructieve of externe acties vereisen akkoord van de gebruiker.
- Wees rustig en zakelijk; geen onnodige uitweiding.`;

/** Env-var label shown per tool in the status checklist (names only, never values). */
const TOOL_ENV_LABEL: Record<string, string> = {
  "claude-code": "ANTHROPIC_API_KEY of CLAUDE_CODE_OAUTH_TOKEN",
  cursor: "CURSOR_API_KEY",
  github: "GITHUB_TOKEN",
  vercel: "VERCEL_TOKEN",
  supabase: "SUPABASE_URL + SUPABASE_ANON_KEY",
  slack: "SLACK_BOT_TOKEN",
  atlassian: "ATLASSIAN_API_TOKEN",
  chatgpt: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY of GOOGLE_API_KEY",
  xai: "XAI_API_KEY",
  elevenlabs: "ELEVENLABS_API_KEY",
};

const STATE_MARK: Record<ConnectionState, string> = {
  connected: "✅",
  degraded: "⚠️",
  offline: "❌",
};

/**
 * Builds the tool/key checklist from the cockpit's own environment — exactly the
 * kind of "which keys are set?" question Cos can answer directly (no Claude Code).
 * Reports key names and status only; never the values.
 *
 * @returns A status-mode reply with the checklist.
 */
function statusReply(): ChatReply {
  const lines = getToolStatuses().map(
    (tool) => `${STATE_MARK[tool.state]} ${tool.name} (${TOOL_ENV_LABEL[tool.id] ?? "—"})`,
  );
  return {
    reply: `Status van je gekoppelde tools — alleen sleutelnamen, nooit de waarden:\n${lines.join("\n")}\n\n⚠️ = handmatig gekoppeld. Wil je een ontbrekende sleutel toevoegen, zet hem in de Vercel-omgevingsvariabelen.`,
    mode: "planner",
    intent: "status",
    assignedTo: "Cos",
  };
}

/**
 * Whether a Claude subscription token is configured (drives the tool tile).
 *
 * @returns True when `CLAUDE_CODE_OAUTH_TOKEN` is present.
 */
export function isCosSubscriptionEnabled(): boolean {
  return Boolean(readEnv().CLAUDE_CODE_OAUTH_TOKEN);
}

/**
 * Whether Cos can answer with a real model — via the subscription or the API.
 *
 * @returns True when a subscription token or API key is present.
 */
export function isCosLlmEnabled(): boolean {
  // Match runtime: the subscription path only counts where it can actually run.
  return Boolean(readEnv().ANTHROPIC_API_KEY || claudeCodeUsable());
}

/**
 * Whether the headless Claude Code path can actually run here. It spawns the
 * Claude Code CLI subprocess, which does not work in Vercel's serverless
 * sandbox — so it's used only off-Vercel (or when explicitly forced on a host
 * that supports subprocesses).
 *
 * @returns True when the subscription token is set and the host can spawn it.
 */
function claudeCodeUsable(): boolean {
  if (!readEnv().CLAUDE_CODE_OAUTH_TOKEN) return false;
  if (process.env.COS_FORCE_CLAUDE_CODE === "1") return true;
  return process.env.VERCEL !== "1";
}

/**
 * The most recent user message in a turn history.
 *
 * @param messages - The conversation so far.
 * @returns The last user message text, or an empty string.
 */
function lastUserText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}

/**
 * Renders the turn history as a single transcript prompt for the single-shot
 * Claude Code path, ending with Cos's turn to answer.
 *
 * @param messages - The conversation so far.
 * @returns The transcript prompt.
 */
function transcript(messages: ChatMessage[]): string {
  const lines = messages.map(
    (message) => `${message.role === "user" ? "Gebruiker" : "Cos"}: ${message.content}`,
  );
  return `${lines.join("\n\n")}\n\nCos:`;
}

/**
 * Planner fallback used when no model is available: reuses the keyword planner so
 * the chat still returns a useful plan without any credentials.
 *
 * @param messages - The conversation so far.
 * @returns A planner-mode reply.
 */
function plannerReply(messages: ChatMessage[]): ChatReply {
  const plan = planCommand(lastUserText(messages));
  return {
    reply: plan.plan,
    mode: "planner",
    intent: plan.intent,
    assignedTo: plan.assignedTo,
  };
}

/**
 * Answers via the user's Claude subscription by running Claude Code headlessly
 * (the Agent SDK spawns the Claude Code CLI, which uses `CLAUDE_CODE_OAUTH_TOKEN`
 * for subscription billing). Tools are disabled — this is a single-shot chat.
 *
 * @param messages - The conversation history.
 * @returns Cos's reply text, or an empty string if nothing was produced.
 */
async function replyViaClaudeCode(messages: ChatMessage[]): Promise<string> {
  if (!process.env.CLAUDE_CONFIG_DIR) {
    process.env.CLAUDE_CONFIG_DIR = "/tmp/.claude-cos";
  }

  let reply = "";
  for await (const message of query({
    prompt: transcript(messages),
    options: {
      systemPrompt: COS_SYSTEM_PROMPT,
      allowedTools: [],
      maxTurns: 1,
      permissionMode: "bypassPermissions",
      model: COS_MODEL,
    },
  })) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") reply += block.text;
      }
    }
  }
  return reply.trim();
}

/**
 * Answers via the Anthropic API (`ANTHROPIC_API_KEY`). Billed as API usage.
 *
 * @param messages - The conversation history.
 * @param apiKey - The Anthropic API key.
 * @returns Cos's reply text, or an empty string.
 */
async function replyViaApi(messages: ChatMessage[], apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: COS_MODEL,
    max_tokens: 1024,
    system: COS_SYSTEM_PROMPT,
    messages: messages.map((message) => ({ role: message.role, content: message.content })),
  });
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/**
 * Produces Cos's reply to a chat turn.
 *
 * Actionable build/deploy/hire requests are **delegated** to Claude Code on
 * GitHub (running on the user's subscription) when delegation is configured.
 * Everything else is answered conversationally, preferring (when the host can
 * run it) the subscription, then the Anthropic API, then the keyword planner —
 * each degrading on absence or error, so the chat always works.
 *
 * @param messages - The full conversation history (user/assistant turns).
 * @returns Cos's reply and how it was produced.
 */
export async function replyAsCos(messages: ChatMessage[]): Promise<ChatReply> {
  const { ANTHROPIC_API_KEY } = readEnv();
  const text = lastUserText(messages);
  const intent = detectIntent(text);

  // Cos answers tool/key status itself, from the cockpit's own environment.
  if (intent === "status") {
    return statusReply();
  }

  // Actionable work is delegated to Claude Code on GitHub. Be explicit about why
  // an issue is or isn't created — never silently fall back to a chat reply.
  if (DELEGATABLE_INTENTS.has(intent)) {
    if (!isDispatchConfigured()) {
      return {
        reply: `Dit kan ik delegeren aan Claude Code op GitHub, maar delegatie is nog niet ingesteld. Zet \`COS_WORK_REPO\` (owner/repo) in de Vercel-omgevingsvariabelen en geef \`GITHUB_TOKEN\` \`issues:write\`-rechten — daarna open ik automatisch een @claude-issue.`,
        mode: "planner",
        intent,
        assignedTo: "Cos",
      };
    }
    const issue = await dispatchToClaudeCode(text);
    if (issue) {
      return {
        reply: `Ingepland als werk: issue #${issue.number}. Claude Code pakt het op via je abonnement en opent een pull request.`,
        mode: "delegated",
        intent,
        assignedTo: "Claude Code (GitHub)",
        url: issue.url,
      };
    }
    return {
      reply: `Ik wilde een @claude-issue aanmaken in \`COS_WORK_REPO\`, maar dat lukte niet. Controleer of de repo bestaat en of \`GITHUB_TOKEN\` \`issues:write\`-rechten heeft.`,
      mode: "planner",
      intent,
      assignedTo: "Cos",
    };
  }

  if (claudeCodeUsable()) {
    try {
      const reply = await replyViaClaudeCode(messages);
      if (reply) return { reply, mode: "llm" };
    } catch (error: unknown) {
      logger.error("cos.replyViaClaudeCode", error);
    }
  }

  if (ANTHROPIC_API_KEY) {
    try {
      const reply = await replyViaApi(messages, ANTHROPIC_API_KEY);
      if (reply) return { reply, mode: "llm" };
    } catch (error: unknown) {
      logger.error("cos.replyViaApi", error);
    }
  }

  return plannerReply(messages);
}
