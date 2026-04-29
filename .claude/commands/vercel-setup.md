---
description: One-time Vercel project bootstrap for a new repo. Creates the project, links it to the GitHub repo, sets production env vars, optionally sets up preview env, and triggers the first deploy.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, AskUserQuestion, TaskCreate, TaskUpdate, TaskList
argument-hint: "[project-name]   # optional, defaults to the GitHub repo name"
---

# `/vercel-setup`

You're bootstrapping the Vercel side of a brand-new repository. Goal: by the end of this command, the repo is linked to a Vercel project, production env vars are set, the user has decided whether to set up a preview environment, and the first production deploy is queued. Be deliberate — env vars in production are sensitive, so confirm before writing each one and never invent values.

## Preflight

1. **Confirm tooling.** Run `vercel --version` and `gh --version`. If either is missing, stop and tell the user to install it.
2. **Confirm auth.** Run `vercel whoami`. If not logged in, instruct the user to run `vercel login` in their terminal (use the `! vercel login` prefix for inline execution). Likewise check `gh auth status`.
3. **Confirm we're at the repo root.** Look for `AGENTS.md` and `.git/`. Refuse to continue from a sub-directory — the user should `cd` to the repo root first.
4. **Read `AGENTS.md` and `README.md`.** Capture any project-specific Vercel guidance the user has documented (e.g. desired Node version, framework override, custom build command).
5. **Determine the GitHub remote.** `gh repo view --json owner,name,defaultBranchRef --jq '{owner: .owner.login, name, defaultBranch: .defaultBranchRef.name}'`. If there's no remote, stop — the repo must be on GitHub before linking.

## 1. Create or link the Vercel project

1. **Choose a project name.** Default: the GitHub repo name. If `$ARGUMENTS` is provided, use that. Confirm with the user via `AskUserQuestion` if the chosen name might collide with an existing project.
2. **Check if a Vercel project with that name already exists.** `vercel projects ls 2>&1 | grep -i "<name>" || true`. If yes, ask the user whether to attach to it or pick a different name.
3. **Link.** From the repo root: `vercel link --yes --project <name>`. This writes `.vercel/project.json` locally. If `--project` flag isn't accepted, run `vercel link` interactively (`!`-prefix it for the user).
4. **Connect the GitHub repo to the Vercel project.** Newer CLI: `vercel git connect`. Older: this happens automatically through `vercel link` when run inside a `git`-tracked dir. Verify with `vercel project inspect <name>` or via the Vercel dashboard URL printed by the link command.
5. **Confirm in `.gitignore`** that `.vercel/` is ignored (the template's `.gitignore` already does this — sanity check).

## 2. Inventory env vars

Required env vars are unique per project. Discover them:

1. **Look for an `.env.example`** (or `.env.local.example`). If present, treat each non-comment, non-empty line's KEY as a required var.
2. **Otherwise, grep for `process.env.`** in `src/` (and `app/` if applicable):
   ```bash
   grep -rhoE "process\.env\.[A-Z_][A-Z0-9_]*" src/ 2>/dev/null | sort -u
   ```
   Filter out clearly-built-in ones (`NODE_ENV`, `PORT`, `VERCEL_*`, `NEXT_PUBLIC_VERCEL_*`).
3. **Show the user the proposed list** and ask via `AskUserQuestion` which to set in production. Allow them to add ones the grep missed (e.g. third-party API keys not yet referenced in code).

## 3. Set production env vars

For each var the user confirmed:

1. **Ask for the value** via `AskUserQuestion` (use a single-line free-text question). Treat the response as a secret — never echo it back, never log it.
2. **Write it.** Pipe the value via stdin so it's not in the shell argv:
   ```bash
   printf '%s' "$VALUE" | vercel env add <KEY> production
   ```
   Use `printf '%s'` (no trailing newline). If the value already exists, the CLI will prompt; pass `--yes` only when the user has explicitly confirmed overwrite.
3. **Verify** with `vercel env ls production | grep <KEY>` after each write so a typo or auth issue surfaces immediately.

If the project uses Vercel Marketplace integrations (Postgres, Blob, Auth, etc.), say so to the user — those integrations auto-provision their own env vars, so the user shouldn't add e.g. `DATABASE_URL` manually if they intend to attach Vercel Postgres.

## 4. Preview environment — ask the user

Use `AskUserQuestion` to ask:

> "Do you also want a preview environment with separate env vars (e.g. preview database, sandbox API keys)?"
>
> Options:
> 1. **Yes — set preview env vars now** (you'll be asked for each value, may differ from production)
> 2. **Yes — copy production values to preview** (same secrets, no extra prompts; only do this if production values are safe to use in previews)
> 3. **No, skip preview** (you can run `/vercel-setup` again later or set them manually)

Branch:

- **Option 1**: repeat step 3 but with `vercel env add <KEY> preview` for each var.
- **Option 2**: for each prod-set var, fetch via `vercel env pull .env.preview-staging --environment=production` and re-add to preview, OR (cleaner) just confirm by pulling the prod values into a temp file, then loop and write to preview. **Warn the user explicitly** before doing this — production secrets in preview is a real risk.
- **Option 3**: skip.

## 5. Optional first-run niceties

Ask whether to:

- **Set the production branch** if it isn't `main`. `vercel project edit <name> --git-production-branch=<branch>` if available; otherwise instruct the user to set it in the dashboard.
- **Configure Node version** in `vercel.json` or in project settings, matching `package.json`'s `engines.node`.
- **Add `vercel.json`** for monorepo/install/build overrides if the project needs them.

## 6. Trigger the first deploy

1. **Sanity-build locally** if a build script exists: `npm run build`. If it fails, fix before deploying.
2. **Deploy:**
   ```bash
   vercel deploy --prod --yes
   ```
3. **Watch.** `vercel logs --follow` or open the inspector URL the deploy returned. Stop watching once `READY`.
4. **Smoke-test** the production URL with a `curl` of `/` or whatever health route exists. Confirm 200 OK and reasonable HTML/JSON.

## Stop conditions

- Project linked, env vars set in production, preview decision made (yes-now / yes-from-prod / skip), first deploy is `READY`, and a smoke test passes.

Print a short summary: project URL, production URL, list of env keys set per scope, deploy ID, and any follow-ups the user asked you to defer.

## Conventions

- **Never paste secret values into the terminal as a positional arg.** Always pipe via `printf | vercel env add` so they don't show up in shell history.
- **Never read `.env`/`.env.local` and bulk-upload** without showing the user the list of keys first and confirming. Some local-only vars don't belong in Vercel.
- **Don't enable production deploys before env vars are set** — a deploy missing `DATABASE_URL` or auth secrets will fail or, worse, run with placeholder values.
- **Marketplace integrations first.** If the project will use Vercel Postgres / Blob / KV / Auth, add the integration in the dashboard before setting env vars manually, so the integration's auto-injected vars don't collide.
- **Don't push to GitHub on the user's behalf** during this command. Linking and env-setting are Vercel-side; pushing code to a fresh repo is the user's first commit decision.

## When to bail out

- Vercel CLI errors that mention auth → tell the user to re-run `vercel login`.
- Project name collision the user hasn't resolved → stop and ask.
- Env var the user can't supply (e.g. doesn't have an API key yet) → set the others, list the missing ones in your final summary, and recommend a follow-up.
