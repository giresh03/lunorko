# Lunor Desktop — turn the site into a downloadable IDE app

Goal: users download Lunor as a real desktop application (Mac, Windows, Linux) that opens the full workspace — editor, preview, live backend, login — in its own native window, with no browser needed.

## How it will work

The desktop app is a native shell around your existing app:

- It loads your live site (lunor.online) so builds, login, credits, payments and the AI all keep working exactly as they do today — no second copy of the backend.
- If the machine is offline, it falls back to a copy of the app bundled inside the download and shows a clear "you're offline" notice instead of a blank window.
- Native window chrome: app icon, real menu bar (File / Edit / View / Window), keyboard shortcuts (save, new build, zoom, reload, full screen, dev tools), copy/paste, and external links opening in the user's browser instead of hijacking the app window.
- Window size and position are remembered between launches, opening maximized on first run so the editor has room.
- Deep-link support so `lunor://` links (and shared project links) open inside the app.

## What users see on the site

A new **Download** entry in the header with a `/download` page: platform auto-detected (Mac / Windows / Linux), a primary download button, the other platforms listed below it, install steps, version number, and screenshots of the desktop window. Same dark obsidian/indigo styling as the rest of the site.

## Technical plan

- `electron/main.cjs` — CommonJS main process. `BrowserWindow` with `contextIsolation: true`, `nodeIntegration: false`, custom user-agent, remembered bounds, app menu, `setWindowOpenHandler` sending external URLs to the system browser, and a load-failure handler that swaps to the bundled `dist/index.html`.
- `electron/preload.cjs` — exposes a minimal `window.lunorDesktop` flag (version, platform) so the web app can show desktop-only touches.
- `vite.config.ts` — `base: './'` so the bundled fallback works under `file://`.
- `package.json` — `"main": "electron/main.cjs"`, dev-deps `electron` + `@electron/packager`.
- Packaging with `@electron/packager` for `darwin`, `win32` and `linux` (x64), archived as `.zip` / `.tar.gz` into Files for you to host.
- `src/pages/Download.tsx` + route + header link; download URLs read from one constants file so swapping in new builds is a one-line change.

## Notes

- `.dmg` and `.exe` installers need macOS/Windows signing tooling that isn't available here, so downloads are `.zip` (Mac, Windows) and `.tar.gz` (Linux). Users unzip and run — that is enough for demos and early users; signed installers are a later step.
- Unsigned apps show a one-time Gatekeeper/SmartScreen warning; the install steps on the page explain how to get past it.
- The desktop app needs the site to be published for its online mode, which it already is.
