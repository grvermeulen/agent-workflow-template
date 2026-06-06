const ACTIONS: { icon: string; label: string }[] = [
  { icon: "✶", label: "Nieuwe opdracht" },
  { icon: "🤖", label: "Agent werven" },
  { icon: "🚀", label: "Deploy starten" },
  { icon: "📊", label: "Status opvragen" },
];

/**
 * Quick-launch shortcuts for the most common Cos actions.
 *
 * @returns The quick-launch grid.
 */
export function QuickLaunch(): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          className="flex items-center gap-2 rounded-lg border border-edge bg-panel-2/50 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:border-accent/50 hover:bg-panel-2"
        >
          <span>{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}
