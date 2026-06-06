import { z } from "zod";

/** Kanban-style status of a unit of work. */
export const workStatusSchema = z.enum(["backlog", "in_progress", "done"]);
export type WorkStatus = z.infer<typeof workStatusSchema>;

/** A unit of work (GitHub issue or PR) tracked on the board. */
export const workItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: workStatusSchema,
  /** Where it came from, e.g. "github:owner/repo". */
  source: z.string(),
  url: z.string().url().optional(),
});
export type WorkItem = z.infer<typeof workItemSchema>;

/** Aggregated board counts for the top status tiles. */
export const boardSummarySchema = z.object({
  backlog: z.number().int().nonnegative(),
  inProgress: z.number().int().nonnegative(),
  done: z.number().int().nonnegative(),
});
export type BoardSummary = z.infer<typeof boardSummarySchema>;
