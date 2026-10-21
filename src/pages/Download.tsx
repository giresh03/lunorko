import { useMemo, useState } from "react";
import {
  Apple, Monitor, Terminal, Download as DownloadIcon, Check, Zap, WifiOff,
  Keyboard, Maximize2, ShieldCheck, ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  DESKTOP_BUILDS,
  DESKTOP_APP_VERSION,
  detectPlatform,
  downloadUrl,
  isDesktopApp,
  type DesktopPlatformId,
} from "@/lib/desktopDownloads";

const PLATFORM_ICONS: Record<DesktopPlatformId, React.ComponentType<{ className?: string }>> = {
  mac: Apple,
  windows: Monitor,
  linux: Terminal,
};

const FEATURES = [
  { Icon: Maximize2, title: "Full-screen IDE", desc: "The editor, file tree, terminal output and live preview in a dedicated window with no browser tabs stealing space." },
  { Icon: Zap, title: "Same live backend", desc: "Your account, credits, saved projects and generated app databases are identical to the web workspace." },
  { Icon: Keyboard, title: "Native shortcuts", desc: "New build, dashboard, zoom, full screen and reload from a real menu bar and system keyboard shortcuts." },
  { Icon: WifiOff, title: "Graceful offline", desc: "Lose your connection and Lunor tells you clearly instead of showing a blank screen, then reconnects on demand." },
  { Icon: ShieldCheck, title: "Sandboxed by design", desc: "No Node access in the window, external links open in your browser, nothing runs outside the app." },
  { Icon: DownloadIcon, title: "Deep links", desc: "Shared project links open straight in the desktop app when it is installed." },
];

const Download = () => {
  const detected = useMemo(detectPlatform, []);
  const [selected, setSelected] = useState<DesktopPlatformId>(detected);
  const alreadyDesktop = useMemo(isDesktopApp, []);

  const active = DESKTOP_BUILDS.find((b) => b.id === selected) ?? DESKTOP_BUILDS[0];
  const ActiveIcon = PLATFORM_ICONS[active.id];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-1.5 text-xs text-muted-foreground">
            <DownloadIcon className="h-3.5 w-3.5 text-primary" />
            Lunor Desktop · v{DESKTOP_APP_VERSION}
          </span>
          <h1 className="mt-6 font-serif text-4xl md:text-6xl leading-tight">
            The whole Lunor workspace,<br />
            <span className="text-primary">as a desktop app</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Install Lunor on your machine and get the complete IDE — AI builds, multi-page previews,
            real databases, auth and payments — in its own native window.
          </p>

          {alreadyDesktop ? (
            <p className="mt-8 inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-3 text-sm">
              <Check className="h-4 w-4 text-primary" /> You're already running the desktop app.
            </p>
          ) : (
            <div className="mt-10 flex flex-col items-center gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-base">
                <a href={downloadUrl(active.id)}>
                  <ActiveIcon className="mr-2 h-5 w-5" />
                  Download for {active.name}
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">
                {active.fileLabel} · {active.requirement}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Platform picker */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {DESKTOP_BUILDS.map((build) => {
            const Icon = PLATFORM_ICONS[build.id];
            const isActive = build.id === selected;
            return (
              <button
                key={build.id}
                onClick={() => setSelected(build.id)}
                className={`rounded-2xl border p-6 text-left transition-all ${
                  isActive
                    ? "border-primary/60 bg-primary/5 shadow-[0_0_40px_-16px_hsl(var(--primary)/0.6)]"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {build.id === detected && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Your system
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{build.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{build.requirement}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary">
                  {build.fileLabel} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Install steps */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-8">
          <h2 className="font-serif text-2xl">Installing on {active.name}</h2>
          <ol className="mt-6 space-y-4">
            {active.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/20 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-serif text-3xl md:text-4xl">Why the desktop app</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Download;
