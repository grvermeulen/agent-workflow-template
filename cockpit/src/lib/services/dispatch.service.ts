import { readEnv } from "@/lib/config/env";
import { logger } from "@/lib/logger";

const GITHUB_API = "https://api.github.com";

/**
 * Whether Cos can delegate work to Claude Code on GitHub: a target repo and a
 * write-capable token are both configured.
 *
 * @returns True when `COS_WORK_REPO` and `GITHUB_TOKEN` are present.
 */
export function isDispatchConfigured(): boolean {
  const env = readEnv();
  return Boolean(env.COS_WORK_REPO && env.GITHUB_TOKEN);
}

/** A created work issue. */
export type DispatchResult = { number: number; url: string };

/**
 * Builds a short issue title from a free-text request.
 *
 * @param text - The user's request.
 * @returns A trimmed, single-line title (≤ 80 chars).
 */
function titleFrom(text: string): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > 80 ? `${oneLine.slice(0, 77)}…` : oneLine;
}

/**
 * Delegates a request to Claude Code by opening a GitHub issue that mentions
 * `@claude`, which triggers the Claude Code Action (running on the user's
 * subscription). Returns null when delegation is unconfigured or the API fails.
 *
 * @param text - The user's "what" to hand to Claude Code.
 * @returns The created issue, or null.
 */
export async function dispatchToClaudeCode(text: string): Promise<DispatchResult | null> {
  const { COS_WORK_REPO, GITHUB_TOKEN } = readEnv();
  if (!COS_WORK_REPO || !GITHUB_TOKEN) return null;

  try {
    const body = `${text}\n\n---\n@claude implementeer dit en open een pull request. Volg de projectconventies (zie \`CLAUDE.md\`).\n\n_Aangemaakt door Cos via The Pit._`;
    const response = await fetch(`${GITHUB_API}/repos/${COS_WORK_REPO}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({ title: titleFrom(text), body }),
    });
    if (!response.ok) {
      throw new Error(`GitHub create issue → ${response.status}`);
    }
    const issue = (await response.json()) as { number: number; html_url: string };
    return { number: issue.number, url: issue.html_url };
  } catch (error: unknown) {
    logger.error("dispatch.dispatchToClaudeCode", error);
    return null;
  }
}
