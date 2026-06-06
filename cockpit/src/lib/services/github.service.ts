import { readEnv, hasEnv } from "@/lib/config/env";
import { logger } from "@/lib/logger";
import type { WorkItem, BoardSummary } from "@/lib/schemas/work";
import type { ActivityItem } from "@/lib/schemas/activity";

const GITHUB_API = "https://api.github.com";

/**
 * Whether GitHub — the cockpit's source of truth — is configured.
 *
 * @returns True when a `GITHUB_TOKEN` is present.
 */
export function isGithubConfigured(): boolean {
  return hasEnv("GITHUB_TOKEN");
}

/**
 * Performs an authenticated GitHub REST request.
 *
 * @param path - API path beginning with "/".
 * @param token - The GitHub token.
 * @returns The parsed JSON payload typed as `T`.
 * @throws When the response status is not ok.
 */
async function githubRequest<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`GitHub ${path} → ${response.status}`);
  }
  return (await response.json()) as T;
}

/**
 * Resolves the GitHub owner to scope queries to: explicit `GITHUB_OWNER`, else
 * the authenticated user's login.
 *
 * @param token - The GitHub token.
 * @returns The owner login.
 */
async function resolveOwner(token: string): Promise<string> {
  const { GITHUB_OWNER } = readEnv();
  if (GITHUB_OWNER) return GITHUB_OWNER;
  const viewer = await githubRequest<{ login: string }>("/user", token);
  return viewer.login;
}

type SearchResponse = {
  total_count: number;
  items: { id: number; title: string; html_url: string; repository_url: string }[];
};

/**
 * Maps a repository API URL to a short "owner/repo" source label.
 *
 * @param repositoryUrl - e.g. "https://api.github.com/repos/acme/widgets".
 * @returns "acme/widgets", or "github" when it cannot be parsed.
 */
function sourceFromRepoUrl(repositoryUrl: string): string {
  const match = repositoryUrl.match(/repos\/(.+)$/);
  return match ? `github:${match[1]}` : "github";
}

/**
 * Fetches the work board from GitHub: open issues = backlog, open PRs =
 * in-progress, recently closed issues = done. Returns empty data (not an error)
 * when GitHub is not configured or the request fails.
 *
 * @returns A board summary plus a capped list of work items.
 */
export async function fetchGithubBoard(): Promise<{ summary: BoardSummary; items: WorkItem[] }> {
  const empty = { summary: { backlog: 0, inProgress: 0, done: 0 }, items: [] };
  const { GITHUB_TOKEN } = readEnv();
  if (!GITHUB_TOKEN) return empty;

  try {
    const owner = await resolveOwner(GITHUB_TOKEN);
    const [issues, prs, closed] = await Promise.all([
      githubRequest<SearchResponse>(
        `/search/issues?q=${encodeURIComponent(`owner:${owner} is:issue is:open`)}&per_page=20`,
        GITHUB_TOKEN,
      ),
      githubRequest<SearchResponse>(
        `/search/issues?q=${encodeURIComponent(`owner:${owner} is:pr is:open`)}&per_page=20`,
        GITHUB_TOKEN,
      ),
      githubRequest<SearchResponse>(
        `/search/issues?q=${encodeURIComponent(`owner:${owner} is:issue is:closed`)}&per_page=1`,
        GITHUB_TOKEN,
      ),
    ]);

    const items: WorkItem[] = [
      ...prs.items.slice(0, 8).map(
        (pr): WorkItem => ({
          id: `pr-${pr.id}`,
          title: pr.title,
          status: "in_progress",
          source: sourceFromRepoUrl(pr.repository_url),
          url: pr.html_url,
        }),
      ),
      ...issues.items.slice(0, 8).map(
        (issue): WorkItem => ({
          id: `issue-${issue.id}`,
          title: issue.title,
          status: "backlog",
          source: sourceFromRepoUrl(issue.repository_url),
          url: issue.html_url,
        }),
      ),
    ];

    return {
      summary: {
        backlog: issues.total_count,
        inProgress: prs.total_count,
        done: closed.total_count,
      },
      items,
    };
  } catch (error: unknown) {
    logger.error("github.fetchGithubBoard", error);
    return empty;
  }
}

type GithubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
};

/**
 * Maps a GitHub event type to Dutch, user-facing copy.
 *
 * @param type - The GitHub event type (e.g. "PushEvent").
 * @param repo - The "owner/repo" the event happened in.
 * @returns A Dutch description.
 */
function describeEvent(type: string, repo: string): string {
  const map: Record<string, string> = {
    PushEvent: `Commits gepusht naar ${repo}`,
    PullRequestEvent: `Pull request bijgewerkt in ${repo}`,
    IssuesEvent: `Issue bijgewerkt in ${repo}`,
    CreateEvent: `Branch of tag aangemaakt in ${repo}`,
    DeleteEvent: `Branch of tag verwijderd in ${repo}`,
    WatchEvent: `${repo} gemarkeerd met een ster`,
  };
  return map[type] ?? `Activiteit in ${repo}`;
}

/**
 * Fetches recent GitHub activity for the activity stream.
 *
 * @param limit - Maximum number of items to return.
 * @returns Activity items, or an empty list when offline/unconfigured.
 */
export async function fetchGithubActivity(limit = 8): Promise<ActivityItem[]> {
  const { GITHUB_TOKEN } = readEnv();
  if (!GITHUB_TOKEN) return [];

  try {
    const owner = await resolveOwner(GITHUB_TOKEN);
    const events = await githubRequest<GithubEvent[]>(
      `/users/${owner}/events?per_page=${limit}`,
      GITHUB_TOKEN,
    );
    return events.slice(0, limit).map(
      (event): ActivityItem => ({
        id: event.id,
        timestamp: event.created_at,
        actor: "GitHub",
        message: describeEvent(event.type, event.repo.name),
        kind: "info",
      }),
    );
  } catch (error: unknown) {
    logger.error("github.fetchGithubActivity", error);
    return [];
  }
}
