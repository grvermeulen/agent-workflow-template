import Anthropic from "@anthropic-ai/sdk";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { readEnv } from "@/lib/config/env";
import { logger } from "@/lib/logger";
import { planCommand } from "@/lib/services/command.service";
import type { ChatMessage, ChatReply } from "@/lib/schemas/chat";

/** The model Cos speaks with. */
const COS_MODEL = "claude-opus-4-8";

/**
 * Cos's persona and operating rules, injected as the system prompt. Mirrors the
 * Agent OS layers: identity (Chief of Staff), the "what vs how" split, and the
 * human-in-the-loop gates.
 */
const COS_SYSTEM_PROMPT = `Je bent Cos, de Chief of Staff van de gebruiker. De gebruiker geeft de "wat"; jij regelt de "hoe".

Je orkestreert werk en delegeert naar de juiste agent of tool: Claude Code en Cursor (bouwen), ChatGPT, Gemini en xAI (onderzoek/modellen), ElevenLabs (spraak). Je houdt overzicht via het cockpit "The Pit". GitHub is de bron van waarheid: de backlog zijn issues, lopend werk zijn pull requests.

Gedragsregels:
- Antwoord kort, helder en in het Nederlands.
- Voor uitvoerend of muterend werk: beschrijf eerst je plan (de "hoe") en welke agent of tool het oppakt. Voer in deze versie nog niets echt uit — je beschrijft alleen het plan.
- Respecteer goedkeuringspoorten: nieuwe toegangsrechten en destructieve of externe acties vereisen akkoord van de gebruiker. Vraag erom voordat je voorstelt zoiets uit te voeren.
- Wees rustig en zakelijk; geen onnodige uitweiding.`;

/**
 * Whether Cos can answer via the user's Claude subscription (a Claude Code OAuth
 * token is configured). This routes through Claude Code instead of API billing.
 *
 * @returns True when `CLAUDE_CODE_OAUTH_TOKEN` is present.
 */
export function isCosSubscriptionEnabled(): boolean {
  return Boolean(readEnv().CLAUDE_CODE_OAUTH_TOKEN);
}

/**
 * Whether Cos can answer with a real model — either via the subscription
 * (Claude Code) or the Anthropic API.
 *
 * @returns True when a subscription token or API key is present.
 */
export function isCosLlmEnabled(): boolean {
  const env = readEnv();
  return Boolean(env.CLAUDE_CODE_OAUTH_TOKEN || env.ANTHROPIC_API_KEY);
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
  // Claude Code writes config/state; point it at a writable dir for serverless hosts.
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
 * Produces Cos's reply to a chat turn. Preference order, each degrading to the
 * next on absence or error: the user's Claude subscription (Claude Code) →
 * the Anthropic API → the keyword planner. The chat therefore always works.
 *
 * @param messages - The full conversation history (user/assistant turns).
 * @returns Cos's reply and how it was produced.
 */
export async function replyAsCos(messages: ChatMessage[]): Promise<ChatReply> {
  const { CLAUDE_CODE_OAUTH_TOKEN, ANTHROPIC_API_KEY } = readEnv();

  if (CLAUDE_CODE_OAUTH_TOKEN) {
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
