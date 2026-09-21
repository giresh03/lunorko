/* Lunor Desktop — Electron main process (CommonJS on purpose: package.json is "type": "module") */
const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const REMOTE_URL = process.env.LUNOR_URL || "https://lunor.online";
const BUNDLED_INDEX = path.join(__dirname, "..", "dist", "index.html");
const OFFLINE_PAGE = path.join(__dirname, "offline.html");
const STATE_FILE = () => path.join(app.getPath("userData"), "window-state.json");

let mainWindow = null;
let usingFallback = false;

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE(), "utf8"));
  } catch {
    return null;
  }
}

function saveState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const bounds = mainWindow.getNormalBounds ? mainWindow.getNormalBounds() : mainWindow.getBounds();
    fs.writeFileSync(
      STATE_FILE(),
      JSON.stringify({ ...bounds, maximized: mainWindow.isMaximized() }),
      "utf8",
    );
  } catch {
    /* non-fatal */
  }
}

function loadFallback() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  usingFallback = true;
  if (fs.existsSync(BUNDLED_INDEX)) {
    mainWindow.loadFile(BUNDLED_INDEX);
  } else {
    mainWindow.loadFile(OFFLINE_PAGE);
  }
}

function createWindow() {
  const state = readState();
  mainWindow = new BrowserWindow({
    width: state?.width || 1440,
    height: state?.height || 900,
    x: state?.x,
    y: state?.y,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    backgroundColor: "#0b0b12",
    title: "Lunor AI",
    autoHideMenuBar: false,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: true,
      webviewTag: false,
    },
  });

  if (!state || state.maximized) mainWindow.maximize();

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("close", saveState);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Open external links in the user's browser, keep app navigation inside.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(REMOTE_URL)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("did-fail-load", (_e, code, _desc, url, isMainFrame) => {
    if (!isMainFrame || usingFallback) return;
    // -3 = aborted (redirects / user navigation), not a real failure
    if (code === -3) return;
    if (url.startsWith("file://")) return;
    loadFallback();
  });

  mainWindow.loadURL(REMOTE_URL);
}

function buildMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
      label: "File",
      submenu: [
        {
          label: "New Build",
          accelerator: "CmdOrCtrl+N",
          click: () => mainWindow?.webContents.executeJavaScript(
            "window.location.assign('/domain/web-development')",
          ),
        },
        {
          label: "Dashboard",
          accelerator: "CmdOrCtrl+D",
          click: () => mainWindow?.webContents.executeJavaScript(
            "window.location.assign('/dashboard')",
          ),
        },
        { type: "separator" },
        {
          label: "Open Lunor in Browser",
          click: () => shell.openExternal(REMOTE_URL),
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    { role: "editMenu" },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        {
          label: "Reconnect to Lunor",
          click: () => {
            usingFallback = false;
            mainWindow?.loadURL(REMOTE_URL);
          },
        },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
        { role: "toggleDevTools" },
      ],
    },
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
        {
          label: "About Lunor Desktop",
          click: () =>
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Lunor Desktop",
              message: `Lunor AI Desktop v${app.getVersion()}`,
              detail: `AI engineering workspace for students.\n${REMOTE_URL}`,
              buttons: ["OK"],
            }),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Single instance + deep links (lunor://...)
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_e, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const deepLink = argv.find((a) => a.startsWith("lunor://"));
    if (deepLink) openDeepLink(deepLink);
  });

  app.whenReady().then(() => {
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient("lunor", process.execPath, [path.resolve(process.argv[1])]);
      }
    } else {
      app.setAsDefaultProtocolClient("lunor");
    }
    buildMenu();
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

function openDeepLink(link) {
  const route = link.replace(/^lunor:\/\//, "");
  const target = `${REMOTE_URL}/${route.replace(/^\/+/, "")}`;
  if (mainWindow) mainWindow.loadURL(target);
}

app.on("open-url", (event, url) => {
  event.preventDefault();
  openDeepLink(url);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
