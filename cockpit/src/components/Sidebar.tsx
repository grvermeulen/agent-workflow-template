const NAV_ITEMS: { icon: string; label: string; active?: boolean }[] = [
  { icon: "◎", label: "Commandocentrum", active: true },
  { icon: "✉", label: "Berichten" },
  { icon: "✦", label: "Mail" },
  { icon: "💬", label: "Chat" },
  { icon: "🗓", label: "Agenda" },
  { icon: "▦", label: "Apps" },
  { icon: "⌘", label: "Cursor" },
  { icon: "✶", label: "Claude Code" },
  { icon: "🗂", label: "Bestanden & Data" },
  { icon: "⚙", label: "Automatiseringen" },
];

/**
 * The left navigation rail of The Pit.
 *
 * @returns The sidebar element.
 */
export function Sidebar(): React.ReactElement {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-edge bg-ink-2/80 px-3 py-5 lg:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-2/30 text-accent">
          ◆
        </span>
        <span className="text-lg font-semibold">The Pit</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              item.active
                ? "bg-accent-2/20 text-white"
                : "text-muted hover:bg-panel-2/60 hover:text-slate-200"
            }`}
          >
            <span className="w-4 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-edge bg-panel/60 p-3 text-xs text-muted">
        <p className="font-medium text-slate-300">Cos</p>
        <p>Chief of Staff — jij geeft de wat, ik regel de hoe.</p>
      </div>
    </aside>
  );
}
