import type { Agent, AgentState } from "@/lib/schemas/agent";

const STATE_BADGE: Record<AgentState, string> = {
  actief: "bg-ok/15 text-ok",
  "aan het werk": "bg-accent/15 text-accent",
  inactief: "bg-down/20 text-slate-400",
};

/**
 * The agent roster: each agent with its purpose, tool and access rights.
 *
 * @param props - Component props.
 * @param props.agents - The agents to render.
 * @returns The roster element.
 */
export function AgentsRoster({ agents }: { agents: Agent[] }): React.ReactElement {
  return (
    <ul className="flex flex-col gap-2">
      {agents.map((agent) => (
        <li key={agent.id} className="rounded-lg border border-edge bg-panel-2/50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-100">{agent.name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATE_BADGE[agent.state]}`}
            >
              {agent.state}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted">{agent.purpose}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {agent.accessRights.map((right) => (
              <span
                key={right}
                className="rounded bg-ink-2/80 px-1.5 py-0.5 text-[10px] text-slate-400"
              >
                {right}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
