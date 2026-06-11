// Cos terminal bridge — runs on the user's own machine. Exposes a real PTY
// (PowerShell, optionally auto-starting `claude`) over an authenticated
// WebSocket so the Vercel-hosted cockpit can attach an xterm.js terminal.
//
// Security model: this daemon hands out a shell on this machine. Therefore:
//  - it refuses to start without a strong shared token (COS_BRIDGE_TOKEN)
//  - auth happens at HTTP-upgrade time, before any PTY exists
//  - token comparison is constant-time (hashed timingSafeEqual)
//  - repeated auth failures from one IP are blocked for a cooldown window
//  - it binds to 127.0.0.1 by default; expose it via an outbound tunnel
//    (Cloudflare Tunnel / Tailscale), never by opening a router port
//  - concurrent sessions are capped and idle sessions are reaped

import { createServer } from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import pty from "node-pty";

// ---- config ---------------------------------------------------------------

const BRIDGE_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Loads KEY=VALUE pairs from bridge/.env without overriding real env vars. */
function loadDotEnv() {
  const file = path.join(BRIDGE_DIR, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match || line.trim().startsWith("#")) continue;
    const [, key, raw] = match;
    if (process.env[key] === undefined) {
      process.env[key] = raw.replace(/^["']|["']$/g, "");
    }
  }
}
loadDotEnv();

const TOKEN = process.env.COS_BRIDGE_TOKEN ?? "";
const HOST = process.env.COS_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.COS_BRIDGE_PORT || 7070);
const PROJECT_ROOT = process.env.COS_PROJECT_ROOT || path.join(os.homedir(), "Projects");
const MAX_SESSIONS = Number(process.env.COS_BRIDGE_MAX_SESSIONS || 3);
const IDLE_MINUTES = Number(process.env.COS_BRIDGE_IDLE_MINUTES || 60);
const MAX_AUTH_FAILURES = Number(process.env.COS_BRIDGE_MAX_AUTH_FAILURES || 5);
const BLOCK_MINUTES = Number(process.env.COS_BRIDGE_BLOCK_MINUTES || 15);
const ALLOWED_ORIGINS = (process.env.COS_BRIDGE_ALLOWED_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (TOKEN.length < 32) {
  console.error(
    "[bridge] COS_BRIDGE_TOKEN ontbreekt of is te kort (min. 32 tekens). Genereer er een met: npm run token",
  );
  process.exit(1);
}

const isWindows = process.platform === "win32";
const SHELL = isWindows ? "powershell.exe" : process.env.SHELL || "bash";
const TOKEN_HASH = crypto.createHash("sha256").update(TOKEN).digest();

// ---- auth helpers ----------------------------------------------------------

/** Constant-time comparison of a candidate token against the configured one. */
function tokenMatches(candidate) {
  const candidateHash = crypto.createHash("sha256").update(candidate).digest();
  return crypto.timingSafeEqual(candidateHash, TOKEN_HASH);
}

/** @type {Map<string, { fails: number, blockedUntil: number }>} */
const authFailures = new Map();

/** Best-effort client IP; trusts tunnel headers only because we bind loopback. */
function clientIp(req) {
  return (
    req.headers["cf-connecting-ip"] ||
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function isBlocked(ip) {
  const entry = authFailures.get(ip);
  return Boolean(entry && entry.blockedUntil > Date.now());
}

function registerAuthFailure(ip) {
  const entry = authFailures.get(ip) ?? { fails: 0, blockedUntil: 0 };
  entry.fails += 1;
  if (entry.fails >= MAX_AUTH_FAILURES) {
    entry.blockedUntil = Date.now() + BLOCK_MINUTES * 60_000;
    console.warn(`[bridge] IP ${ip} geblokkeerd na ${entry.fails} mislukte auth-pogingen`);
  }
  authFailures.set(ip, entry);
}

// Forget stale failure records so the map cannot grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of authFailures) {
    if (entry.blockedUntil < now && entry.fails < MAX_AUTH_FAILURES) authFailures.delete(ip);
    else if (entry.blockedUntil !== 0 && entry.blockedUntil < now) authFailures.delete(ip);
  }
}, 60_000).unref();

