# Layer 3 · Capabilities

**What tools / MCPs / skills can the agent actually call?**

Identity says *who*; Capabilities says *what hands they have*. This layer is a declared, deduplicated list of every action the agent is authorized to take — so the agent doesn't reinvent things that already exist, and so a human can audit reach.

## What goes here

- **Built-in tools** — file edits, shell, git.
- **MCP servers** — GitHub, Sentry, Slack, Atlassian, Supabase, Vercel, etc.
- **Slash commands** — `/loop-on-ci`, `/vercel-setup`, `/agent-os-bootstrap`, `/agent-os-retro`.
- **Skills** — entries from `.cursor/skills/` and `.claude/skills/`.
- **External APIs** the agent has credentials for.

## Conventions

- **One bullet per capability**, with a one-line description and a link to its definition.
- **Mark scope** — read-only / mutating / destructive.
- **Mark trust level** — auto-allowed / asks first / never without explicit prompt.

## Files

- `capabilities.md` — the declared list.
