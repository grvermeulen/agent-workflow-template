const AUTOMATIONS: { name: string; trigger: string; active: boolean }[] = [
  { name: "Code-review agent", trigger: "Bij elke PR", active: true },
  { name: "CI-herstel (loop-on-ci)", trigger: "Bij rode CI", active: true },
  { name: "Wekelijkse digest", trigger: "Maandag 09:00", active: false },
];

/**
 * The agent-builder / automations row from the design.
 *
 * @returns The automations element.
 */
export function Automations(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {AUTOMATIONS.map((automation) => (
        <div key={automation.name} className="rounded-lg border border-edge bg-panel-2/50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-200">{automation.name}</p>
            <span className={`h-2 w-2 rounded-full ${automation.active ? "bg-ok" : "bg-down"}`} />
          </div>
          <p className="mt-1 text-[11px] text-muted">{automation.trigger}</p>
        </div>
      ))}
    </div>
  );
}
