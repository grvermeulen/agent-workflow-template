# Discover Standards

Extract tribal knowledge from the codebase into concise, documented standards under `agent-os/standards/`.

## Important Guidelines

- **Always use AskUserQuestion tool** when asking the user anything
- **Write concise standards** — Standards are injected into AI context windows; every word costs tokens
- **Offer suggestions** — Present options the user can confirm, choose between, or correct

## Process

### Step 1: Determine Focus Area

If the user specified an area in the command args, skip to Step 2.

Otherwise:

1. Analyze the codebase structure (folders, file types, patterns).
2. Identify 3–5 major areas. Examples:
   - **Frontend:** UI components, styling, state management, forms, routing
   - **Backend:** API routes, database/models, authentication, jobs
   - **Cross-cutting:** error handling, validation, testing, naming, file structure
3. Use AskUserQuestion to present them and pick one.

### Step 2: Analyze & Present Findings

1. Read 5–10 representative files in the chosen area.
2. Look for patterns that are **unusual, opinionated, tribal, or repeated**. Skip generic framework defaults.
3. Use AskUserQuestion to list 2–5 candidate standards and ask which to document.

### Step 3: Ask Why, Then Draft Each Standard

For **each** selected standard, complete the full loop before moving on:

1. Ask 1–2 "why" questions via AskUserQuestion (purpose, exceptions, common mistakes).
2. Wait for the response.
3. Draft the standard.
4. Confirm via AskUserQuestion before writing.
5. Write the file.

Don't batch all questions upfront.

### Step 4: Create the Standard File

For each standard:

1. Pick the folder (create if needed): `api/`, `database/`, `javascript/`, `css/`, `backend/`, `testing/`, `global/`, or root-level for cross-cutting.
2. If a related file already exists, append rather than create a duplicate.
3. Confirm the draft with AskUserQuestion before writing.
4. Write to `agent-os/standards/<folder>/<name>.md`.

### Step 5: Update the Index

After all standards are written:

1. Scan `agent-os/standards/` for `.md` files.
2. For each new file without an index entry, propose a one-sentence description via AskUserQuestion.
3. Update `agent-os/standards/index.yml`. Alphabetize folders, then files.

### Step 6: Offer to Continue

```
Standards created for [area]:
- api/response-format.md
- api/error-codes.md

Discover standards in another area, or done?
```

## Writing Concise Standards

- **Lead with the rule**, explain why second (only if non-obvious)
- **Show, don't tell** — code examples beat prose
- **Skip the obvious** — don't document what the code already makes clear
- **One concept per file**
- **Bullet points over paragraphs**

**Good:**
```markdown
# Error Responses

Use error codes: `AUTH_001`, `DB_001`, `VAL_001`

\`\`\`json
{ "success": false, "error": { "code": "AUTH_001", "message": "..." } }
\`\`\`

- Always include both code and message.
- Log full error server-side, return safe message to client.
```

**Bad:** three paragraphs explaining error-handling philosophy.

## Output Location

- Standards: `agent-os/standards/<folder>/<name>.md`
- Index: `agent-os/standards/index.yml`

---

*Adapted from [buildermethods/agent-os](https://github.com/buildermethods/agent-os) v3 (MIT, © Builder Methods).*
