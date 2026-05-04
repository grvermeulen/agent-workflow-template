# Inject Standards

Inject the standards relevant to the current task into context, formatted for the situation (conversation, skill, or plan).

## Usage

### Auto-suggest mode (no args)
```
/inject-standards
```
Analyzes the conversation and suggests matches from `agent-os/standards/index.yml`.

### Explicit mode (with args)
```
/inject-standards api                            # all .md in standards/api/
/inject-standards api/response-format            # single file
/inject-standards api/response-format api/auth   # multiple files
/inject-standards root                           # all .md directly in standards/
/inject-standards root/naming                    # single root-level file
```

`root` is reserved for files directly in `agent-os/standards/` — do not create an actual folder named `root`.

## Process

### Step 1: Detect Scenario

Three scenarios:

1. **Conversation** — regular chat / implementation work
2. **Creating a Skill** — building a `.claude/skills/<name>/SKILL.md` or `.cursor/skills/<name>/SKILL.md`
3. **Shaping/Planning** — in plan mode, building a spec, running `/shape-spec`

Detection logic:

- In plan mode OR conversation mentions "spec", "plan", "shape" → **Shaping/Planning**
- Conversation mentions creating a skill or editing `skills/` → **Creating a Skill**
- Otherwise → **ask** (don't assume conversation by default)

If unclear, AskUserQuestion:

```
How should I format the injected standards?
1. Conversation — read into our chat
2. Skill — output @-references for a skill file
3. Plan — output @-references for a plan/spec
```

### Step 2: Read the Index (auto-suggest mode)

Read `agent-os/standards/index.yml`. If missing or empty:

```
No standards index found. Run /discover-standards to create standards,
or /index-standards if files exist without an index.
```

### Step 3: Analyze Work Context

Identify what the user is working on: type of work (API, DB, UI), technologies mentioned, the goal.

### Step 4: Match and Suggest

Match index descriptions against the context. Use AskUserQuestion to present 2–5 options:

```
Based on your task, these standards may apply:
1. api/response-format — API response envelope, status codes
2. api/error-handling — error codes, exception handling
3. global/naming — file, variable, class naming

Inject these? (yes / just 1 and 3 / add: database/migrations / none)
```

### Step 5: Inject Based on Scenario

#### Conversation
Read each selected standard and announce:
```
I've read these standards relevant to our work:

--- Standard: api/response-format ---
[full content]
--- End Standard ---

Key points: [2–3 bullets]
```

#### Creating a Skill
Ask via AskUserQuestion:
```
1. References — @-paths to standards (skill stays light, standards stay in sync)
2. Copy content — paste full standards in (self-contained, won't update)
```

If References:
```
Add to your skill:
@agent-os/standards/api/response-format.md
@agent-os/standards/api/error-handling.md
```

If Copy: paste full file contents inside `--- Standard: ... ---` blocks.

#### Shaping/Planning
Same References vs. Copy choice as above. References are usually preferred — they keep the plan small and fresh.

### Step 6: Surface Related Skills (conversation only)

If `.claude/skills/` or `.cursor/skills/` contains relevant skills, surface them but don't auto-invoke:

```
Related skills you might want:
- create-api-endpoint — scaffolds endpoints following these standards
```

## Explicit Mode

Skip suggestion, still detect scenario.

1. Parse args (`folder`, `folder/file`, `root`, `root/file`).
2. Validate paths. If missing, suggest available alternatives.
3. Inject using the same scenario formatting above.

## Tips

- Run **early** in a task — before implementation.
- If you know the standards, use explicit mode.
- If suggestions seem stale, run `/index-standards`.

## Integration

Called internally by `/shape-spec`. Invoke directly any time standards are needed in context.

---

*Adapted from [buildermethods/agent-os](https://github.com/buildermethods/agent-os) v3 (MIT, © Builder Methods).*
