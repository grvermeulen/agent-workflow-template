// Electron shell for The Pit. Boots the Next.js app and exposes a real PTY so the
// in-app terminal can run `claude` — the thing Vercel's serverless runtime can't do.
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const http = require("http");
const os = require("os");
const { spawn } = require("child_process");
const pty = require("node-pty");

const PORT = Number(process.env.COS_PORT || 3000);
const APP_URL = `http://localhost:${PORT}`;
const COCKPIT_DIR = path.join(__dirname, "..");

// Where the terminal opens. Defaults to the folder that holds all repos, so Claude
// can work across them (multi-repo). Override with COS_PROJECT_ROOT.
const PROJECT_ROOT = process.env.COS_PROJECT_ROOT || path.join(os.homedir(), "Projects");

const isWindows = process.platform === "win32";
const shell = isWindows ? "powershell.exe" : process.env.SHELL || "bash";

/** @type {import("child_process").ChildProcess | null} */
let nextProc = null;
/** @type {BrowserWindow | null} */
let mainWindow = null;
/** @type {Map<string, import("node-pty").IPty>} */
const ptyProcs = new Map();

/** Resolves true if something already answers at the app URL. */
function isServerUp(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.destroy();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/** Polls the app URL until it responds or the timeout elapses. */
function waitForServer(url, timeoutMs = 90000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      if (await isServerUp(url)) return resolve();
      if (Date.now() - start > timeoutMs) return reject(new Error("Next.js server kwam niet op"));
      setTimeout(tick, 400);
    };
    tick();
  });
}

/** Spawns the Next.js dev server for this cockpit. */
function startNext() {
  nextProc = spawn(`npm run dev -- -p ${PORT}`, {
    cwd: COCKPIT_DIR,
    env: { ...process.env, BROWSER: "none" },
    stdio: "inherit",
    shell: true,
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#060a16",
    title: "Cos — The Pit",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadURL(APP_URL);
}

// ---- PTY bridge ----------------------------------------------------------

ipcMain.on("cos-term:default-cwd", (event) => {
  event.returnValue = PROJECT_ROOT;
});

ipcMain.on("cos-term:start", (event, { id, cwd, autoClaude }) => {
  const workdir = cwd || PROJECT_ROOT;
  const args = isWindows
    ? autoClaude
      ? ["-NoLogo", "-NoExit", "-Command", "claude"]
      : ["-NoLogo"]
    : [];

  const proc = pty.spawn(shell, args, {
    name: "xterm-256color",
    cols: 80,
    rows: 24,
    cwd: workdir,
    env: process.env,
  });
  ptyProcs.set(id, proc);

  if (autoClaude && !isWindows) {
    setTimeout(() => {
      try {
        proc.write("claude\n");
      } catch {
        // shell may have exited
      }
    }, 300);
  }

  proc.onData((data) => event.sender.send("cos-term:data", { id, data }));
  proc.onExit(({ exitCode }) => {
    event.sender.send("cos-term:exit", { id, exitCode });
    ptyProcs.delete(id);
  });
});

ipcMain.on("cos-term:input", (_event, { id, data }) => {
  ptyProcs.get(id)?.write(data);
});

ipcMain.on("cos-term:resize", (_event, { id, cols, rows }) => {
  try {
    ptyProcs.get(id)?.resize(cols, rows);
  } catch {
    // resize can race with exit
  }
});

ipcMain.on("cos-term:kill", (_event, { id }) => {
  ptyProcs.get(id)?.kill();
  ptyProcs.delete(id);
});

// ---- lifecycle -----------------------------------------------------------

function killNext() {
  if (!nextProc || nextProc.killed) return;
  if (isWindows) {
    try {
      spawn("taskkill", ["/pid", String(nextProc.pid), "/T", "/F"], { stdio: "ignore" });
    } catch {
      // best effort
    }
  } else {
    nextProc.kill("SIGTERM");
  }
}

app.whenReady().then(async () => {
  if (!(await isServerUp(APP_URL))) startNext();
  try {
    await waitForServer(APP_URL);
  } catch (err) {
    console.error("[cos] ", err.message);
  }
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  for (const proc of ptyProcs.values()) {
    try {
      proc.kill();
    } catch {
      // already gone
    }
  }
  killNext();
  app.quit();
});

app.on("before-quit", killNext);
