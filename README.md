# Agent Workflow Template

A GitHub template repo that bootstraps a new project with the agent/AI-assisted-development workflow conventions, rules, and CI bots that I prefer to work with. Copy this template via "Use this template" → "Create a new repository" and fill in the project-specific bits.

## What's in here

| Path | Purpose |
|---|---|
| `AGENTS.md` | Source of truth for agent-collaboration preferences (workflow, review etiquette, "deslop" pass) plus a placeholder for project-specific Workspace Facts. **Edit this first** in a new project. |
| `.coderabbit.yaml` | CodeRabbit config: profile `chill`, docstring coverage warning at 80%, custom finishing-touches `deslop` and `nl-check`. |
| `.cursor/rules/` | Agent-agnostic coding rules (`always.md`, `agentic-workflow.mdc`, `api-design.mdc`, `backend-patterns.mdc`, `code-review.mdc`, `database-migrations.mdc`, `deslop.mdc`, `frontend-patterns.mdc`, `search-first.mdc`, `security-checklist.mdc`, `verification-loop.mdc`, `agent-hooks.md`). Cursor reads `.mdc` files automatically. |
| `.cursor/skills/` | Reusable agent skills: `code-review`, `deslop`, `search-first`, `verification-loop`. |
| `.cursor/settings.json` | Cursor preferences (e.g. `iterateOnLints`, plugin enables). |
| `.cursor/hooks.ts` | Experimental Cursor hooks: blocks destructive shell commands; runs linters/formatters after edits. |
| `.claude/commands/loop-on-ci.md` | Claude Code slash command that watches PR CI, fixes failures, addresses bot review feedback, and iterates until green. |
| `.claude/commands/vercel-setup.md` | Claude Code slash command that bootstraps Vercel for a new repo: creates the project, links it to GitHub, sets production env vars (and asks about preview), then triggers the first deploy. |
| `.husky/pre-commit` | Prettier on staged files → merge-conflict marker check → ESLint → `tsc --noEmit` → `vitest run`. |
| `.husky/pre-push` | `npm run docs:check`. |
| `.github/workflows/agentic-ci.yml` | Lint / typecheck / build / test verify pipeline. |
| `.github/workflows/ai-review.yml` | AI-driven PR review job. |
| `.github/workflows/coderabbit-major-gate.yml` | Blocks merge when CodeRabbit reports a Major/Critical issue. |
| `.github/workflows/copilot-code-review.yml` | GitHub Copilot review trigger workflow. |
| `.github/workflows/copilot-setup-steps.yml` | Reusable setup steps for Copilot/CI. |
| `.github/workflows/post-merge-verify.yml` | Post-merge verification on the default branch. |

## After creating a new repo from this template

1. Open `AGENTS.md` and replace the `Learned Workspace Facts` placeholder section with facts for the new project (repo, framework, locale, structure conventions). Leave `Learned User Preferences` intact unless you actually want to change a preference.
2. Make sure your `package.json` defines the npm scripts that `.husky/` and the workflows reference: `lint`, `format`, `format:fix`, `test`, `check:merge-conflicts`, `docs:check` (or remove the references you're not using).
3. Run `husky install` (or `npm run prepare`) once after first install so the hooks are wired into `.git/hooks/`.
4. Configure CodeRabbit in your repo settings if you haven't already; the `.coderabbit.yaml` here will be picked up on first PR.
5. Configure repo secrets the workflows need (e.g. `OPENAI_API_KEY` if `ai-review.yml` uses it; review each workflow before enabling).
6. **If you're hosting on Vercel:** run the `/vercel-setup` slash command (or have an agent run it). It walks an agent through creating the Vercel project, linking the GitHub repo, setting production env vars, asking whether a preview environment is wanted, and triggering the first deploy. See `.claude/commands/vercel-setup.md`.

## Things this template intentionally does NOT include

- Application source code, tests, framework configs (Next.js, Prisma, ESLint, etc.) — bring your own per project.
- Provider-specific workflows (Sentry issue sync, Vercel deployment monitor, Neon branch cleanup) — copy these from a reference project only when you actually adopt those providers.
- `package.json`, `tsconfig.json`, lockfiles, etc.

## Notes

- Some hooks/workflows assume a Node.js + Next.js style project. They'll need light adjustment for non-Node projects but the structure is reusable.
- `.cursor/hooks.ts` is marked "Experimental" by Cursor and may need updates for newer Cursor versions.
- The `loop-on-ci` slash command is for Claude Code (the CLI). Other agents may need their own equivalent.
