# Context — Index

_Last updated: 2026-06-06_

## Mission

This repo is a **GitHub template**, not an application. It ships agent/AI-assisted-development conventions, coding rules, CI workflows, and the Agent OS scaffold that get copied into new projects via "Use this template". There is no app source, `package.json`, or lockfile here — those are brought per downstream project.

## Active priorities

- Keep the rule set (`.cursor/rules/`), `AGENTS.md`, and `CLAUDE.md` coherent and mutually consistent.
- Keep the Agent OS scaffold (`agent-os/01–07`) usable and in sync with the slash commands that drive it.
- Keep CI workflows portable to a Node + Next.js style downstream project (Node 20/22, least-privilege permissions, concurrency groups).

## Recent decisions

- Added `CLAUDE.md` as the Claude Code entry point; its authority hierarchy mirrors `.cursor/rules/agent-os.mdc` (down to `.cursor/skills/`, `.claude/commands/`).

## External authorities

- `AGENTS.md` — long-lived user preferences + per-project workspace facts (top of the authority hierarchy).
- `.cursor/rules/*.mdc` — how code must be written.
- `README.md` — what each path in the template is for.

## Open questions

- Downstream stack specifics (framework, locale, provider set) are unknown until the template is actually used; don't assume them.
