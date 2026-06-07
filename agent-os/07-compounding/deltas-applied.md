# Deltas Applied

_Running log of changes fed back into the Agent OS layers from retros._

<!--
Format per entry:

## YYYY-MM-DD — <retro-slug>

- **Layer:** 02-context — added `priorities.md`, dated 2026-05-04.
- **Layer:** 03-capabilities — removed `mcp__foo` (deprecated, replaced by `mcp__bar`).
- **Layer:** 06-human-in-the-loop — tightened gate: ask before any `git reset` flavour.
- **Layer:** 04-workflow — new workflow `release-checklist.md`.

Source retro: `retros/YYYY-MM-DD-<slug>.md`
-->

## 2026-06-07 — cockpit-v1-live

- **Layer:** 02-context — recorded **Cos v1 / The Pit** as live on Vercel (`cos-lemon.vercel.app`), code in `cockpit/`; refreshed priorities, recent decisions, and open questions.
- **Layer:** 03-capabilities — added the **Cos chat** capability (Claude `claude-opus-4-8` with keyword-planner fallback) and the cockpit as a live surface.
- **Learned fact:** deploying a subdirectory app on Vercel requires setting the project **Root Directory** to `cockpit/`; missing this fails the build with "No Next.js version detected."
- **Learned fact:** this session is scoped to one repo; a running Claude-on-the-web session can't reliably add a second repo, so build where the session already has push access.

## 2026-06-07 — subscription-and-github-delegation

- **Layer:** 03-capabilities — chat now **delegates build/deploy/hire to Claude Code on GitHub** (`@claude` Action on the subscription); added the GitHub-delegation capability.
- **Layer:** 02-context — recorded the host constraint and the Vercel split (API chat + GitHub work).
- **Learned fact:** the headless **Claude Code subscription path can't run in Vercel serverless** — the Agent SDK spawns the Claude Code CLI subprocess, which fails fast in Lambda (200 + error log, not a timeout), so the chat falls back. Use it only on always-on Node hosts; on Vercel use the API key for chat and the Claude Code GitHub Action for subscription-powered work.
- **Learned fact:** `claude setup-token` + `CLAUDE_CODE_OAUTH_TOKEN` (as a repo secret) drives the Claude Code Action with **no API billing** — the sanctioned way to spend the subscription on automated work.
