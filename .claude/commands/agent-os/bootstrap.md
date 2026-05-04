# Agent OS — Bootstrap

Interview-driven setup of all seven Agent OS layers in `agent-os/`. Run this once per project, or after a major shift (new role, new product, new team).

Based on the framework presented by **Nufar Gaspar** on **The AI Daily Brief** (host: Nathaniel Whittemore), episode *"How To Build a Personal Agentic Operating System"*.

## Important guidelines

- **Always use the `AskUserQuestion` tool** for prompts — one question at a time, never batch.
- **Default to short answers.** Each layer file should be scannable; long-form prose hurts agents that read it later.
- **Skip layers that aren't ready.** Layer 7 (Compounding) is empty until you've actually run a session — that's expected.
- **Never overwrite without confirming.** If a layer file already has real content (not just template placeholders), ask before replacing.

## Process

### Step 0 · Pre-flight

1. Confirm `agent-os/` exists and contains the seven numbered folders. If missing, stop and tell the user the template hasn't been initialized yet.
2. For each layer file, check whether it has real content (anything beyond the HTML-comment placeholders). Show the user a quick status:

   ```
   Current Agent OS state:
   ✓ 01-identity/identity.md           — populated
   ○ 02-context/context.md              — placeholder
   ○ 03-capabilities/capabilities.md    — placeholder
   ○ 04-workflow/workflow.md            — placeholder
   ○ 05-interface/interface.md          — placeholder
   ○ 06-human-in-the-loop/...           — placeholder
   ○ 07-compounding/                    — empty (expected; populated by /agent-os-retro)
   ```

3. Use `AskUserQuestion`:

   ```
   How do you want to proceed?
   1. Bootstrap from scratch — overwrite anything populated.
   2. Fill only the empty layers.
   3. Pick specific layers to (re)fill.
   4. Cancel.
   ```

### Step 1 · Layer 1 — Identity

If Identity is selected, ask one question at a time:

1. **Role.** "In one sentence, what role should the agent play in this project?"
2. **Communication style.** "Tone (peer / formal / blunt), length default (terse / explanatory), language for UI/code/docs?"
3. **Values.** "What does the agent optimize for, and what does it refuse to trade off?"
4. **Hard rules.** "List invariants the agent must enforce even if you ask otherwise. Examples: no `--no-verify`, no committing `.env*`, always verification-loop before reporting done."

Draft `agent-os/01-identity/identity.md`. Show the draft. Confirm before writing.

### Step 2 · Layer 2 — Context

1. **Mission/goal.** "What's this project actually trying to do, in two or three sentences?"
2. **Active priorities.** "What are the top 3 priorities right now?"
3. **Recent decisions.** "Any decisions in the last ~30 days the agent should know about?"
4. **External authorities.** "Where does authoritative info live? (Confluence, Notion, ADR folder, project board, etc.)"
5. **Open questions.** "Known unknowns the agent should NOT assume answers to?"

Date the file (`_Last updated: <today>_`). Write `agent-os/02-context/context.md`. Offer to also create `priorities.md`, `recent-decisions.md`, etc. as separate files if the answers are substantial.

### Step 3 · Layer 3 — Capabilities

Auto-detect what's available, then confirm:

1. **Built-in tools** — list what the harness provides (Read/Edit/Write/Bash/Agent/etc.).
2. **MCP servers** — read `.claude/settings*.json` (or equivalent) for configured servers.
3. **Slash commands** — list every `.md` in `.claude/commands/`.
4. **Skills** — list every dir in `.cursor/skills/` and `.claude/skills/`.

Show the gathered list and ask:

```
For each capability:
- Trust level? (auto / asks-first / explicit-only)
- Anything to remove or restrict?
- Anything missing the agent uses but isn't listed?
```

Write `agent-os/03-capabilities/capabilities.md` with one bullet per capability, including scope and trust level.

### Step 4 · Layer 4 — Workflow

1. List template-provided workflows (verification-loop, deslop, search-first, loop-on-ci) — already documented elsewhere; just link from `workflow.md`.
2. Ask: **"What project-specific named workflows exist or should exist?"** (e.g. release checklist, incident response, weekly digest, customer-issue triage).
3. For each: trigger, steps (or pointer to a doc), human approval gate, retro hook.

Write `agent-os/04-workflow/workflow.md` as an index; offer to create one file per workflow if the user names more than two.

### Step 5 · Layer 5 — Interface

Walk through channels:

1. **Claude Code (CLI)** — when used, default output style, ask-vs-act default.
2. **Cursor (IDE)** — when used, output style.
3. **GitHub PR comments / reviews** — length cap, formatting, when to comment vs. skip.
4. **Other** — terminal, voice, anything else.
5. **Background activity** — should the agent subscribe to PR webhooks once a PR is open? When should it speak up vs. stay quiet?

Write `agent-os/05-interface/interface.md`.

### Step 6 · Layer 6 — Human-in-the-Loop

1. **Approval gates.** "Which actions must always be confirmed first?" Defaults to: push, force-push, reset --hard, deletions, DB migrations, posting to external services, merging PRs.
2. **Review checkpoints.** Auto-detect from `.husky/`, `.github/workflows/`, `.coderabbit.yaml`. Confirm with the user.
3. **Escalation triggers.** "When should the agent stop and ask?" (large diff, missing tests, contradicting standard, secret in diff, unknown branch/file).

Write `agent-os/06-human-in-the-loop/human-in-the-loop.md`.

### Step 7 · Layer 7 — Compounding

Don't fill content here; this layer is populated by `/agent-os-retro` after real sessions. Confirm the structure exists:

```
agent-os/07-compounding/
├── README.md
├── deltas-applied.md
└── retros/
    └── (empty until first retro)
```

### Step 8 · Confirm completion

Show what was written:

```
✓ Agent OS bootstrapped:
  agent-os/01-identity/identity.md
  agent-os/02-context/context.md
  agent-os/03-capabilities/capabilities.md
  agent-os/04-workflow/workflow.md
  agent-os/05-interface/interface.md
  agent-os/06-human-in-the-loop/human-in-the-loop.md
  agent-os/07-compounding/ (ready for /agent-os-retro)

Next:
- Reference layer files in your prompts: @agent-os/01-identity/identity.md
- Run /agent-os-retro after meaningful sessions to feed lessons back in.
```

## Tips

- A short, sharp identity beats a long bland one.
- Date everything in Layer 2. Stale context is worse than no context.
- Layer 3 should be auditable: a human should be able to scan it and answer "what can this agent do?" in under a minute.
- Don't try to capture every workflow. Capture the *named* ones — the ones worth a name.
