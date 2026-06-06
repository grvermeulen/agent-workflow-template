import type { ActivityItem, ActivityKind } from "@/lib/schemas/activity";

const KIND_COLOR: Record<ActivityKind, string> = {
  info: "bg-accent",
  success: "bg-ok",
  warning: "bg-warn",
};

/**
 * Formats an ISO timestamp as a short Dutch local time (HH:MM).
 *
 * @param iso - ISO-8601 timestamp.
 * @returns The formatted time, or "—" when the date is invalid.
 */
function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit" }).format(date);
}

/**
 * The activity stream: a chronological feed of what Cos and the tools did.
 *
 * @param props - Component props.
 * @param props.items - The activity items.
 * @returns The activity stream element.
 */
export function ActivityStream({ items }: { items: ActivityItem[] }): React.ReactElement {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Nog geen activiteit.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KIND_COLOR[item.kind]}`} />
          <div className="min-w-0">
            <p className="text-sm text-slate-200">{item.message}</p>
            <p className="text-[11px] text-muted">
              {item.actor} · {formatTime(item.timestamp)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
