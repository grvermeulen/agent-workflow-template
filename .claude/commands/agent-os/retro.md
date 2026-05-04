# Agent OS — Retro

Layer 7 (Compounding) in action. After a meaningful session, sprint, or incident, run a short retro and feed concrete deltas back into layers 1–6.

Without this command the OS stops compounding. With it, every session leaves the OS sharper than it found it.

## Important guidelines

- **Be short.** A retro that takes 30 minutes won't get run. Aim for ≤ 5 minutes.
- **Every retro produces deltas.** A retro without proposed changes to a layer is a journal, not a feedback loop. If there are genuinely no deltas, say so explicitly.
- **Confirm before writing.** Every proposed delta gets `AskUserQuestion` confirmation before the layer file changes.

## Process

### Step 1 · Frame the retro

Use `AskUserQuestion`:

```
What are we retro-ing?
1. The session we just finished.
2. The current PR / branch.
3. A sprint or named period (you specify).
4. An incident.
```

Then:

```
In one or two sentences: what was the goal, and was it met?
```

### Step 2 · Surface what happened

Pull from the conversation (and PR/branch context if relevant):

- What worked?
- What didn't?
- What surprised you?
- What did the agent get wrong, and why?
- What was missing — context, capability, gate — that would have saved time?

If it's a PR retro, also check: CI failures, review comments, CodeRabbit findings, time spent looping.

Present a short summary back to the user and ask: "Anything to add or correct?"

### Step 3 · Propose deltas

For each lesson, propose a concrete change to a specific layer file. Use `AskUserQuestion` per delta:

```
Delta 1 / 5
Lesson: agent kept proposing /no-verify after pre-commit failures.
Layer:  06-human-in-the-loop/human-in-the-loop.md
Change: add escalation trigger — "if a hook fails, never propose --no-verify; surface root cause instead."

Apply? (yes / edit / skip)
```

Map lessons to layers using this guide:

| Lesson type | Likely layer |
|---|---|
| "Agent didn't know X" → add fact | 02-context |
| "Agent reinvented Y" → declare existing tool | 03-capabilities |
| "We do this same thing every week" → name it | 04-workflow |
| "Agent was too chatty / too quiet in channel Z" | 05-interface |
| "Agent did Q without asking, that was risky" | 06-human-in-the-loop |
| "Agent's tone/role was off" | 01-identity |
| "Capability is deprecated / never used" | 03-capabilities (remove) |

### Step 4 · Apply deltas

For each confirmed delta:

1. Read the target layer file.
2. Apply the change as a precise edit (don't rewrite the whole file).
3. Update the file's `_Last updated: YYYY-MM-DD_` line.

### Step 5 · Write the retro file

Write `agent-os/07-compounding/retros/YYYY-MM-DD-<short-slug>.md`:

```markdown
# Retro — <slug>

_Date: YYYY-MM-DD_
_Source: <session / PR #N / sprint name / incident>_

## Goal

<one or two sentences>

## What worked

- ...

## What didn't

- ...

## Surprises

- ...

## Deltas applied

- 02-context/context.md — added priority "ship Agent OS template by Friday".
- 06-human-in-the-loop/human-in-the-loop.md — tightened: never propose `--no-verify`.
- 03-capabilities/capabilities.md — removed `mcp__foo` (deprecated).

## Deltas considered but skipped

- (with one-line reason)
```

### Step 6 · Append to deltas-applied.md

Add an entry to `agent-os/07-compounding/deltas-applied.md`:

```markdown
## YYYY-MM-DD — <slug>

- **Layer:** 02-context — added priority.
- **Layer:** 06-human-in-the-loop — tightened.
- **Layer:** 03-capabilities — removed deprecated MCP.

Source retro: `retros/YYYY-MM-DD-<slug>.md`
```

### Step 7 · Confirm

```
✓ Retro saved: agent-os/07-compounding/retros/YYYY-MM-DD-<slug>.md
✓ <N> deltas applied across <M> layers.

Next time the agent reads those layers, the lessons are baked in.
```

## When to run

- After finishing a non-trivial PR.
- After an incident or unexpected outage.
- At the end of a sprint or working session ≥ ~1 hour.
- When you notice yourself correcting the agent on the same thing twice.

## Anti-patterns

- **Retro without deltas** — say so out loud; don't pretend lessons exist.
- **Vague deltas** — "be more careful with git" is not a delta. "Layer 6: ask before any `git reset` flavour" is.
- **Batching weeks of retros** — one focused retro beats one bloated one. Run more often.
