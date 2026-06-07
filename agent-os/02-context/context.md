# Context — Index

_Last updated: 2026-06-07_

## Mission

The user wants a **single, simple interface — chat or voice — where they provide the "what" and Cos owns the "how."** Cos executes work in a highly autonomous way and focuses on doing it *properly*. The user does not want to decide what to build where, or maintain the things that get built — all of that is delegated to Cos.

## Tool landscape

The user already runs many AI tools and does not want to manage which work happens where. Cos orchestrates across them:

- **Claude** (incl. Claude Code), **Cursor** — building / coding agents
- **ChatGPT**, **Gemini**, **xAI** — additional model surfaces
- **ElevenLabs** — voice

## Active priorities

1. **Cockpit v1 is live** ("The Pit") — see below. Build/deploy/hire requests now **delegate to Claude Code on GitHub**. Next: wire the non-GitHub tools for real, and an always-on host for interactive subscription chat.

## Cockpit ("The Pit") — v1 live

- **Code:** `cockpit/` in this repo — Next.js 15 + Tailwind v4 + TypeScript, service layer, Zod, Vitest. Built from `cockpit-design.md`.
- **Live:** deployed on Vercel (project `cos`, root directory `cockpit/`) at **https://cos-lemon.vercel.app**. Auto-deploys from `main` via the GitHub integration.
- **Live data:** with `GITHUB_TOKEN` set, the work board (issues → backlog, PRs → in-progress) and activity feed are live. Other tools light up per their env keys (`.env.example`).
- **Chat:** the "From The Pit" bar (`claude-opus-4-8`). Build/deploy/hire requests are **delegated to Claude Code on GitHub** (subscription, via the `@claude` Action) when `COS_WORK_REPO` + a write token are set. Conversation: headless subscription Claude Code (off-Vercel only) → Anthropic API (chat on Vercel) → keyword planner.
- **Learned (2026-06-07):** Claude Code's headless subscription path spawns the CLI subprocess, which **does not run in Vercel serverless** (fails fast → falls back). On Vercel: API key for chat + GitHub Action for subscription work. A true subscription chat needs an always-on Node host.

## Recent decisions

- Identity defined: the chief-of-staff agent is **Cos** — orchestrates, hires/creates agents, owns access rights, maintains a cockpit app (see `01-identity/identity.md`).
- Built and shipped **Cos v1 / The Pit** to Vercel (2026-06-07). Cockpit lives in `cockpit/` (kept out of the template root; can be extracted to its own repo later).
- Cockpit chat backed by Claude with a graceful planner fallback. Build/deploy/hire requests are **delegated to Claude Code on GitHub** (it opens an `@claude` issue → the Action implements it on the subscription); conversational turns are answered by the API (on Vercel) or planner.

## External authorities

- **GitHub is the backbone / source of truth.** Backlog lives in GitHub Issues/Projects; code lives in the repos. Cos reads and writes work state on GitHub, and the cockpit app visualizes it. The agent roster and approved permissions are tracked here too.
- `AGENTS.md` — long-lived user preferences + per-project workspace facts (top of the authority hierarchy).
- `.cursor/rules/*.mdc` — how code must be written in downstream projects.
- `CLAUDE.md` / `README.md` — what this template repo provides.

## Open questions

- Build/deploy/hire requests delegate to Claude Code on GitHub (issue → `@claude`), but other intents only return a conversational reply — broader execution is still to come.
- Interactive subscription chat needs an always-on Node host (the headless Claude Code subprocess can't run in Vercel serverless).
- How Cos reaches across non-Claude tools (ChatGPT, Gemini, xAI, ElevenLabs) operationally is not yet defined (only Claude is wired so far).
- Voice (ElevenLabs) is not yet built; the cockpit is chat-only for now.
