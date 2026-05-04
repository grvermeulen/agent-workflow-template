# Index Standards

Rebuild and maintain `agent-os/standards/index.yml`. The index lets `/inject-standards` suggest relevant files without reading every standard.

## Process

### Step 1: Scan

List all `.md` files in `agent-os/standards/` and its subfolders. Files directly in `standards/` belong to the reserved `root` folder name (do not create an actual `root/` directory).

### Step 2: Load Existing Index

Read `agent-os/standards/index.yml`. Note which entries already have descriptions.

### Step 3: Identify Changes

- **New files** — no index entry yet
- **Deleted files** — index entry but file gone
- **Existing files** — keep as-is

### Step 4: Handle New Files

For each new file, read it and propose a one-sentence description via AskUserQuestion:

```
New standard needs indexing:
  File: api/response-format.md
Suggested: "API response envelope structure and error format"
Accept? (yes / type a better description)
```

Keep descriptions to one line — they're for matching, not documentation.

### Step 5: Handle Deleted Files

Remove stale entries automatically. Report what was dropped.

### Step 6: Write Updated Index

Generate `agent-os/standards/index.yml`:

```yaml
root:
  coding-style:
    description: General coding style, formatting, linting rules
  naming:
    description: File, variable, and class naming conventions

api:
  error-handling:
    description: Error codes, exception handling, error response format
  response-format:
    description: API response envelope, status codes, pagination

database:
  migrations:
    description: Migration file structure, naming, rollback patterns
```

Rules:
- Alphabetize folders, then files within each folder.
- File names without `.md` extension.
- One-line descriptions only.
- `root` (if present) comes first.

### Step 7: Report

```
Index updated:
  ✓ 2 new entries added
  ✓ 1 stale entry removed
  ✓ 8 entries unchanged
Total: 9 standards indexed
```

## When to Run

- After hand-editing files in `agent-os/standards/`
- If `/inject-standards` suggestions feel out of sync
- `/discover-standards` already calls this as its final step

---

*Adapted from [buildermethods/agent-os](https://github.com/buildermethods/agent-os) v3 (MIT, © Builder Methods).*
