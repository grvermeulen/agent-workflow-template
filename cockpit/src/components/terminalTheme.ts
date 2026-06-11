/** xterm theme tuned to the cockpit's dark palette (see globals.css). */
export const TERMINAL_THEME = {
  background: "#0d1430",
  foreground: "#e6edf8",
  cursor: "#38bdf8",
  selectionBackground: "#1e2a52",
  black: "#1e2a52",
  red: "#fb7185",
  green: "#34d399",
  yellow: "#fbbf24",
  blue: "#38bdf8",
  magenta: "#6366f1",
  cyan: "#22d3ee",
  white: "#e6edf8",
} as const;

/** Shared font stack for cockpit terminals. */
export const TERMINAL_FONT = "'Cascadia Code', 'JetBrains Mono', Consolas, monospace";
