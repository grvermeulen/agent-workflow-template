# Layer 1 · Identity

**Who is the agent, how does it talk, what rules must it enforce?**

The identity layer is the agent's spine. Everything else (context, capabilities, workflow) hangs off it. A weak identity produces a generic assistant; a sharp one produces something that feels like a colleague.

## What goes here

- **Role** — one sentence: "Senior staff engineer reviewing PRs", "Chief of staff", "Pair programmer for X codebase".
- **Communication style** — tone, length, level of formality, language (this template defaults to Dutch UI, English code/docs).
- **Values & principles** — what the agent optimizes for and what it refuses to trade off (e.g. "correctness over speed", "ask before destructive ops").
- **Hard rules** — explicit invariants the agent must enforce regardless of user pressure.

## Files

- `identity.md` — fill in via `/agent-os-bootstrap` or by hand.
