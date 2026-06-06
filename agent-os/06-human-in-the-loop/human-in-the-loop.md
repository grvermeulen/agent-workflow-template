# Human-in-the-Loop

_Last updated: 2026-06-06_

Trust model: Cos reads freely, performs routine writes **auto + logged** (to the cockpit), and stops for the gates below.

## Approval gates (always ask first)

- **New permission / access right** — the core Cos gate. New permission → ask the user (what, why, scope) → record as an **approved permission** → only then grant it onward. Cos is the sole grantor; agents never self-grant.
- **Destructive or irreversible actions:**
  - DB migrations against shared data; deleting repos, branches, or data.
  - `git push --force` / `--force-with-lease`, `git reset --hard`, `rm -rf`.
  - Posting publicly / externally (Slack, Jira, anything outbound to third parties).

## Auto + logged (no pre-approval — Cos owns these)

- Routine file/code writes, commits, pushes to the working branch, opening PRs.
- **Merging PRs** to the default branch.
- **Production deploys** (e.g. Vercel prod).
- Each is recorded in the cockpit activity stream; the user is told only at delivery (see `05-interface/` — "quiet").

## Review checkpoints (automated gates that still run)

- Pre-commit: Prettier → merge-conflict check → ESLint → `tsc --noEmit` → vitest (`.husky/pre-commit`).
- Pre-push: `docs:check` (`.husky/pre-push`).
- PR open: Agentic CI, AI Review, CodeRabbit.
- Pre-merge: CodeRabbit Major-gate must pass.
- Post-merge: post-merge-verify on the default branch.

## Escalation triggers (stop and ask, even mid-task)

- A standard, rule, or `AGENTS.md` preference contradicts the requested change.
- A secret or credential surfaces in a diff.
- An unfamiliar branch, file, or directory turns up — investigate before deleting/overwriting.
- A required test is missing for the change being made.
- The change balloons well beyond the requested scope without a clear reason.
