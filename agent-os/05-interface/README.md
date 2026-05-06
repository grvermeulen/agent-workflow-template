# Layer 5 · Interface

**How you and the agent meet.**

An OS is useless without a way to interact with it. This layer documents the channels you actually use, the conventions in each, and the agent's expected output format per channel.

## What goes here

- **Channels** — which tools the agent shows up in (Claude Code CLI, Cursor IDE, GitHub PR comments, terminal, voice).
- **Per-channel conventions** — output length, formatting, when to use code blocks, when to ask vs. act.
- **Notification & subscription** — how the agent surfaces background work (PR webhooks, CI events).

## Conventions

- **One section per channel.** Don't merge IDE and PR-comment guidance — they have different constraints.
- **Be concrete.** "Be concise" is not enough; "≤ 120 words for PR comments, code-only for Cursor inline edits" is.

## Files

- `interface.md` — the channels and their rules.
