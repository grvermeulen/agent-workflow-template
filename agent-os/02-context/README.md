# Layer 2 · Context

**What does the agent need to know — dated, scoped, current?**

Context is *what's true right now*. Unlike Identity (stable) and Capabilities (slow-moving), Context goes stale fast. Every file here is dated, scoped, and rotated as reality changes.

## What goes here

- Project mission, current goals, current constraints.
- Org chart / who-does-what (if relevant).
- Active priorities & deadlines.
- Recent decisions and their rationale.
- Open questions the agent should know are open.
- Pointers to authoritative external docs (Confluence, Notion, ADRs).

## What does NOT go here

- Tools the agent can call → that's `03-capabilities/`.
- Step-by-step processes → that's `04-workflow/`.
- Long-lived coding rules → those stay in `.cursor/rules/`.

## Conventions

- **Date every file.** First line of each file: `_Last updated: YYYY-MM-DD_`.
- **One topic per file.** `priorities.md`, `team.md`, `recent-decisions.md`, etc.
- **Rotate, don't append.** Stale facts get deleted, not commented out.

## Files

- `context.md` — index/landing file, points to the rest.
