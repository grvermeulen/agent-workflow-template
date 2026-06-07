"use client";

import { useRef, useState } from "react";
import type { ChatMessage, ChatReply } from "@/lib/schemas/chat";

type Turn = ChatMessage & { mode?: ChatReply["mode"] };

/**
 * The "From The Pit" chat. Sends the conversation to Cos and renders the replies.
 * Cos answers via Claude when configured, otherwise a keyword-planner fallback.
 *
 * @returns The chat element.
 */
export function CommandInput(): React.ReactElement {
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Sends the current input plus history to Cos and appends the reply.
   *
   * @param event - The form submit event.
   */
  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const history: Turn[] = [...turns, { role: "user", content: trimmed }];
    setTurns(history);
    setText("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error: unknown }).error)
            : "Er ging iets mis";
        setError(message);
        return;
      }
      const data = (await response.json()) as ChatReply;
      setTurns((current) => [
        ...current,
        { role: "assistant", content: data.reply, mode: data.mode },
      ]);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      });
    } catch {
      setError("Kon Cos niet bereiken");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-edge bg-panel/80 p-4 backdrop-blur">
      {turns.length > 0 ? (
        <div ref={scrollRef} className="mb-3 flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
          {turns.map((turn, index) => (
            <div
              key={index}
              className={turn.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  turn.role === "user"
                    ? "bg-accent-2/25 text-slate-100"
                    : "border border-edge bg-panel-2/60 text-slate-200"
                }`}
              >
                {turn.role === "assistant" ? (
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-muted">
                    Cos {turn.mode === "planner" ? "· planner" : "· Claude"}
                  </p>
                ) : null}
                <p className="whitespace-pre-wrap">{turn.content}</p>
              </div>
            </div>
          ))}
          {loading ? <p className="text-xs text-muted">Cos denkt na…</p> : null}
        </div>
      ) : (
        <p className="mb-3 text-xs text-muted">
          Geef Cos een opdracht. Hij beschrijft de aanpak en wie het oppakt.
        </p>
      )}

      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <span className="text-accent">From The Pit ›</span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="bv. 'bouw een landingspagina' of 'werf een onderzoeker'"
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
    </div>
  );
}
