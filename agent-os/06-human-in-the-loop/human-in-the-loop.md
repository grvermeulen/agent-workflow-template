# Human-in-the-Loop

_Last updated: YYYY-MM-DD_

## Approval gates (always ask first)

<!--
- `git push` to any branch — confirm target branch.
- `git push --force` / `--force-with-lease` — confirm + verify branch isn't main.
- `git reset --hard`, `git checkout -- .`, `rm -rf` — confirm + show what's at risk.
- Database migrations against shared DBs.
- Posting to Slack / Jira / external services.
- Merging PRs.
-->

## Review checkpoints (workflow gates)

<!--
- Pre-commit: Prettier → merge-conflict check → ESLint → tsc → vitest (.husky/pre-commit)
- Pre-push: docs:check (.husky/pre-push)
- PR open: agentic-ci verify, AI Review, CodeRabbit
- Pre-merge: CodeRabbit Major-gate must pass
- Post-merge: post-merge-verify on default branch
-->

## Escalation triggers (stop and ask)

<!--
- Diff > N files or > N lines without a clear reason.
- A standard or rule contradicts the requested change.
- Required test is missing for the change being made.
- Secret/credential surfaces in a diff.
- Unfamiliar branch, file, or directory exists — investigate before deleting/overwriting.
-->
