import type { WorkItem, WorkStatus } from "@/lib/schemas/work";

const COLUMN_LABEL: Record<Exclude<WorkStatus, "done">, string> = {
  backlog: "Backlog",
  in_progress: "Lopend",
};

/**
 * Renders a single work item row, linking out when a URL is present.
 *
 * @param props - Component props.
 * @param props.item - The work item.
 * @returns The row element.
 */
function WorkRow({ item }: { item: WorkItem }): React.ReactElement {
  const content = (
    <div className="rounded-lg border border-edge bg-panel-2/50 px-3 py-2">
      <p className="truncate text-sm text-slate-200">{item.title}</p>
      <p className="truncate text-[11px] text-muted">{item.source}</p>
    </div>
  );
  return item.url ? (
    <a href={item.url} target="_blank" rel="noreferrer" className="block hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
}

/**
 * The work board split into Backlog and Lopend (in progress) columns.
 *
 * @param props - Component props.
 * @param props.items - All work items.
 * @returns The board element.
 */
export function WorkBoard({ items }: { items: WorkItem[] }): React.ReactElement {
  const columns: Exclude<WorkStatus, "done">[] = ["in_progress", "backlog"];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {columns.map((column) => {
        const columnItems = items.filter((item) => item.status === column);
        return (
          <div key={column} className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {COLUMN_LABEL[column]} · {columnItems.length}
            </p>
            {columnItems.length === 0 ? (
              <p className="text-xs text-muted">Leeg</p>
            ) : (
              columnItems.map((item) => <WorkRow key={item.id} item={item} />)
            )}
          </div>
        );
      })}
    </div>
  );
}
