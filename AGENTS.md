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
- **Agent OS (spec-driven workflow)**: voor non-triviale changes eerst Plan Mode in, dan `/shape-spec` (`.claude/commands/agent-os/`). Dat schrijft `agent-os/specs/<datum-slug>/` met `plan.md`, `shape.md`, `standards.md`, `references.md` voordat er code wordt aangepast — Task 1 van elk plan persist altijd de docs. Aan het begin van een implementatie-taak: `/inject-standards` (auto-suggest of `api/response-format` etc.) om de relevante project-standards in context te laden. Project-specifieke conventies horen in `agent-os/standards/<area>/<file>.md` (kort, scanbaar, één concept per file); globale agent-rules blijven in `.cursor/rules/`. Bij overlap wint de project-specifieke standard.

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
- The `agent-os/` directory holds project-specific spec-driven artefacts: `product/` (mission, roadmap, tech-stack), `standards/` with `index.yml` (tribal knowledge organized by area), and `specs/<YYYY-MM-DD-HHMM-slug>/` (audit trail per non-trivial change). Driven by `.claude/commands/agent-os/` slash commands. See `agent-os/README.md` and `.cursor/rules/agent-os.mdc`.
