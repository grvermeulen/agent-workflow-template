# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a **GitHub template repo**, not an application. It ships the agent/AI-assisted-development conventions, coding rules, CI workflows, and an "Agent OS" scaffold that get copied into new projects via "Use this template". There is **no application source code, `package.json`, `tsconfig.json`, or lockfile here** — those are brought per project. As a result, the npm scripts referenced by hooks and workflows (`lint`, `format`, `test`, `check:merge-conflicts`, `docs:check`, `build`) are *contracts the downstream project must implement*, not commands runnable in this repo today.

Two kinds of work happen here:
1. **Editing the template itself** — improving rules, workflows, Agent OS layers, slash commands.
2. **Reference for downstream behavior** — the rules in `.cursor/rules/` and `AGENTS.md` describe how code should be written in projects created from this template.

## Authority hierarchy (read this first when guidance conflicts)

`AGENTS.md` > `agent-os/01-identity/` > `agent-os/02–06` > `.cursor/rules/` > `.cursor/skills/`, `.claude/commands/`

- **`AGENTS.md`** — long-lived, cross-project user preferences (`Learned User Preferences`) and per-project `Learned Workspace Facts` (placeholder until filled). Edit this first in a new project. Note: several preferences here are written in Dutch.
- **`agent-os/`** — *who the agent is and what it knows* for a specific project.
- **`.cursor/rules/`** — *how code must be written*; the default for any project. A layer file beats a cursor rule for that layer's concern; a cursor rule beats no answer.

## Agent OS (7-layer scaffold)

`agent-os/01-identity` … `07-compounding`. Each layer has a `README.md` plus placeholder starter files. Methodology from Nufar Gaspar / *The AI Daily Brief*. Lifecycle:

- `/agent-os-bootstrap` (`.claude/commands/agent-os/bootstrap.md`) — interview-driven, one question per layer, fills layers 1–6.
- `/agent-os-retro` (`.claude/commands/agent-os/retro.md`) — after a meaningful session, writes concrete deltas back into layers 1–6 (this is layer 7 in action). A retro with no deltas is a diary, not a feedback loop.

At the start of non-trivial work, read at least `01-identity/identity.md` and `02-context/context.md`. Before destructive or external actions, check `06-human-in-the-loop/human-in-the-loop.md` for approval gates.

## Key conventions enforced by the rules (for downstream projects)

These come from `.cursor/rules/` + `AGENTS.md` and are what AI review (CodeRabbit, Copilot) and hooks check against:

- **Localization**: all user-facing UI strings must be **Dutch (NL)**. CodeRabbit's `nl-check` flags English UI copy. Log messages, identifiers, and HTTP status text are exempt.
- **Architecture**: business logic in `src/lib/services/` and `src/lib/*.ts`; API routes are thin (parse → auth → validate → delegate → respond); validation via **Zod** in `src/lib/schemas/`; reuse existing helpers in `src/lib/` rather than re-declaring (search-first).
- **Styling**: Tailwind utility classes only — no inline `style`, no CSS modules.
- **Type safety**: no `as any`; `catch (err: unknown)`; explicit return types on exported functions; `const list: Foo[] = []` not `as Foo[]`; `vi.mocked(fn)` not `(fn as any)` in tests.
- **Error handling / Sentry (Next.js)**: every production `catch` must `Sentry.captureException(error)` or re-throw — no silent catches. Cache-write failures must never propagate to the caller.
- **Docstrings**: JSDoc on all exported symbols in `src/**/*.{ts,tsx}`; maintain ≥80% coverage (CodeRabbit pre-merge warning).
- **Tests** (Vitest + Testing Library): co-locate; `beforeEach(() => vi.clearAllMocks())` in any describe using mocks; `vi.stubEnv`/`vi.unstubAllEnvs` for env; never `fireEvent`/`userEvent` inside `waitFor`; async functions need an error-path test; never use bare date-only strings (`"2023-01-01"`) — use `"2023-01-01T12:00:00"`.
- **Commits**: Conventional Commits; subject ≤72 chars, imperative; never commit debug comments like `// CI: trigger AI review`.
- **CI workflows**: Node 20 or 22 only; every job declares an explicit `permissions` block (min `contents: read`); add a `concurrency` group for workflows on both `push` and `pull_request`; full test suite belongs in `pre-push`, not `pre-commit`.

## Git hooks (downstream)

- `.husky/pre-commit`: Prettier on staged files → `check:merge-conflicts` → `lint` → `tsc --noEmit` → `vitest run`.
- `.husky/pre-push`: `docs:check`.
- Do not bypass hooks with `--no-verify` unless explicitly instructed.

## Verification loop before opening/updating a PR

Defined in `.cursor/rules/verification-loop.mdc`. Run in order: build → `tsc --noEmit` → lint → test → security scan (manual: secrets, auth on routes) → diff review. **Phase 7 is mandatory and easy to forget**: after fixing inline review comments (CodeRabbit, Cursor bot, humans) and pushing, also set the corresponding **GitHub review threads to Resolved** in the same round — use the `resolveReviewThread` GraphQL mutation. "Fixed in code" is not done until the thread is closed.

For CI repair, use the `loop-on-ci` skill / `.claude/commands/loop-on-ci.md`: watch CI, apply one focused fix per failure cause, push, repeat until green, then resolve review threads.

## CI workflows (`.github/workflows/`)

`agentic-ci.yml` (lint/typecheck/build/test), `ai-review.yml` (AI PR review), `coderabbit-major-gate.yml` (blocks merge on Major/Critical CodeRabbit finding), `copilot-code-review.yml`, `copilot-setup-steps.yml` (reusable setup), `post-merge-verify.yml`.

CodeRabbit is configured in `.coderabbit.yaml`: profile `chill`, language `nl-NL`, docstring threshold 80% (warning), custom `deslop` and `nl-check` finishing touches.

## De-slop pass

After AI-assisted implementation, run a de-slop pass (`.cursor/rules/deslop.mdc` / `.cursor/skills/deslop/`): remove narration comments that restate code, redundant defensive checks the type system already covers, and tests that test the language runtime rather than business logic. Keep comments that explain non-obvious intent or trade-offs.
