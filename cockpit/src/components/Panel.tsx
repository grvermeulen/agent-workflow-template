/**
 * A cockpit panel: a titled, bordered card used across the dashboard grid.
 *
 * @param props - Component props.
 * @param props.title - The panel heading (Dutch).
 * @param props.action - Optional right-aligned action label.
 * @param props.children - The panel body.
 * @param props.className - Extra classes for grid placement.
 * @returns The panel element.
 */
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: string;
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-edge bg-panel/70 p-4 backdrop-blur ${className}`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">{title}</h2>
        {action ? <span className="text-xs text-accent">{action}</span> : null}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}
