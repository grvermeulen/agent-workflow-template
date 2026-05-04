# Layer 7 · Compounding

**Retros & learning — what gets fed back into the layers above.**

Without this layer, every session starts from the same baseline. With it, every session leaves the OS sharper than it found it. This is what turns "I used AI" into "my AI got better at my job".

## What goes here

- **Session retros** — short, dated entries: what worked, what didn't, what surprised you.
- **Deltas to apply** — concrete changes to Identity / Context / Capabilities / Workflow / Interface / HITL, with the layer & file each change targets.
- **Retired things** — context that went stale, capabilities you decided not to use, workflows that were a bad fit.

## Conventions

- **One file per retro.** Filename: `YYYY-MM-DD-<short-slug>.md`.
- **Each retro produces deltas.** A retro without deltas is a journal, not a feedback loop.
- **`/agent-os-retro` runs this layer.** It walks the session, drafts a retro, proposes deltas, and (with confirmation) applies them to the right layer files.

## Files

- `retros/` — one dated retro per session/sprint/incident.
- `deltas-applied.md` — running log of what was changed and why.
