# Shape Spec

Gather context and structure a plan for non-trivial work. **Run this command while in plan mode.**

## Important Guidelines

- **Always use AskUserQuestion** when asking the user anything
- **Offer suggestions** the user can confirm, adjust, or correct
- **Keep it lightweight** — this is shaping, not exhaustive documentation

## Prerequisites

This command **must be run in plan mode**. Check before doing anything; if not in plan mode, stop and tell the user:

```
Shape-spec must be run in plan mode. Enter plan mode, then run /shape-spec again.
```

## Process

### Step 1: Clarify Scope

Use AskUserQuestion:

```
What are we building? Describe the feature or change.
```

Ask 1–2 follow-ups only if scope is unclear (new feature vs. change, expected outcome, constraints).

### Step 2: Visuals

```
Any visuals to reference? (mockups, screenshots, "none")
```

If provided, note them for the spec folder's `visuals/`.

### Step 3: Reference Implementations

```
Similar code in this codebase to reference?
e.g. "the comments feature is similar", "src/features/notifications uses the pattern"
```

If references are provided, read them before drafting tasks.

### Step 4: Product Context

If `agent-os/product/` has populated files, read `mission.md`, `roadmap.md`, `tech-stack.md` and ask:

```
I found product context. Should this feature align with specific product goals?
Key points: [summarize]
```

If `agent-os/product/` is empty/placeholder, skip.

### Step 5: Surface Relevant Standards

Read `agent-os/standards/index.yml`. Match descriptions to the feature. Ask:

```
These standards may apply:
1. api/response-format — API envelope structure
2. api/error-handling — error codes
3. database/migrations — migration patterns

Include these? (yes / adjust)
```

Read the confirmed standards into context. (Internally this is the same logic as `/inject-standards` in shaping mode.)

### Step 6: Generate Spec Folder Name

Format: `YYYY-MM-DD-HHMM-<feature-slug>/`

- Date/time = current timestamp
- Slug derived from feature description (lowercase, hyphens, max 40 chars)

Example: `2026-05-04-1430-user-comment-system/`

If `agent-os/specs/` doesn't exist, create it.

### Step 7: Structure the Plan

Build the plan. **Task 1 always saves the spec docs.**

```
## Task 1: Save Spec Documentation

Create agent-os/specs/<folder>/ with:
- plan.md         — this full plan
- shape.md        — scope, decisions, context from our conversation
- standards.md    — relevant standards that apply
- references.md   — pointers to reference implementations studied
- visuals/        — any mockups or screenshots provided

## Task 2: [first implementation task]
...
```

### Step 8: Complete the Plan

Fill in remaining tasks based on scope (Step 1), references (Step 3), and standards (Step 5). Each task: specific and actionable.

### Step 9: Ready for Execution

```
Plan complete. When you approve and execute:
1. Task 1 saves all spec documentation first.
2. Implementation tasks proceed.
Ready? (approve / adjust)
```

## Output Structure

```
agent-os/specs/<YYYY-MM-DD-HHMM-feature-slug>/
├── plan.md
├── shape.md
├── standards.md
├── references.md
└── visuals/
```

### shape.md template
```markdown
# <Feature Name> — Shaping Notes

## Scope
[what we're building]

## Decisions
- [key decisions]
- [constraints noted]

## Context
- Visuals: [list, or "None"]
- References: [code references studied]
- Product alignment: [notes, or "N/A"]

## Standards Applied
- api/response-format — [why it applies]
```

### standards.md template
```markdown
# Standards for <Feature Name>

## api/response-format
[full content of the standard file]

## api/error-handling
[full content of the standard file]
```

### references.md template
```markdown
# References for <Feature Name>

## <Reference 1>
- Location: src/features/comments/
- Relevance: [why this matters]
- Key patterns: [what to borrow]
```

## Tips

- Keep shaping fast — capture enough to start, refine while building.
- Visuals are optional; not every feature needs mockups.
- Standards guide, not dictate.
- Specs are the audit trail — months later, anyone can find this folder and understand what was built and why.

---

*Adapted from [buildermethods/agent-os](https://github.com/buildermethods/agent-os) v3 (MIT, © Builder Methods).*
