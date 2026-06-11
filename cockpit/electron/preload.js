// Bridges the renderer (the Next.js page) to the PTY in the main process.
// contextIsolation is on, so the page only sees this narrow, safe surface.
const { contextBridge, ipcRenderer } = require("electron");

let seq = 0;

contextBridge.exposeInMainWorld("cosTerminal", {
  isAvailable: true,

  /** Default working directory the terminal opens in (multi-repo root). */
  defaultCwd() {
    return ipcRenderer.sendSync("cos-term:default-cwd");
  },

  /**
   * Spawns a PTY session.
   * @param {{ cwd?: string, autoClaude?: boolean }} opts
   * @returns {string} session id
   */
  start(opts) {
    const id = `t${++seq}`;
    ipcRenderer.send("cos-term:start", { id, cwd: opts?.cwd, autoClaude: opts?.autoClaude ?? true });
    return id;
  },

  write(id, data) {
    ipcRenderer.send("cos-term:input", { id, data });
  },

  resize(id, cols, rows) {
    ipcRenderer.send("cos-term:resize", { id, cols, rows });
  },

  kill(id) {
    ipcRenderer.send("cos-term:kill", { id });
  },

  onData(id, cb) {
    const handler = (_event, msg) => {
      if (msg.id === id) cb(msg.data);
    };
    ipcRenderer.on("cos-term:data", handler);
    return () => ipcRenderer.removeListener("cos-term:data", handler);
  },

  onExit(id, cb) {
    const handler = (_event, msg) => {
      if (msg.id === id) cb(msg.exitCode);
    };
    ipcRenderer.on("cos-term:exit", handler);
    return () => ipcRenderer.removeListener("cos-term:exit", handler);
  },
});
