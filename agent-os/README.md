# Agent OS

Spec-driven development scaffolding for AI coding agents. Adapted from
[Brian Casel's Agent OS v3](https://github.com/buildermethods/agent-os)
(MIT, © 2025 CasJam Media LLC / Builder Methods) and integrated into this
template's existing `AGENTS.md` + `.cursor/rules/` workflow.

## What lives here

```
agent-os/
├── product/          # Product context the agent reads before planning
│   ├── mission.md      What problem, for whom, what's unique
│   ├── roadmap.md      Phase 1 (MVP) and Phase 2 (post-launch)
│   └── tech-stack.md   Frontend / backend / database / other
├── standards/        # Tribal knowledge extracted from the codebase
│   ├── index.yml       Catalog used by /inject-standards to match by topic
│   └── <area>/         e.g. api/, database/, frontend/, backend/, testing/, global/
└── specs/            # One folder per planned feature/change
    └── YYYY-MM-DD-HHMM-<slug>/
        ├── plan.md
        ├── shape.md         scope, decisions, context
        ├── standards.md     which standards apply and why
        ├── references.md    similar code studied during shaping
        └── visuals/         optional mockups/screenshots
```

## Slash commands

Run these inside Claude Code (they live in `.claude/commands/agent-os/`):

| Command | When to run | What it does |
|---|---|---|
| `/plan-product` | Once per project | Interactively fills `product/mission.md`, `roadmap.md`, `tech-stack.md`. |
| `/discover-standards` | After the codebase has real patterns worth capturing | Surfaces patterns area-by-area, asks "why", and writes concise files in `standards/`. |
| `/index-standards` | After hand-editing `standards/` | Rebuilds `standards/index.yml` so injection still matches. |
| `/inject-standards` | Start of any task | Suggests (or accepts arguments for) the standards relevant to the current work and reads them into context. |
| `/shape-spec` | In Plan Mode, before a non-trivial change | Asks targeted questions, pulls in product + standards, writes the spec folder above. Task 1 of every plan saves the docs. |

## Workflow

1. **Bootstrap** — `/plan-product` to fill `product/`. Skip if the project already has equivalent docs elsewhere; just point the agent at them.
2. **Capture standards as they emerge** — when you notice a pattern the agent keeps getting wrong, run `/discover-standards` for that area. Keep entries short; they're injected into context windows and every word costs tokens.
3. **Plan before you build** — for anything non-trivial, enter Plan Mode, run `/shape-spec`, approve the plan, then execute. The first task always persists `plan.md` + `shape.md` so the rationale survives the conversation.
4. **Inject on demand** — at the start of an implementation task, `/inject-standards` (or `/inject-standards api/response-format` etc.) reads the relevant standards into context.

## Relationship to the rest of this template

- `AGENTS.md` — long-lived preferences (workflow etiquette, deslop pass, CodeRabbit). Unchanged by Agent OS.
- `.cursor/rules/` — agent-agnostic coding rules. Still authoritative for HOW to write code.
- `.cursor/skills/` — reusable agent procedures. Still authoritative for repeatable operations.
- `agent-os/standards/` — project-specific tribal knowledge discovered from the codebase. Authoritative for project conventions that don't generalize.
- `agent-os/specs/` — the audit trail for every non-trivial change. Months later, you can answer "why does this exist?".

When `.cursor/rules/` and `agent-os/standards/` overlap, the cursor rule is the global default and the standard is the project-specific override.

## Attribution

The slash commands and folder layout are adapted from
[buildermethods/agent-os](https://github.com/buildermethods/agent-os) v3
(MIT). See `NOTICE` at the repo root.
