# Layer 6 · Human-in-the-Loop

**Where humans must approve, review, or intervene.**

Autonomy without gates is hazardous. This layer makes the gates explicit so the agent doesn't have to guess where caution applies.

## What goes here

- **Approval gates** — the kinds of action that *always* require explicit user approval before execution (not after, not "I'll let you know if it breaks").
- **Review checkpoints** — places in a workflow where a human reviews output before the next step (e.g. CodeRabbit Major-gate, security review, Vercel preview before promote).
- **Escalation triggers** — conditions where the agent must stop and ask (unexpected diff size, missing tests, conflicting standards).

## What enforces this in *this* template

- `.cursor/hooks.ts` — blocks destructive shell commands.
- `.husky/pre-commit` & `pre-push` — hard gates before commit/push.
- `.github/workflows/coderabbit-major-gate.yml` — blocks merge on Major/Critical findings.
- `.github/workflows/ai-review.yml` — second-opinion review.
- The user's standing instruction: confirm before push, force-push, deletions, destructive git ops.

## Files

- `human-in-the-loop.md` — gates, checkpoints, escalations specific to this project.
