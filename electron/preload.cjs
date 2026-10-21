const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("lunorDesktop", {
  isDesktop: true,
  platform: process.platform,
  version: process.env.LUNOR_APP_VERSION || "1.0.0",
  ping: () => ipcRenderer.invoke("lunor:ping"),
});
