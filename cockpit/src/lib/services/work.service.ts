import { fetchGithubBoard, isGithubConfigured } from "@/lib/services/github.service";
import type { BoardSummary, WorkItem } from "@/lib/schemas/work";

/**
 * Seed board shown before GitHub is connected, so the cockpit is never empty.
 * These represent Cos's own bring-up backlog.
 */
const SEED_ITEMS: WorkItem[] = [
  { id: "seed-1", title: "Cockpit 'The Pit' opzetten", status: "in_progress", source: "cos" },
  {
    id: "seed-2",
    title: "GitHub koppelen als bron van waarheid",
    status: "backlog",
    source: "cos",
  },
  {
    id: "seed-3",
    title: "Agents werven en toegangsrechten toekennen",
    status: "backlog",
    source: "cos",
  },
  { id: "seed-4", title: "Vercel-deploy van de cockpit", status: "backlog", source: "cos" },
];

/**
 * Returns the work board. Uses live GitHub data when configured, otherwise a
 * seed backlog so the dashboard is always meaningful.
 *
 * @returns Board summary and items, plus whether the data is live.
 */
export async function getBoard(): Promise<{
  summary: BoardSummary;
  items: WorkItem[];
  live: boolean;
}> {
  if (isGithubConfigured()) {
    const { summary, items } = await fetchGithubBoard();
    if (items.length > 0 || summary.backlog + summary.inProgress + summary.done > 0) {
      return { summary, items, live: true };
    }
  }

  const summary: BoardSummary = {
    backlog: SEED_ITEMS.filter((item) => item.status === "backlog").length,
    inProgress: SEED_ITEMS.filter((item) => item.status === "in_progress").length,
    done: SEED_ITEMS.filter((item) => item.status === "done").length,
  };
  return { summary, items: SEED_ITEMS, live: false };
}
