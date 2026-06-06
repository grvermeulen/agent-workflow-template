"use client";

import { useState } from "react";
import type { CommandResult } from "@/lib/schemas/command";

/**
 * The "From The Pit" command bar. Sends the user's "what" to Cos and renders the
 * plan Cos would execute (a dry run in v1).
 *
 * @returns The command bar element.
 */
export function CommandInput(): React.ReactElement {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Submits the command to the API and stores the plan or error.
   *
   * @param event - The form submit event.
   */
  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error: unknown }).error)
            : "Er ging iets mis";
        setError(message);
        setResult(null);
        return;
      }
      const data = (await response.json()) as CommandResult;
      setResult(data);
    } catch {
      setError("Kon Cos niet bereiken");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-edge bg-panel/80 p-4 backdrop-blur">
      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <span className="text-accent">From The Pit ›</span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Geef Cos een opdracht — bv. 'bouw een landingspagina' of 'werf een onderzoeker'"
          aria-label="Opdracht aan Cos"
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent-2/80 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-2 disabled:opacity-50"
        >
          {loading ? "Bezig…" : "Versturen"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}

      {result ? (
        <div className="mt-3 rounded-xl border border-edge bg-panel-2/60 p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent-2/20 px-2 py-0.5 text-[11px] font-medium text-accent">
              {result.intent}
            </span>
            <span className="text-[11px] text-muted">→ {result.assignedTo}</span>
            {result.dryRun ? (
              <span className="text-[11px] text-warn">dry run — wacht op akkoord</span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-200">{result.plan}</p>
        </div>
      ) : null}
    </div>
  );
}
