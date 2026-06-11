"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CommandInput } from "@/components/CommandInput";

// Both terminals need the browser (xterm) and the Electron one needs a PTY, so
// load them lazily with SSR disabled.
const TerminalPanel = dynamic(
  () => import("@/components/TerminalPanel").then((m) => m.TerminalPanel),
  { ssr: false },
);
const RemoteTerminalPanel = dynamic(
  () => import("@/components/RemoteTerminalPanel").then((m) => m.RemoteTerminalPanel),
  { ssr: false },
);

const MODE_STORAGE_KEY = "cos.console.mode";

type ConsoleMode = "chat" | "terminal";

/**
 * The Pit's console. In the Electron desktop app it renders a local `claude`
 * terminal. On the web it offers two modes: the chat, or a remote terminal that
 * attaches to the bridge daemon on the user's own machine. The choice is made on
 * the client after mount, so the server-rendered HTML always matches the chat.
 *
 * @returns The console for the current environment and mode.
 */
export function PitConsole(): React.ReactElement {
  const [isDesktop, setIsDesktop] = useState(false);
  const [mode, setMode] = useState<ConsoleMode>("chat");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDesktop(Boolean(window.cosTerminal?.isAvailable));
    const saved = window.localStorage.getItem(MODE_STORAGE_KEY);
    if (saved === "chat" || saved === "terminal") {
      setMode(saved);
    } else if (process.env.NEXT_PUBLIC_COS_BRIDGE_URL) {
      setMode("terminal");
    }
    setMounted(true);
  }, []);

  if (isDesktop) return <TerminalPanel />;

  const switchTo = (next: ConsoleMode) => {
    window.localStorage.setItem(MODE_STORAGE_KEY, next);
    setMode(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {mounted ? (
        <div className="flex justify-end gap-1 text-xs">
          <button
            type="button"
            onClick={() => switchTo("chat")}
            className={`rounded-lg px-2 py-1 ${mode === "chat" ? "bg-accent/20 text-accent" : "text-slate-400 hover:text-slate-200"}`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => switchTo("terminal")}
            className={`rounded-lg px-2 py-1 ${mode === "terminal" ? "bg-accent/20 text-accent" : "text-slate-400 hover:text-slate-200"}`}
          >
            Terminal
          </button>
        </div>
      ) : null}
      {mounted && mode === "terminal" ? <RemoteTerminalPanel /> : <CommandInput />}
    </div>
  );
}
