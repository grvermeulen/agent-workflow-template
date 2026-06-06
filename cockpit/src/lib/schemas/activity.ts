import { z } from "zod";

/** Severity/intent of an activity stream entry. */
export const activityKindSchema = z.enum(["info", "success", "warning"]);
export type ActivityKind = z.infer<typeof activityKindSchema>;

/** A single line in the cockpit activity stream. */
export const activityItemSchema = z.object({
  id: z.string(),
  /** ISO-8601 timestamp. */
  timestamp: z.string(),
  /** Who/what produced the event (agent or tool name). */
  actor: z.string(),
  /** Dutch, user-facing description of what happened. */
  message: z.string(),
  kind: activityKindSchema,
});
export type ActivityItem = z.infer<typeof activityItemSchema>;
