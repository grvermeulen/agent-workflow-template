import type { Agent } from "@/lib/schemas/agent";
import { getToolStatuses } from "@/lib/services/toolStatus.service";

type AgentSeed = Omit<Agent, "state"> & { toolId?: string };

/**
 * The v1 roster. Cos is always active; tool-bound agents derive their state
 * from whether their underlying tool is connected.
 */
const ROSTER: AgentSeed[] = [
  {
    id: "cos",
    name: "Cos",
    purpose: "Chief of Staff — neemt de 'wat' aan en regelt de 'hoe'.",
    tool: "The Pit",
    accessRights: [
      "github:read",
      "github:write",
      "vercel:deploy",
      "agents:manage",
      "permissions:grant",
    ],
  },
  {
    id: "builder",
    name: "Bouwer",
    purpose: "Bouwt en onderhoudt projecten via Claude Code.",
    tool: "Claude Code",
    toolId: "claude-code",
    accessRights: ["github:read", "github:write"],
  },
  {
    id: "editor",
    name: "Editor",
    purpose: "Inline edits en refactors via Cursor.",
    tool: "Cursor",
    toolId: "cursor",
    accessRights: ["github:read"],
  },
  {
    id: "researcher",
    name: "Onderzoeker",
    purpose: "Verzamelt en verifieert kennis via ChatGPT, Gemini en xAI.",
    tool: "ChatGPT",
    toolId: "chatgpt",
    accessRights: ["web:read"],
  },
  {
    id: "voice",
    name: "Stem",
    purpose: "Spraak in en uit via ElevenLabs.",
    tool: "ElevenLabs",
    toolId: "elevenlabs",
    accessRights: ["audio:synthesize"],
  },
];

/**
 * Returns Cos's agent roster, with each agent's state derived from its tool's
 * connection (Cos is always "actief").
 *
 * @returns The roster of agents.
 */
export function getAgents(): Agent[] {
  const tools = getToolStatuses();
  return ROSTER.map((seed): Agent => {
    if (!seed.toolId) {
      return { ...stripSeed(seed), state: "actief" };
    }
    const tool = tools.find((candidate) => candidate.id === seed.toolId);
    const state = tool?.state === "connected" ? "actief" : "inactief";
    return { ...stripSeed(seed), state };
  });
}

/**
 * Drops internal seed-only fields, leaving the public agent shape (minus state).
 *
 * @param seed - The roster seed entry.
 * @returns The agent fields without `toolId`.
 */
function stripSeed(seed: AgentSeed): Omit<Agent, "state"> {
  const { toolId: _toolId, ...agent } = seed;
  void _toolId;
  return agent;
}
