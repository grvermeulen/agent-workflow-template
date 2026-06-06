import { z } from "zod";

/** Lifecycle state of an agent in the roster. */
export const agentStateSchema = z.enum(["actief", "aan het werk", "inactief"]);
export type AgentState = z.infer<typeof agentStateSchema>;

/**
 * An agent in Cos's roster. Mirrors the Agent OS model: every agent has a
 * purpose and an explicit, least-privilege set of access rights.
 */
export const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Dutch description of what the agent is for. */
  purpose: z.string(),
  /** The tool/surface the agent runs on (e.g. "Claude Code", "Cursor"). */
  tool: z.string(),
  state: agentStateSchema,
  /** Granted access rights, e.g. ["github:read", "vercel:deploy"]. */
  accessRights: z.array(z.string()),
});
export type Agent = z.infer<typeof agentSchema>;
