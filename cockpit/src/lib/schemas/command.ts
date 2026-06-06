import { z } from "zod";

/** Request body for the "From The Pit" command bar. */
export const commandRequestSchema = z.object({
  /** The raw "what" the user typed or spoke. */
  text: z.string().min(1, "Voer een opdracht in"),
});
export type CommandRequest = z.infer<typeof commandRequestSchema>;

/** The intent Cos derives from a command. */
export const commandIntentSchema = z.enum([
  "build",
  "research",
  "hire",
  "deploy",
  "status",
  "unknown",
]);
export type CommandIntent = z.infer<typeof commandIntentSchema>;

/**
 * Cos's response to a command. In v1 this is a plan (dry run) — Cos states the
 * "how" before any mutating action, honoring the human-in-the-loop gates.
 */
export const commandResultSchema = z.object({
  intent: commandIntentSchema,
  /** Dutch summary of the plan Cos would execute. */
  plan: z.string(),
  /** Suggested agent/tool to carry it out. */
  assignedTo: z.string(),
  /** True when nothing was mutated (always true in v1). */
  dryRun: z.boolean(),
});
export type CommandResult = z.infer<typeof commandResultSchema>;
