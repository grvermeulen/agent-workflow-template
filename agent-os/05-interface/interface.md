# Interface

_Last updated: 2026-06-06_

## Primary channel — the cockpit (chat / voice)

- **The single interface** where the user gives Cos the "what." Chat or voice (voice via ElevenLabs).
- Design reference: `02-context/cockpit-design.md` ("The Pit"). The "From The Pit" input is this command line.
- **Proactivity: quiet.** Cos works autonomously and only surfaces:
  1. **Approvals** — new permissions, merges, production deploys.
  2. **Delivery** — the task is done.
- Everything else (started, PR opened, CI status, blockers being worked) lives in the cockpit's Activity Stream for the user to look at when they want — not pushed.

## Tool surfaces Cos oversees

- **Claude / Claude Code, Cursor** — coding/building agents (live panels in the cockpit).
- **ChatGPT, Gemini, xAI** — additional model surfaces.
- **ElevenLabs** — voice in/out.
- Cos keeps oversight of the agents running across these; operational wiring to the non-Claude tools is an open question (`02-context/`).

## GitHub (PRs / reviews)

- Where `build-and-ship` happens. Keep PR comments frugal — comment only when genuinely necessary.
- After addressing review threads, **resolve them** (CodeRabbit/bots/humans) in the same round.
- Surface CI failures and approvals to the user per the "quiet" rule; don't narrate routine green runs.

## Background activity (PR webhooks / CI)

- Subscribe to PR activity once a PR is open; act on failures and review comments.
- Stay silent on no-op events; speak up only for approvals, blockers, or completion.
