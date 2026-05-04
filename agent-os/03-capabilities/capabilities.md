# Capabilities

_Last updated: YYYY-MM-DD_

<!--
Format:  - `<name>` — <one-line description> · <scope> · <trust> · <link>
Scope: read-only | mutating | destructive
Trust: auto | asks-first | explicit-only
-->

## Built-in

<!--
- `Read`, `Edit`, `Write`, `Bash` — file & shell access · mutating · auto
- `git` (via Bash) — version control · mutating · asks-first for push/force/reset
-->

## MCP servers

<!--
- `github` — PRs, reviews, CI, issues · mutating · asks-first for write ops
- `sentry` — issue search, attachments · read-only · auto
- `slack`, `atlassian`, `supabase`, `vercel` — see settings.json
-->

## Slash commands

<!--
- `/loop-on-ci` — watch CI, fix failures, address review threads
- `/vercel-setup` — Vercel project bootstrap (one-time)
- `/agent-os-bootstrap` — fill in this Agent OS structure
- `/agent-os-retro` — feed lessons back into the layers
-->

## Skills

<!--
- `verification-loop` — pre-PR validation
- `deslop` — strip narration / dead defensive code
- `search-first` — search before writing new utilities
- `code-review`, `security-review`
-->

## External APIs / services

<!--
- (list any project-specific APIs the agent has credentials for)
-->
