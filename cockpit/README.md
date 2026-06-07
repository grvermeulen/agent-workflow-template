# The Pit — Cos's command center

The first living version of **Cos**, the Chief of Staff agent. The Pit is the single
dashboard where you give the "what" and Cos owns the "how": it shows your work
board, the agent roster with their access rights, the activity stream, and the
connection status of every tool Cos oversees — plus a command bar that turns a
request into a plan.

Built from the Agent OS layers in `../agent-os/` (identity, context, capabilities,
workflow, interface, human-in-the-loop) and the original "The Pit" design in
`../agent-os/02-context/cockpit-design.md`.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (utility classes only)
- **Zod** for validation, thin API routes delegating to a service layer
- **Vitest** + Testing Library

## Architecture

- `src/lib/services/` — business logic (GitHub, tool status, agents, work board,
  activity, command planning). GitHub is the live source of truth; everything else
  degrades gracefully to a seed state when its credentials are absent.
- `src/lib/schemas/` — Zod schemas + inferred types crossing the API boundary.
- `src/app/api/*` — thin handlers: parse → validate → delegate → respond.
- `src/components/` — presentational components for each cockpit panel.
- `src/app/page.tsx` — server component composing the dashboard.

## Tool connections

Every integration is **optional**. A tool with credentials shows as `connected`;
local IDE tools (Cursor) show as `degraded` (manual); the rest show `offline`.
Configure via env (see `.env.example`):

`GITHUB_TOKEN` (backbone), `VERCEL_TOKEN`, `SUPABASE_URL`/`SUPABASE_ANON_KEY`,
`SLACK_BOT_TOKEN`, `ATLASSIAN_API_TOKEN`, and model keys `ANTHROPIC_API_KEY`,
`OPENAI_API_KEY`, `GEMINI_API_KEY`, `XAI_API_KEY`, `ELEVENLABS_API_KEY`.

With a `GITHUB_TOKEN`, the Work board (open issues = backlog, open PRs = in
progress) and the Activity stream become live.

## Develop

```bash
npm install
cp .env.example .env.local   # fill in what you have; all keys optional
npm run dev                  # http://localhost:3000

npm run typecheck
npm run lint
npm run test
npm run build
```

## Deploy (Vercel)

Set the project **root directory** to `cockpit/` and add the env vars above in the
Vercel dashboard. Framework preset: Next.js. No extra config needed (`vercel.json`
pins the framework).

## Chat ("From The Pit")

The command bar is a real chat with Cos (Chief of Staff; you give the "what", Cos
owns the "how"; honors the approval gates). Two things happen:

**Actionable work is delegated to Claude Code on your subscription.** When a message
is a build/deploy/hire request and `COS_WORK_REPO` + a write-capable `GITHUB_TOKEN`
are set, Cos opens a GitHub issue mentioning `@claude`. The
[Claude Code Action](../.github/workflows/claude.yml) then implements it and opens a
PR — running on your Claude subscription (`CLAUDE_CODE_OAUTH_TOKEN` as a repo
secret), **no API usage**. The reply is tagged `gedelegeerd` and links the issue.

**Everything else is answered conversationally**, via the first available of:

1. **Your Claude subscription** (`CLAUDE_CODE_OAUTH_TOKEN`) — runs Claude Code
   headlessly. **Only on a host that can spawn the CLI subprocess** — this is
   **skipped on Vercel serverless** (it can't), unless `COS_FORCE_CLAUDE_CODE=1`.
2. **The Anthropic API** (`ANTHROPIC_API_KEY`) — used for chat on Vercel.
3. **Keyword planner** — no credentials needed, so the chat always works.

Replies are tagged `Claude` / `planner` / `gedelegeerd`. Endpoint: `POST /api/chat`.

> **On Vercel:** set `ANTHROPIC_API_KEY` for the chat, and use the GitHub Action +
> `COS_WORK_REPO` for subscription-powered work. The headless-subscription chat is
> for self-managed (always-on Node) hosts, where the CLI subprocess can run.

## Status — v1

Live at **https://cos-lemon.vercel.app**: the full dashboard UI, tool-status detection
from env, the GitHub-backed work board + activity feed, and the Cos chat. In v1 the
chat states **plans** (the "how") rather than executing mutating work. Executing plans
(create the issue, assign the agent), hiring agents for real, and wiring the non-GitHub
tools are the next steps.
