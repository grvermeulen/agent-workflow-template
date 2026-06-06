import type { BoardSummary } from "@/lib/schemas/work";

/**
 * The top-right metric tiles: connected tools, work in progress, and done.
 *
 * @param props - Component props.
 * @param props.connected - Number of connected tools.
 * @param props.totalTools - Total tools Cos oversees.
 * @param props.board - Board summary counts.
 * @returns The tiles element.
 */
export function StatusTiles({
  connected,
  totalTools,
  board,
}: {
  connected: number;
  totalTools: number;
  board: BoardSummary;
}): React.ReactElement {
  const tiles = [
    { label: "Tools verbonden", value: `${connected}/${totalTools}`, accent: "text-accent" },
    { label: "Lopend werk", value: String(board.inProgress), accent: "text-accent-2" },
    { label: "Afgerond", value: String(board.done), accent: "text-ok" },
  ];

  return (
    <div className="flex gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="min-w-24 rounded-xl border border-edge bg-panel/70 px-4 py-2 text-right"
        >
          <p className={`text-xl font-semibold ${tile.accent}`}>{tile.value}</p>
          <p className="text-[11px] text-muted">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}
