# Workflows — Index

_Last updated: 2026-06-06_

Named, end-to-end processes Cos owns. The user provides the "what"; these define the "how".

## Template-provided

- `verification-loop` — see `.cursor/skills/verification-loop/` (run before any PR)
- `deslop` — see `.cursor/skills/deslop/`
- `search-first` — see `.cursor/skills/search-first/`
- `loop-on-ci` — see `.claude/commands/loop-on-ci.md`

## Project-specific (Cos)

### task-intake-and-triage
- **Trigger:** the user gives Cos a "what" via chat or voice.
- **Steps:** capture intent → turn it into a GitHub issue with clear requirements → decide which tool/agent should do it → place it on the backlog (GitHub Projects). If no agent fits, hand off to `agent-hiring`.
- **Approval gate:** none to capture/triage; delegation that needs a new access right triggers `permission-approval`.

### agent-hiring
- **Trigger:** triage finds no existing agent with the needed expertise.
- **Steps:** Cos writes the agent spec (purpose, scope, required access) → creates the agent, or routes the spec to the **HR agent** to create it → registers it in the cockpit roster with least-privilege access.
- **Approval gate:** any access right the new agent needs that isn't already approved → `permission-approval`.

### build-and-ship
- **Trigger:** a triaged task is assigned to an agent.
- **Steps:** work on a feature branch → open a PR → run `verification-loop` and `loop-on-ci` until CI is green → resolve review threads (CodeRabbit/bots/humans) → Cos reviews and reports done in the cockpit.
- **Approval gate:** merge and any production deploy (see `06-human-in-the-loop/`).

### permission-approval
- **Trigger:** Cos or any agent needs an access right not already on the approved list.
- **Steps:** Cos pauses the request → asks the user (one clear ask: what, why, scope) → on approval, records it as an **approved permission** → grants it onward to agents as he sees fit. Cos is the sole grantor.
- **Approval gate:** this IS the gate — never self-grant a new permission.
