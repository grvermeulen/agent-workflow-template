"use client";

import { useEffect, useRef, useState } from "react";
import "@xterm/xterm/css/xterm.css";
import { TERMINAL_THEME, TERMINAL_FONT } from "@/components/terminalTheme";

/** The PTY bridge exposed by the Electron preload (absent on the web). */
type CosTerminalApi = {
  isAvailable: boolean;
  defaultCwd(): string;
  start(opts: { cwd?: string; autoClaude?: boolean }): string;
  write(id: string, data: string): void;
  resize(id: string, cols: number, rows: number): void;
  kill(id: string): void;
  onData(id: string, cb: (data: string) => void): () => void;
  onExit(id: string, cb: (code: number) => void): () => void;
};

declare global {
  interface Window {
    cosTerminal?: CosTerminalApi;
  }
}

/**
 * A real terminal panel that runs `claude` in a PTY via the Electron bridge.
 * Replaces the request/response chat when The Pit runs as a desktop app.
 *
 * @returns The terminal panel element.
 */
export function TerminalPanel(): React.ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const [cwd, setCwd] = useState("");

  useEffect(() => {
    const api = window.cosTerminal;
    const host = hostRef.current;
    if (!api || !host) return;

    let dispose = () => {};
    let cancelled = false;

    void (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ]);
      if (cancelled) return;

      const term = new Terminal({
        fontFamily: TERMINAL_FONT,
        fontSize: 13,
        cursorBlink: true,
        allowProposedApi: true,
        theme: TERMINAL_THEME,
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(host);
      fit.fit();
      term.focus();

      setCwd(api.defaultCwd());
      const id = api.start({ autoClaude: true });

      const offData = api.onData(id, (data) => term.write(data));
      const offExit = api.onExit(id, (code) =>
        term.write(`\r\n\x1b[90m[sessie beëindigd — code ${code}]\x1b[0m\r\n`),
      );
      const input = term.onData((data) => api.write(id, data));

      const doFit = () => {
        fit.fit();
        api.resize(id, term.cols, term.rows);
      };
      const observer = new ResizeObserver(doFit);
      observer.observe(host);
      window.addEventListener("resize", doFit);
      const initial = window.setTimeout(doFit, 60);

      dispose = () => {
        window.clearTimeout(initial);
        offData();
        offExit();
        input.dispose();
        observer.disconnect();
        window.removeEventListener("resize", doFit);
        api.kill(id);
        term.dispose();
      };
    })();

    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  return (
    <section className="flex flex-col rounded-2xl border border-edge bg-panel/70 p-4 backdrop-blur">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">
          From The Pit · terminal
        </h2>
        <span className="truncate pl-3 text-xs text-accent" title={cwd}>
          {cwd ? `claude · ${cwd}` : "claude"}
        </span>
      </header>
      <div ref={hostRef} className="h-80 w-full overflow-hidden rounded-xl bg-[#0d1430] p-2" />
    </section>
  );
}
