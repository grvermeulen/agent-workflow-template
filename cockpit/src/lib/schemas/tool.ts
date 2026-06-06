import { z } from "zod";

/** Connection state of an external tool Cos oversees. */
export const connectionStateSchema = z.enum(["connected", "degraded", "offline"]);
export type ConnectionState = z.infer<typeof connectionStateSchema>;

/** Functional grouping of a tool in the cockpit. */
export const toolCategorySchema = z.enum(["build", "model", "infra", "comms"]);
export type ToolCategory = z.infer<typeof toolCategorySchema>;

/** A single tool/integration tile shown in The Pit. */
export const toolStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: toolCategorySchema,
  state: connectionStateSchema,
  /** Dutch, user-facing one-liner about the connection. */
  detail: z.string(),
});
export type ToolStatus = z.infer<typeof toolStatusSchema>;
