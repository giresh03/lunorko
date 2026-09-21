export const DESKTOP_APP_VERSION = "1.0.0";

export type DesktopPlatformId = "mac" | "windows" | "linux";

export interface DesktopBuild {
  id: DesktopPlatformId;
  name: string;
  requirement: string;
  fileLabel: string;
  /** Swap these URLs when you host a new build. */
  url: string;
  steps: string[];
}

export const DESKTOP_BUILDS: DesktopBuild[] = [
  {
    id: "mac",
    name: "macOS",
    requirement: "macOS 11 or newer · Intel & Apple silicon (Rosetta)",
    fileLabel: "Lunor-mac-x64.zip",
    url: "https://github.com/lunor-ai/lunor-desktop/releases/latest/download/Lunor-mac-x64.zip",
    steps: [
      "Unzip the download and drag Lunor.app into your Applications folder.",
      "First launch: right-click the app and choose Open, then confirm — macOS shows this once for apps outside the App Store.",
      "Lunor opens in its own window and signs you in with your existing account.",
    ],
  },
  {
    id: "windows",
    name: "Windows",
    requirement: "Windows 10 or 11 · 64-bit",
    fileLabel: "Lunor-win-x64.zip",
    url: "https://github.com/lunor-ai/lunor-desktop/releases/latest/download/Lunor-win-x64.zip",
    steps: [
      "Unzip the download to a folder you keep, such as Documents.",
      "Run Lunor.exe. If Windows shows a blue SmartScreen notice, click More info then Run anyway.",
      "Right-click Lunor.exe and choose Pin to taskbar for one-click access.",
    ],
  },
  {
    id: "linux",
    name: "Linux",
    requirement: "Ubuntu 20.04+, Fedora, Debian · x64",
    fileLabel: "Lunor-linux-x64.tar.gz",
    url: "https://github.com/lunor-ai/lunor-desktop/releases/latest/download/Lunor-linux-x64.tar.gz",
    steps: [
      "Extract the archive: tar -xzf Lunor-linux-x64.tar.gz",
      "Enter the folder and run ./Lunor",
      "Optional: create a .desktop launcher so it appears in your applications menu.",
    ],
  },
];

export function detectPlatform(): DesktopPlatformId {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  return "linux";
}

export function isDesktopApp(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { lunorDesktop?: unknown }).lunorDesktop);
}
