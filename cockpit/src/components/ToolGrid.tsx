import type { ToolStatus } from "@/lib/schemas/tool";
import { StateDot } from "@/components/StateDot";

/**
 * A grid of tool tiles showing each integration's connection state.
 *
 * @param props - Component props.
 * @param props.tools - The tools to render.
 * @returns The tool grid element.
 */
export function ToolGrid({ tools }: { tools: ToolStatus[] }): React.ReactElement {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {tools.map((tool) => (
        <li
          key={tool.id}
          className="flex items-center justify-between rounded-lg border border-edge bg-panel-2/50 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">{tool.name}</p>
            <p className="truncate text-[11px] text-muted">{tool.detail}</p>
          </div>
          <StateDot state={tool.state} />
        </li>
      ))}
    </ul>
  );
}
