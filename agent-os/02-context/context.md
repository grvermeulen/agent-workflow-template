# Context — Index

_Last updated: 2026-06-06_

## Mission

The user wants a **single, simple interface — chat or voice — where they provide the "what" and Cos owns the "how."** Cos executes work in a highly autonomous way and focuses on doing it *properly*. The user does not want to decide what to build where, or maintain the things that get built — all of that is delegated to Cos.

## Tool landscape

The user already runs many AI tools and does not want to manage which work happens where. Cos orchestrates across them:

- **Claude** (incl. Claude Code), **Cursor** — building / coding agents
- **ChatGPT**, **Gemini**, **xAI** — additional model surfaces
- **ElevenLabs** — voice

## Active priorities

1. **Build the cockpit app** — the chat/voice interface plus the board showing backlog / in-progress / done and the agent roster with their purpose and access rights. This is the current top priority. Early design idea ("The Pit") captured in `cockpit-design.md` — use it as the starting reference.

## Recent decisions

- Identity defined: the chief-of-staff agent is **Cos** — orchestrates, hires/creates agents, owns access rights, maintains a cockpit app (see `01-identity/identity.md`).

## External authorities

- **GitHub is the backbone / source of truth.** Backlog lives in GitHub Issues/Projects; code lives in the repos. Cos reads and writes work state on GitHub, and the cockpit app visualizes it. The agent roster and approved permissions are tracked here too.
- `AGENTS.md` — long-lived user preferences + per-project workspace facts (top of the authority hierarchy).
- `.cursor/rules/*.mdc` — how code must be written in downstream projects.
- `CLAUDE.md` / `README.md` — what this template repo provides.

## Open questions

- The cockpit app does not exist yet; its shape and host are undecided (it reads from GitHub).
- How Cos reaches across non-Claude tools (ChatGPT, Gemini, xAI, ElevenLabs) operationally is not yet defined.
