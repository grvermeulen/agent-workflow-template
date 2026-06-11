// Security & end-to-end tests for the bridge daemon. Spawns the real server
// (real PTY, real WebSocket) and attacks it the way an outsider would.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const BRIDGE_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SERVER = path.join(BRIDGE_DIR, "server.mjs");
const TOKEN = crypto.randomBytes(32).toString("base64url");

/** Starts a bridge instance on the given port and waits for /healthz. */
async function startServer(port, extraEnv = {}) {
  const proc = spawn(process.execPath, [SERVER], {
    env: {
      ...process.env,
      COS_BRIDGE_TOKEN: TOKEN,
      COS_BRIDGE_PORT: String(port),
      COS_BRIDGE_HOST: "127.0.0.1",
      ...extraEnv,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  proc.stderr.on("data", (d) => process.stderr.write(`[server:${port}] ${d}`));

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/healthz`);
      if (res.ok) return proc;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  proc.kill();
  throw new Error(`bridge op poort ${port} kwam niet op`);
}

/** Opens a WS and resolves with either "open" or the HTTP error status. */
function tryConnect(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, { headers, handshakeTimeout: 5000 });
    ws.on("open", () => resolve({ outcome: "open", ws }));
    ws.on("unexpected-response", (_req, res) => {
      ws.terminate();
      resolve({ outcome: res.statusCode });
    });
    ws.on("error", (err) => {
      // "unexpected-response" handles HTTP rejections; anything else is real.
      if (!String(err.message).includes("Unexpected server response")) reject(err);
    });
  });
}

/** Collects messages until predicate matches or timeout. */
function waitFor(ws, predicate, timeoutMs = 20_000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("timeout terwijl we wachtten op een bericht")),
      timeoutMs,
    );
    const onMessage = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (predicate(msg)) {
        clearTimeout(timer);
        ws.off("message", onMessage);
        resolve(msg);
      }
    };
    ws.on("message", onMessage);
  });
}

const PORT_MAIN = 7461;
const PORT_RATELIMIT = 7462;
const PORT_LIMIT = 7463;

let mainServer;

before(async () => {
  mainServer = await startServer(PORT_MAIN);
});

after(() => {
  mainServer?.kill();
});

// ---- unauthenticated surface -------------------------------------------------

test("healthz antwoordt zonder auth en lekt niets", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT_MAIN}/healthz`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test("onbekende HTTP-paden geven 404", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT_MAIN}/term`);
  assert.equal(res.status, 404);
});

test("upgrade zonder token wordt geweigerd met 401", async () => {
  const { outcome } = await tryConnect(`ws://127.0.0.1:${PORT_MAIN}/term`);
  assert.equal(outcome, 401);
});

test("upgrade met fout token wordt geweigerd met 401", async () => {
  const { outcome } = await tryConnect(`ws://127.0.0.1:${PORT_MAIN}/term?token=verkeerd-token-x`);
  assert.equal(outcome, 401);
});

test("upgrade op fout pad wordt geweigerd met 404", async () => {
  const { outcome } = await tryConnect(`ws://127.0.0.1:${PORT_MAIN}/anders?token=${TOKEN}`);
  assert.equal(outcome, 404);
});

test("server start niet zonder (of met te kort) token", async () => {
  const proc = spawn(process.execPath, [SERVER], {
    env: { ...process.env, COS_BRIDGE_TOKEN: "kort", COS_BRIDGE_PORT: "7499" },
    stdio: ["ignore", "ignore", "pipe"],
  });
  const code = await new Promise((resolve) => proc.on("exit", resolve));
  assert.equal(code, 1);
});

// ---- origin allowlist ----------------------------------------------------------

test("origin-allowlist blokkeert vreemde browser-origins (403), juiste origin mag door", async () => {
  const proc = await startServer(PORT_LIMIT, {
    COS_BRIDGE_ALLOWED_ORIGINS: "https://cockpit.example.com",
  });
  try {
    const bad = await tryConnect(`ws://127.0.0.1:${PORT_LIMIT}/term?token=${TOKEN}`, {
      origin: "https://kwaadaardig.example.com",
    });
    assert.equal(bad.outcome, 403);

    const good = await tryConnect(`ws://127.0.0.1:${PORT_LIMIT}/term?token=${TOKEN}`, {
      origin: "https://cockpit.example.com",
    });
    assert.equal(good.outcome, "open");
    good.ws.close();
  } finally {
    proc.kill();
  }
});

// ---- authenticated happy path ---------------------------------------------------

test("geldig token → PTY-sessie met echte command-output en resize", async (t) => {
  const { outcome, ws } = await tryConnect(`ws://127.0.0.1:${PORT_MAIN}/term?token=${TOKEN}`);
  assert.equal(outcome, "open");
  t.after(() => ws.close());

  ws.send(JSON.stringify({ type: "start", cols: 100, rows: 30, autoClaude: false }));
  const ready = await waitFor(ws, (m) => m.type === "ready");
  assert.ok(ready.cwd.length > 0);

  // Wait for the shell prompt, then run a real command end-to-end.
  await waitFor(ws, (m) => m.type === "data");
  const marker = `COS_E2E_${crypto.randomBytes(4).toString("hex")}`;
  ws.send(JSON.stringify({ type: "input", data: `echo ${marker}\r` }));

  let seen = "";
  await waitFor(ws, (m) => {
    if (m.type === "data") seen += m.data;
    // Marker appears once as typed input echo and once as command output.
    return seen.split(marker).length >= 3;
  });

  // Resize must be accepted without the server erroring or closing.
  ws.send(JSON.stringify({ type: "resize", cols: 120, rows: 40 }));
  ws.send(JSON.stringify({ type: "ping" }));
  await waitFor(ws, (m) => m.type === "pong");
});

test("input vóór start wordt geweigerd (geen impliciete shell)", async (t) => {
  const { outcome, ws } = await tryConnect(`ws://127.0.0.1:${PORT_MAIN}/term?token=${TOKEN}`);
  assert.equal(outcome, "open");
  t.after(() => ws.close());

  ws.send(JSON.stringify({ type: "input", data: "echo hack\r" }));
  const err = await waitFor(ws, (m) => m.type === "error");
  assert.match(err.message, /niet gestart/i);
});

test("sessielimiet: extra sessie wordt geweigerd", async (t) => {
  const proc = await startServer(PORT_LIMIT + 10, { COS_BRIDGE_MAX_SESSIONS: "1" });
  t.after(() => proc.kill());

  const first = await tryConnect(`ws://127.0.0.1:${PORT_LIMIT + 10}/term?token=${TOKEN}`);
  assert.equal(first.outcome, "open");
  t.after(() => first.ws.close());
  first.ws.send(JSON.stringify({ type: "start", cols: 80, rows: 24 }));
  await waitFor(first.ws, (m) => m.type === "ready");

  const second = await tryConnect(`ws://127.0.0.1:${PORT_LIMIT + 10}/term?token=${TOKEN}`);
  assert.equal(second.outcome, "open");
  second.ws.send(JSON.stringify({ type: "start", cols: 80, rows: 24 }));
  const err = await waitFor(second.ws, (m) => m.type === "error");
  assert.match(err.message, /maximaal/i);
});

// ---- rate limiting (own instance: blocking is per IP and would poison the rest) --

test("rate-limiting: na 5 foute pogingen is ook het júiste token geblokkeerd (429)", async (t) => {
  const proc = await startServer(PORT_RATELIMIT, {
    COS_BRIDGE_MAX_AUTH_FAILURES: "5",
    COS_BRIDGE_BLOCK_MINUTES: "15",
  });
  t.after(() => proc.kill());

  for (let i = 0; i < 5; i++) {
    const { outcome } = await tryConnect(`ws://127.0.0.1:${PORT_RATELIMIT}/term?token=fout-${i}`);
    assert.equal(outcome, 401);
  }
  const blocked = await tryConnect(`ws://127.0.0.1:${PORT_RATELIMIT}/term?token=${TOKEN}`);
  assert.equal(blocked.outcome, 429);
});
