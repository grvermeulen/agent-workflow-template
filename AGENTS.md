## Learned User Preferences

- CodeRabbit docstring coverage is configured in `.coderabbit.yaml` (threshold **80%**); add JSDoc on exported `src/**/*.ts(x)` symbols and use CodeRabbit "Generate docstrings" when needed.
- Use GitHub CLI for GitHub actions (PRs, checks, comments, merges) when possible.
- Use the `loop-on-ci` workflow when asked: watch CI, inspect failures, apply focused fixes, and iterate until green. Voor **CodeRabbit** (en andere PR-bots zoals Cursor bot): na het verwerken van review-opmerkingen in code moeten de bijbehorende **GitHub-reviewthreads ook op resolved gezet worden** — dat hoort bij dezelfde CI/PR-ronde, niet als aparte stap later. Gebruik bijv. GraphQL `resolveReviewThread` met `gh api graphql` zodat de PR zichtbaar "af" is.
- For a brand-new repo where Vercel hosting is in scope: run the `vercel-setup` slash command (`.claude/commands/vercel-setup.md`). It creates the Vercel project, links it to the GitHub repo, sets production env vars, asks whether a preview environment is wanted, and triggers the first deploy.
- When syncing Vercel environment configuration, treat remote settings as source of truth and sync local values from remote.
- Use the GitHub CLI when GitHub information is needed.
- Follow the provided Sentry instrumentation patterns for Next.js projects when Sentry is in scope.
- For test coverage analysis, use only tests listed in `enabled_tests.txt` and format reports like `coverage_report.md` (when applicable to the project).
- Run a de-slop pass after AI-assisted implementation to remove narration comments, defensive checks the type system already covers, and tests that test the language rather than business logic.
- Research existing solutions in `src/lib/` and npm before writing new utilities or helpers.
- Run the verification loop (build, typecheck, lint, test, security scan, diff review) before creating or updating PRs.
- **Geen BugBot Pro**: gebruik de gratis stack — CodeRabbit op PRs, Agentic CI, GitHub Copilot-review (workflow), en `.cursor/rules` / `AGENTS.md` in Cursor.
- **Vercel Rolling Releases**: niet gebruiken zonder Pro-plan; gewone production deploys blijven voldoende.
- **Agent OS (7-layer personal agentic OS)**: structuur uit *The AI Daily Brief* (Nufar Gaspar / Nathaniel Whittemore). Per project leeft het in `agent-os/01-identity` t/m `07-compounding`. Bij start van non-triviaal werk: lees of `@`-mention de relevante laagbestanden (minimaal `01-identity/identity.md` en `02-context/context.md`). Vóór destructieve of externe acties: check `06-human-in-the-loop/human-in-the-loop.md` op approval gates en escalation triggers. Na een betekenisvolle sessie: `/agent-os-retro` om concrete deltas terug te schrijven naar lagen 1–6 — een retro zonder deltas is een dagboek, geen feedback loop. Bootstrappen van een nieuw project: `/agent-os-bootstrap`. Authority: `AGENTS.md` > `agent-os/01-identity` > `agent-os/02–06` > `.cursor/rules/`. Agent OS-lagen beschrijven *wie de agent is en wat hij weet*; cursor-rules beschrijven *hoe code geschreven moet worden* — ze conflicteren niet, ze beantwoorden andere vragen.

## Learned Workspace Facts

<!-- Replace this section with facts about the new project. Examples below. -->

- This repository is `<owner>/<repo>`.
- The project targets Node.js `<version>` (`package.json` `engines`) and is built with `<framework>`.
- CI includes an "Agentic CI" verify pipeline (lint, typecheck, build, test) and any deployment provider checks (e.g. Vercel).
- Technical documentation is organized under `docs/`.
- All user-facing strings must be in `<locale>`.
- Business logic belongs in `src/lib/services/` and `src/lib/*.ts`, not in API routes or components.
- API routes should be thin handlers: parse request, check auth, validate with a schema library, delegate to a service, return response.
- Shared utilities live in `src/lib/`.
- Validation schemas live in `src/lib/schemas/`.
- External services and their integration points (note any wrappers added to `src/lib/`).
- Cache failures must never propagate to the caller — wrap in try/catch, log, continue.
- Pre-commit hooks run Prettier, ESLint, `tsc --noEmit`, and the test runner (see `.husky/pre-commit`).
- The `.cursor/rules/` directory contains agent-agnostic coding rules covering: security, API design, frontend/backend patterns, database migrations, verification loops, search-first workflow, code review, and de-slop cleanup.
- The `agent-os/` directory implements a 7-layer personal agentic operating system (Nufar Gaspar / *The AI Daily Brief*): `01-identity`, `02-context`, `03-capabilities`, `04-workflow`, `05-interface`, `06-human-in-the-loop`, `07-compounding`. Each layer has a `README.md` explaining intent and one or more starter files (placeholders by default). Layers 1–6 are filled by `/agent-os-bootstrap` and updated by `/agent-os-retro` (which writes to `07-compounding/`). See `agent-os/README.md` and `.cursor/rules/agent-os.mdc`.
