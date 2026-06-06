import type { ConnectionState } from "@/lib/schemas/tool";

const STATE_COLOR: Record<ConnectionState, string> = {
  connected: "bg-ok shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]",
  degraded: "bg-warn shadow-[0_0_8px_2px_rgba(251,191,36,0.4)]",
  offline: "bg-down",
};

/**
 * A small glowing status dot.
 *
 * @param props - Component props.
 * @param props.state - The connection state to colour the dot.
 * @returns The dot element.
 */
export function StateDot({ state }: { state: ConnectionState }): React.ReactElement {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${STATE_COLOR[state]}`} />;
}
