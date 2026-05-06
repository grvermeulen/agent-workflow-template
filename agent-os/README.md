# Agent OS — Personal Agentic Operating System

A "harness" around your AI tooling that makes work repeatable, team-shareable, and compounding. The structure travels with you across **Claude Code, Cursor, OpenCode, ChatGPT, Gemini** — any model or interface.

Based on the framework presented by **Nufar Gaspar** on **The AI Daily Brief** (host: Nathaniel Whittemore), episode *"How To Build a Personal Agentic Operating System"*. The framework is methodology, not code; this directory is the on-disk shape we use to apply it in this template.

## Why this exists

As frontier models converge, the differentiator stops being "which model" and starts being **the system you've built around it**. An Agent OS is that system: explicit identity, current context, declared capabilities, named workflows, chosen interfaces, deliberate human gates, and a feedback loop that makes the next session better than the last.

## The seven layers

```
agent-os/
├── 01-identity/             Who is the agent, how does it talk, what rules must it enforce?
├── 02-context/              What does the agent need to know — dated, scoped, current?
├── 03-capabilities/         What tools / MCPs / skills can the agent actually call?
├── 04-workflow/             Step-by-step processes the agent runs end-to-end.
├── 05-interface/            How you and the agent meet (chat, voice, terminal, IDE, PR).
├── 06-human-in-the-loop/    Where humans must approve, review, or intervene.
└── 07-compounding/          Retros & learning — what gets added back into the layers above.
```

Each folder has a `README.md` explaining the layer and one or more starter files to fill in. Every starter file is a placeholder until you (or `/agent-os-bootstrap`) populates it.

## Slash commands

Live in `.claude/commands/agent-os/`:

| Command | When | What it does |
|---|---|---|
| `/agent-os-bootstrap` | Once per project (or per major shift) | Interview-driven setup: walks the user through all seven layers with `AskUserQuestion`, writes/overwrites the layer files. |
| `/agent-os-retro` | After a meaningful session, sprint, or incident | Reviews what happened and updates the relevant layers (usually Context, Capabilities, Workflow, or Human-in-the-Loop). This is layer 7 in action. |

## Workflow

1. **Bootstrap** — run `/agent-os-bootstrap`. It asks one question at a time per layer and saves real content. Skip layers that aren't relevant yet (`07-compounding/` is empty until you've actually run a session).
2. **Reference daily** — at the start of any non-trivial task, the agent reads the relevant layer files (or the user `@`-mentions them: `@agent-os/01-identity/identity.md`).
3. **Compound** — after each meaningful session, run `/agent-os-retro`. It surfaces what to add to Context, what new Capability you discovered, where Human-in-the-Loop should tighten, and what to retire.

## Relationship to the rest of this template

The Agent OS is **methodology + persistent state**. It tells the agent who it is and what it knows. The rest of this template is **executable rules + procedures** that constrain how it acts:

| Layer | What lives there | Existing files in this template |
|---|---|---|
| `AGENTS.md` | Long-lived user preferences (cross-project) | `AGENTS.md` |
| `agent-os/01-identity/` | The agent's role for *this* project | (filled by bootstrap) |
| `agent-os/02-context/` | Project-specific dated knowledge | (filled by bootstrap) |
| `agent-os/03-capabilities/` | Tools, MCPs, skills available | references `.cursor/skills/`, `.claude/commands/` |
| `agent-os/04-workflow/` | Named end-to-end processes | references `.cursor/skills/verification-loop`, `loop-on-ci` |
| `agent-os/05-interface/` | How the user prefers to interact | (filled by bootstrap) |
| `agent-os/06-human-in-the-loop/` | Approval gates, safety rails | references `.cursor/hooks.ts`, CodeRabbit gate |
| `agent-os/07-compounding/` | Retros, deltas to feed back | new — written by `/agent-os-retro` |
| `.cursor/rules/*.mdc` | HOW to write code (always-on rules) | unchanged |
| `.cursor/skills/*` | Reusable agent procedures | unchanged |

When guidance overlaps, the layer file is the **specific** answer for this project; cursor rules are the **default** for any project. A cursor rule beats no answer; a layer file beats a cursor rule for that layer's concern.

## Source

- Episode: [How To Build a Personal Agentic Operating System — The AI Daily Brief (YouTube)](https://www.youtube.com/watch?v=ntvkDnk_5jA) · [Apple Podcasts](https://podcasts.apple.com/ae/podcast/how-to-build-a-personal-agentic-operating-system/id1680633614?i=1000763587610)
- Guest: Nufar Gaspar
- Host: Nathaniel Whittemore
- Free training program: [aidbagentos.ai](https://aidbagentos.ai)
