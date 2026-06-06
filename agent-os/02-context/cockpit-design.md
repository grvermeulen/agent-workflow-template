# Cockpit design — "The Pit"

_Last updated: 2026-06-06_

The user provided an early design idea for the cockpit app (top priority — see `context.md`). **Use this as the starting reference when we build the cockpit.**

Reference image: `assets/cockpit-design-the-pit.png`

## What the mockup shows

- **Name:** "The Pit" — "Your command center". Dark, futuristic navy theme.
- **Left nav:** Command Center, Messages, Mail, Chat, Agenda, Apps, Cursor, Claude Code, Files & Data, Automations.
- **Top status tiles:** Deep Work, Uptime (e.g. 87%), and another metric (24%).
- **Cards / panels:**
  - Messages, Mail, Apps — communication + app surface.
  - **Cursor** and **Claude Code** ("Claude is alive") — live agent/tool surfaces.
  - **To-Do** list.
  - **Activity Stream** — running log of what agents are doing.
  - **Quick Launch** — start common actions.
  - **Agents** — the roster, with a "New Agent" action (maps to `agent-hiring`).
  - **Agent Builder / Automations** — e.g. code-review agent, scheduling — create/configure automations.
- **Footer:** a "From The Pit" input (the chat/voice command line) + summary stats.

## How it maps to the Agent OS

- The board (backlog / in-progress / done) and **Agents roster + access rights** = the cockpit Cos maintains (`01-identity`, `02-context` priority #1).
- The "From The Pit" input = the single chat/voice interface (the "what").
- Activity Stream / Automations = `04-workflow` processes made visible.
- Backed by GitHub as source of truth (`context.md` → External authorities).