/** Origin allowlist: only enforced when COS_BRIDGE_ALLOWED_ORIGINS is set. */
function originAllowed(req) {
  if (ALLOWED_ORIGINS.length === 0) return true;
  const origin = req.headers.origin;
  // Non-browser clients (no Origin header) pass; they still need the token.
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

/** Rejects a WebSocket upgrade with a plain HTTP response before handshake. */
function rejectUpgrade(socket, code, reason) {
  socket.write(`HTTP/1.1 ${code} ${reason}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

// ---- HTTP + WebSocket server ------------------------------------------------

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    res.writeHead(200, {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not Found");
});

const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 });

server.on("upgrade", (req, socket, head) => {
  const ip = clientIp(req);
  if (isBlocked(ip)) return rejectUpgrade(socket, 429, "Too Many Requests");

  let url;
  try {
    url = new URL(req.url, "http://localhost");
  } catch {
    return rejectUpgrade(socket, 400, "Bad Request");
  }
  if (url.pathname !== "/term") return rejectUpgrade(socket, 404, "Not Found");
  if (!originAllowed(req)) return rejectUpgrade(socket, 403, "Forbidden");

  const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const candidate = url.searchParams.get("token") || bearer;
  if (!candidate || !tokenMatches(candidate)) {
    registerAuthFailure(ip);
    return rejectUpgrade(socket, 401, "Unauthorized");
  }

  authFailures.delete(ip);
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
});

// ---- PTY sessions ------------------------------------------------------------

let activeSessions = 0;

/** Clamps terminal dimensions to sane values regardless of client input. */
function clampDim(value, fallback) {
  const n = Number(value);
  if (!Number.isInteger(n)) return fallback;
  return Math.min(500, Math.max(2, n));
}

function send(ws, message) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message));
}

wss.on("connection", (ws, req) => {
  const ip = clientIp(req);
  /** @type {import("node-pty").IPty | null} */
  let proc = null;
  let lastActivity = Date.now();

  const idleTimer = setInterval(() => {
    if (Date.now() - lastActivity > IDLE_MINUTES * 60_000) {
      send(ws, { type: "error", message: "Sessie beëindigd wegens inactiviteit" });
      ws.close(4000, "idle timeout");
    }
  }, 60_000);

  ws.on("message", (raw, isBinary) => {
    if (isBinary) return;
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: "error", message: "Ongeldig bericht" });
      return;
    }

    if (msg.type === "start") {
      if (proc) return;
      if (activeSessions >= MAX_SESSIONS) {
        send(ws, { type: "error", message: "Maximaal aantal sessies bereikt" });
        ws.close(4001, "session limit");
        return;
      }
      const cols = clampDim(msg.cols, 80);
      const rows = clampDim(msg.rows, 24);
      const autoClaude = Boolean(msg.autoClaude);
      const args = isWindows
        ? autoClaude
          ? ["-NoLogo", "-NoExit", "-Command", "claude"]
          : ["-NoLogo"]
        : [];

      try {
        proc = pty.spawn(SHELL, args, {
          name: "xterm-256color",
          cols,
          rows,
          cwd: PROJECT_ROOT,
          env: process.env,
        });
      } catch (err) {
        send(ws, { type: "error", message: `PTY starten mislukt: ${err.message}` });
        ws.close(1011, "pty spawn failed");
        return;
      }

      activeSessions += 1;
      console.log(`[bridge] sessie gestart voor ${ip} (actief: ${activeSessions})`);

      if (autoClaude && !isWindows) {
        setTimeout(() => {
          try {
            proc?.write("claude\n");
          } catch {
            // shell may have exited already
          }
        }, 300);
      }

      proc.onData((data) => {
        lastActivity = Date.now();
        send(ws, { type: "data", data });
      });
      proc.onExit(({ exitCode }) => {
        send(ws, { type: "exit", code: exitCode });
        ws.close(1000, "pty exited");
      });

      send(ws, { type: "ready", cwd: PROJECT_ROOT, shell: path.basename(SHELL) });
      return;
    }

    if (!proc) {
      send(ws, { type: "error", message: "Sessie is nog niet gestart" });
      return;
    }

    if (msg.type === "input" && typeof msg.data === "string") {
      lastActivity = Date.now();
      proc.write(msg.data);
    } else if (msg.type === "resize") {
      try {
        proc.resize(clampDim(msg.cols, 80), clampDim(msg.rows, 24));
      } catch {
        // resize can race with exit
      }
    } else if (msg.type === "ping") {
      send(ws, { type: "pong" });
    }
  });

  ws.on("close", () => {
    clearInterval(idleTimer);
    if (proc) {
      try {
        proc.kill();
      } catch {
        // already gone
      }
      proc = null;
      activeSessions = Math.max(0, activeSessions - 1);
      console.log(`[bridge] sessie gesloten voor ${ip} (actief: ${activeSessions})`);
    }
  });
});

// ---- lifecycle ----------------------------------------------------------------

server.listen(PORT, HOST, () => {
  console.log(`[bridge] luistert op ws://${HOST}:${PORT}/term (project-root: ${PROJECT_ROOT})`);
  console.log(
    `[bridge] max ${MAX_SESSIONS} sessies, idle-timeout ${IDLE_MINUTES} min, ` +
      `blokkade na ${MAX_AUTH_FAILURES} mislukte pogingen (${BLOCK_MINUTES} min)`,
  );
});

function shutdown() {
  console.log("[bridge] afsluiten…");
  for (const client of wss.clients) client.close(1001, "server shutdown");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
