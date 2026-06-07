import Anthropic from "@anthropic-ai/sdk";
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
 * Whether Cos can answer via Claude (an Anthropic key is configured).
 *
 * @returns True when `ANTHROPIC_API_KEY` is present.
 */
export function isCosLlmEnabled(): boolean {
  return Boolean(readEnv().ANTHROPIC_API_KEY);
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
 * Planner fallback used when Claude is unavailable: reuses the keyword planner so
 * the chat still returns a useful plan without any API key.
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
 * Produces Cos's reply to a chat turn. Uses Claude when configured; otherwise
 * falls back to the keyword planner so the chat always works. Any Claude error
 * degrades to the planner rather than failing the request.
 *
 * @param messages - The full conversation history (user/assistant turns).
 * @returns Cos's reply and how it was produced.
 */
export async function replyAsCos(messages: ChatMessage[]): Promise<ChatReply> {
  const { ANTHROPIC_API_KEY } = readEnv();
  if (!ANTHROPIC_API_KEY) {
    return plannerReply(messages);
  }

  try {
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: COS_MODEL,
      max_tokens: 1024,
      system: COS_SYSTEM_PROMPT,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    const reply = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!reply) {
      return plannerReply(messages);
    }
    return { reply, mode: "llm" };
  } catch (error: unknown) {
    logger.error("cos.replyAsCos", error);
    return plannerReply(messages);
  }
}
