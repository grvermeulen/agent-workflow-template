import { z } from "zod";
import { commandIntentSchema } from "@/lib/schemas/command";

/** Who authored a chat message. */
export const chatRoleSchema = z.enum(["user", "assistant"]);
export type ChatRole = z.infer<typeof chatRoleSchema>;

/** A single message in a Cos conversation. */
export const chatMessageSchema = z.object({
  role: chatRoleSchema,
  content: z.string().trim().min(1, "Voer een bericht in").max(4000, "Bericht is te lang"),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

/** Request body for the "From The Pit" chat — the full turn history. */
export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "Voer een opdracht in").max(40),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** How Cos produced the reply. */
export const chatModeSchema = z.enum(["llm", "planner", "delegated"]);
export type ChatMode = z.infer<typeof chatModeSchema>;

/** Cos's reply to a chat turn. */
export const chatReplySchema = z.object({
  reply: z.string(),
  /**
   * "llm" = answered by Claude (API); "planner" = keyword fallback;
   * "delegated" = handed to Claude Code on GitHub (subscription).
   */
  mode: chatModeSchema,
  /** Present in planner/delegated mode: the detected intent. */
  intent: commandIntentSchema.optional(),
  /** Present in planner/delegated mode: the agent/tool Cos would assign. */
  assignedTo: z.string().optional(),
  /** Present in delegated mode: the URL of the GitHub work issue. */
  url: z.string().url().optional(),
});
export type ChatReply = z.infer<typeof chatReplySchema>;
