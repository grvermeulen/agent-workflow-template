# Plan Product

Establish foundational product documentation through an interactive conversation. Creates mission, roadmap, and tech stack files in `agent-os/product/`.

## Important Guidelines

- **Always use AskUserQuestion tool** when asking the user anything
- **Keep it lightweight** — gather enough to create useful docs without over-documenting
- **One question at a time** — don't overwhelm with multiple questions

## Process

### Step 1: Check for Existing Product Docs

Check if `agent-os/product/` exists and contains any of these files with real content (template placeholders don't count):
- `mission.md`
- `roadmap.md`
- `tech-stack.md`

**If any files have real content**, use AskUserQuestion:

```
I found existing product documentation:
- mission.md: [exists/missing]
- roadmap.md: [exists/missing]
- tech-stack.md: [exists/missing]

Would you like to:
1. Start fresh (replace all)
2. Update specific files
3. Cancel
```

If option 2, ask which files to update and only gather info for those.
If option 3, stop here.

**If files are empty or contain only template placeholders**, proceed to Step 2.

### Step 2: Gather Product Vision (for mission.md)

Use AskUserQuestion, one question at a time:

1. **What problem does this product solve?**
2. **Who is this product for?**
3. **What makes your solution unique?**

### Step 3: Gather Roadmap (for roadmap.md)

Use AskUserQuestion, one question at a time:

1. **What are the must-have features for launch (MVP)?**
2. **What features are planned for after launch?** (or "none yet")

### Step 4: Establish Tech Stack (for tech-stack.md)

First check if `agent-os/standards/global/tech-stack.md` exists.

**If a tech-stack standard exists**, summarize it and ask:

```
I found a tech stack standard. Does this project use the same stack, or differ?
1. Same as standard (use as-is)
2. Different (I'll specify)
```

If different (or no standard exists), use AskUserQuestion:

```
What technologies does this project use?
- Frontend:
- Backend:
- Database:
- Other (hosting, APIs, tools):
```

### Step 5: Generate Files

Write `agent-os/product/mission.md`, `roadmap.md`, and `tech-stack.md` using the templates already in those files (replace the HTML comments with the gathered content).

### Step 6: Confirm Completion

```
✓ Product documentation created:
  agent-os/product/mission.md
  agent-os/product/roadmap.md
  agent-os/product/tech-stack.md

Review these files and edit directly, or run /plan-product again to update.
```

## Tips

- Brief answers are fine — docs can grow later.
- Skip a section with a placeholder like "To be defined" if needed.
- `/shape-spec` reads these files when planning features, so populate them before significant work.

---

*Adapted from [buildermethods/agent-os](https://github.com/buildermethods/agent-os) v3 (MIT, © Builder Methods).*
