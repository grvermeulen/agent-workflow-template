"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildBridgeUrl, parseBridgeMessage } from "@/lib/bridgeClient";
import { TERMINAL_FONT, TERMINAL_THEME } from "@/components/terminalTheme";
import "@xterm/xterm/css/xterm.css";

const URL_STORAGE_KEY = "cos.bridge.url";
const TOKEN_STORAGE_KEY = "cos.bridge.token";

/** Connection lifecycle of the remote terminal. */
type BridgeStatus = "config" | "connecting" | "connected" | "offline";

type BridgeSettings = {
  url: string;
  token: string;
  attempt: number;
};

/**
 * Reads the bridge URL preconfigured at build time (public, non-secret).
 *
 * @returns The configured bridge URL or an empty string.
 */
function configuredBridgeUrl(): string {
  return process.env.NEXT_PUBLIC_COS_BRIDGE_URL ?? "";
}

/**
 * A real terminal that attaches to the bridge daemon on the user's own machine
 * over an authenticated WebSocket. Web-counterpart of the Electron TerminalPanel:
 * the PTY (and `claude`) runs at home, the browser only renders.
 *
 * @returns The remote terminal panel element.
 */
export function RemoteTerminalPanel(): React.ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<BridgeStatus>("config");
  const [settings, setSettings] = useState<BridgeSettings | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [notice, setNotice] = useState("");
  const [cwd, setCwd] = useState("");

  // Restore saved settings once on mount; auto-connect when both are present.
  useEffect(() => {
    const savedUrl = window.localStorage.getItem(URL_STORAGE_KEY) ?? configuredBridgeUrl();
    const savedToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
    setUrlInput(savedUrl);
    setTokenInput(savedToken);
    if (savedUrl && savedToken) {
      setSettings({ url: savedUrl, token: savedToken, attempt: 0 });
    }
  }, []);

  const connect = useCallback(() => {
    const url = urlInput.trim();
    const token = tokenInput.trim();
    if (!url || !token) {
      setNotice("Vul zowel het bridge-adres als het token in.");
      return;
    }
    window.localStorage.setItem(URL_STORAGE_KEY, url);
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    setNotice("");
    setSettings((prev) => ({ url, token, attempt: (prev?.attempt ?? 0) + 1 }));
  }, [urlInput, tokenInput]);

  const disconnect = useCallback(() => {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setSettings(null);
    setStatus("config");
  }, []);

  // One effect owns the whole xterm + WebSocket lifecycle per connect attempt.
  useEffect(() => {
    const host = hostRef.current;
    if (!settings || !host) return;

    const wsUrl = buildBridgeUrl(settings.url, settings.token);
    if (!wsUrl) {
      setNotice("Het bridge-adres is geen geldige URL.");
      setStatus("config");
      return;
    }

    let dispose = () => {};
    let cancelled = false;
    setStatus("connecting");

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

      const ws = new WebSocket(wsUrl);
      let exited = false;

      ws.onopen = () => {
        setStatus("connected");
        setNotice("");
        ws.send(
          JSON.stringify({ type: "start", cols: term.cols, rows: term.rows, autoClaude: true }),
        );
      };

      ws.onmessage = (event) => {
        const msg = parseBridgeMessage(event.data);
        if (!msg) return;
        if (msg.type === "data") term.write(msg.data);
        else if (msg.type === "ready") setCwd(msg.cwd);
        else if (msg.type === "exit") {
          exited = true;
          term.write(`\r\n\x1b[90m[sessie beëindigd — code ${msg.code}]\x1b[0m\r\n`);
        } else if (msg.type === "error") {
          term.write(`\r\n\x1b[31m[bridge] ${msg.message}\x1b[0m\r\n`);
        }
      };

      ws.onclose = (event) => {
        if (cancelled) return;
        setStatus("offline");
        if (!exited) {
          setNotice(
            event.code === 1006
              ? "Geen verbinding met de bridge. Controleer of de daemon draait en het token klopt."
              : `Verbinding gesloten (${event.code}).`,
          );
        }
      };

      const input = term.onData((data) => {
        if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ type: "input", data }));
      });

      const doFit = () => {
        fit.fit();
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
        }
      };
      const observer = new ResizeObserver(doFit);
      observer.observe(host);
      window.addEventListener("resize", doFit);
      const initial = window.setTimeout(doFit, 60);
      const keepalive = window.setInterval(() => {
        if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ type: "ping" }));
      }, 30_000);

      dispose = () => {
        window.clearTimeout(initial);
        window.clearInterval(keepalive);
        input.dispose();
        observer.disconnect();
        window.removeEventListener("resize", doFit);
        ws.close();
        term.dispose();
      };
    })();

    return () => {
      cancelled = true;
      dispose();
    };
  }, [settings]);

  const statusLabel: Record<BridgeStatus, string> = {
    config: "niet verbonden",
    connecting: "verbinden…",
    connected: cwd ? `claude · ${cwd}` : "verbonden",
    offline: "offline",
  };

  return (
    <section className="flex flex-col rounded-2xl border border-edge bg-panel/70 p-4 backdrop-blur">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">
          From The Pit · remote terminal
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={`truncate text-xs ${status === "connected" ? "text-accent" : "text-slate-400"}`}
            title={statusLabel[status]}
          >
            {statusLabel[status]}
          </span>
          {settings ? (
            <button
              type="button"
              onClick={disconnect}
              className="rounded-lg border border-edge px-2 py-1 text-xs text-slate-300 hover:bg-edge/40"
            >
              Verbreken
            </button>
          ) : null}
        </div>
      </header>

      {settings === null || status === "offline" ? (
        <form
          className="mb-3 flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            connect();
          }}
        >
          <input
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            placeholder="Bridge-adres, bijv. wss://terminal.jouwdomein.nl"
            autoComplete="off"
            className="rounded-lg border border-edge bg-[#0d1430] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
          />
          <input
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="Bridge-token"
            type="password"
            autoComplete="off"
            className="rounded-lg border border-edge bg-[#0d1430] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-accent/20 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/30"
            >
              {status === "offline" ? "Opnieuw verbinden" : "Verbinden"}
            </button>
            {notice ? <p className="text-xs text-rose-300">{notice}</p> : null}
          </div>
        </form>
      ) : null}

      <div
        ref={hostRef}
        className={`h-80 w-full overflow-hidden rounded-xl bg-[#0d1430] p-2 ${settings ? "" : "opacity-40"}`}
      />
    </section>
  );
}
