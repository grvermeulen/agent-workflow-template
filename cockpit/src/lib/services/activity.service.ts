import { fetchGithubActivity, isGithubConfigured } from "@/lib/services/github.service";
import type { ActivityItem } from "@/lib/schemas/activity";

/** Seed activity shown before GitHub is connected. */
const SEED_ACTIVITY: ActivityItem[] = [
  {
    id: "seed-act-1",
    timestamp: new Date().toISOString(),
    actor: "Cos",
    message: "The Pit is opgestart. Wachten op gekoppelde tools.",
    kind: "info",
  },
  {
    id: "seed-act-2",
    timestamp: new Date().toISOString(),
    actor: "Cos",
    message: "Agent OS geladen — identiteit, capaciteiten en gates actief.",
    kind: "success",
  },
];

/**
 * Returns the activity stream. Live GitHub events when configured, otherwise a
 * seed feed.
 *
 * @param limit - Maximum number of items.
 * @returns The activity items, plus whether the data is live.
 */
export async function getActivity(limit = 8): Promise<{ items: ActivityItem[]; live: boolean }> {
  if (isGithubConfigured()) {
    const items = await fetchGithubActivity(limit);
    if (items.length > 0) {
      return { items, live: true };
    }
  }
  return { items: SEED_ACTIVITY.slice(0, limit), live: false };
}
