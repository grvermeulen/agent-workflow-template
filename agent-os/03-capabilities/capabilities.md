# Capabilities

_Last updated: 2026-06-07_

**Default trust model:** read freely (auto); perform write/mutating/external actions but **log** them; for any **new** permission, ask the user first, then record it as approved (see `06-human-in-the-loop/`). Cos is the sole grantor of access rights to other agents.

Format: `<name>` — <description> · <scope> · <trust>

## Built-in

- `Read`, `Edit`, `Write` — file access · read/mutating · auto (read) / log (write)
- `Bash` — shell · mutating · auto for read-only; log for writes; ask for destructive
- `Agent` — spawn sub-agents / delegate work · mutating · auto (this is how Cos delegates)

## MCP servers

- `github` — repos, PRs, issues, projects, CI, reviews · mutating · auto read · log writes. **Backbone / source of truth.**
- `vercel` — deployments, projects, logs · mutating · log writes; **prod deploy auto + logged** (per Layer 6)
- `supabase` — DB, migrations, edge functions · mutating/destructive · **ask before migrations/applies** (destructive)
- `atlassian` — Jira issues, Confluence pages · mutating · log internal writes; **ask before external/public posts**
- `slack` — read/post messages, canvases · mutating · **ask before posting** (external)

## Slash commands

- `/loop-on-ci` — watch CI, fix failures, address + resolve review threads
- `/vercel-setup` — one-time Vercel project bootstrap
- `/agent-os-bootstrap` — fill the Agent OS layers
- `/agent-os-retro` — feed lessons back into the layers

## Skills

- `verification-loop` — pre-PR validation
- `deslop` — strip narration / dead defensive code
- `search-first` — search before writing new utilities
- `code-review`, `security-review` — review the current diff

## Cos orchestration capabilities

- **Delegate** — assign work to sub-agents (via `Agent`) or to the right tool.
- **Hire / create agents** — formulate requirements and create a specialized agent on demand, or stand up an **HR agent** to do the hiring.
- **Cockpit app** — **live** at `cos-lemon.vercel.app` (code in `cockpit/`): board (backlog / in-progress / done) + agent roster + access rights + activity, backed by GitHub.
- **Chat (The Pit)** — converse with Cos. **Actionable build/deploy/hire requests are delegated to Claude Code on GitHub**: Cos opens an `@claude` issue and the Claude Code Action (`.github/workflows/claude.yml`) implements it and opens a PR, running on the **subscription** (`CLAUDE_CODE_OAUTH_TOKEN` secret, no API billing) — needs `COS_WORK_REPO` + a write `GITHUB_TOKEN`. Conversation uses, in order: headless subscription Claude Code (**off-Vercel only** — the CLI subprocess can't run in Vercel serverless) → **Anthropic API** (`ANTHROPIC_API_KEY`, used for chat on Vercel) → keyword **planner**. Model `claude-opus-4-8`.
- **Report tool/key status** — Cos answers "which tools/keys are connected?" directly from the cockpit's own environment (✅/⚠️/❌ checklist, key **names** only — never values). Gemini accepts `GEMINI_API_KEY` or `GOOGLE_API_KEY`.
- **Delegate to Claude Code (GitHub Action)** — `@claude` on any issue/PR runs Claude Code on the subscription and opens a PR. The sanctioned way to spend the subscription on real work, with no serverless time/subprocess limits.
- **Grant access rights** — sole grantor; new permission → ask user → record approved → grant onward as fit.

## Cross-tool reach (not yet wired)

- Oversight of agents in **ChatGPT, Gemini, xAI, ElevenLabs** — desired, but no operational integration exists here yet (open question in `02-context/`).
