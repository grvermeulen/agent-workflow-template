# Layer 4 · Workflow

**Step-by-step processes the agent runs end-to-end.**

A workflow is a *named procedure* with a clear trigger, sequence of steps, and exit condition. If something is worth doing more than twice, it goes here. The agent picks up workflows by name; the user triggers them by name.

## What goes here

- One file per workflow: `name-of-workflow.md`.
- Each file: trigger → preconditions → steps → exit criteria → failure handling.
- Cross-references to layers 3 (Capabilities used), 6 (where humans approve), and 7 (retro hooks).

## Existing template-level workflows

- `.cursor/skills/verification-loop/` — pre-PR validation pass.
- `.cursor/skills/deslop/` — strip narration & dead defensive code.
- `.cursor/skills/search-first/` — check before writing new utilities.
- `.claude/commands/loop-on-ci.md` — watch CI, fix, resolve threads, repeat.
- `.claude/commands/vercel-setup.md` — Vercel project bootstrap.

Document **project-specific** workflows here. Don't duplicate the template ones — link to them.

## Files

- `workflow.md` — index.
