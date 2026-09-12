import { useState } from "react";
import { Link } from "react-router-dom";
import { Server, Lock, Loader2, Copy, Check, RotateCcw, RefreshCw, Database, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { LiveRuntimeStatus } from "@/hooks/useLiveRuntime";
import type { RuntimeInfo } from "@/lib/liveRuntime";

interface Props {
  status: LiveRuntimeStatus;
  info: RuntimeInfo | null;
  error?: string | null;
  busy?: boolean;
  onReset?: () => void;
  onRefresh?: () => void;
  onStart?: () => void;
  /** Compact = single status pill for toolbars; expands on click. */
  compact?: boolean;
  className?: string;
}

const STATUS_META: Record<LiveRuntimeStatus, { label: string; dot: string }> = {
  off: { label: "Backend off", dot: "bg-muted-foreground/50" },
  locked: { label: "Backend locked", dot: "bg-amber-500" },
  starting: { label: "Starting backend", dot: "bg-primary animate-pulse" },
  live: { label: "Backend live", dot: "bg-emerald-500 shadow-[0_0_8px_rgb(16_185_129/0.8)]" },
  error: { label: "Backend error", dot: "bg-destructive" },
};

export default function LiveBackendPanel({
  status,
  info,
  error,
  busy,
  onReset,
  onRefresh,
  onStart,
  compact = false,
  className = "",
}: Props) {
  const [open, setOpen] = useState(!compact);
  const [copied, setCopied] = useState(false);
  const meta = STATUS_META[status];

  const copyUrl = async () => {
    if (!info?.apiUrl) return;
    try {
      await navigator.clipboard.writeText(info.apiUrl);
      setCopied(true);
      toast.success("API URL copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  const pill = (
    <button
      type="button"
      onClick={() => compact && setOpen((o) => !o)}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-foreground/80 hover:bg-muted/60 transition-colors ${compact ? "cursor-pointer" : "cursor-default"}`}
      title={status === "live" && info ? info.apiUrl : meta.label}
    >
      {status === "starting" ? (
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
      ) : status === "locked" ? (
        <Lock className="h-3 w-3 text-amber-500" />
      ) : (
        <Server className="h-3 w-3" />
      )}
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      <span>{meta.label}</span>
    </button>
  );

  if (compact && !open) return <div className={className}>{pill}</div>;

  return (
    <div className={`relative ${className}`}>
      {compact && pill}
      <div
        className={`${compact ? "absolute right-0 top-full mt-1 z-40 w-72 shadow-xl" : "w-full"} rounded-lg border border-border/60 bg-card/95 backdrop-blur p-3 text-xs space-y-2`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold">
            <Server className="h-3.5 w-3.5 text-primary" /> Live Backend
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
          </span>
        </div>

        {status === "locked" && (
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Run generated apps with real sign-up, login and saved data. Available on Pro, Premium and Professional.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Lock className="h-3 w-3" /> Upgrade to unlock
            </Link>
          </div>
        )}

        {status === "off" && (
          <div className="space-y-2">
            <p className="text-muted-foreground">Start a hosted API for this project (auth + database).</p>
            {onStart && (
              <button
                onClick={onStart}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Server className="h-3 w-3" /> Start backend
              </button>
            )}
          </div>
        )}

        {status === "starting" && (
          <p className="text-muted-foreground flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" /> Provisioning your API…
          </p>
        )}

        {status === "error" && (
          <div className="space-y-2">
            <p className="text-destructive flex items-start gap-1.5">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" /> {error || "Could not start the backend."}
            </p>
            {onStart && (
              <button onClick={onStart} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-muted">
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            )}
          </div>
        )}

        {status === "live" && info && (
          <>
            <div className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-1">
              <code className="flex-1 truncate font-mono text-[10px] text-foreground/80">{info.apiUrl}</code>
              <button onClick={copyUrl} className="p-0.5 text-muted-foreground hover:text-foreground" title="Copy API URL">
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-border/60 p-2">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Users className="h-3 w-3" /> Users</div>
                <div className="text-base font-semibold">{info.stats.users}</div>
              </div>
              <div className="rounded-md border border-border/60 p-2">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Database className="h-3 w-3" /> Records</div>
                <div className="text-base font-semibold">{info.stats.documents}</div>
              </div>
            </div>
            {info.stats.collections.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {info.stats.collections.map((c) => (
                  <span key={c} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{c}</span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              Routes: <code>/auth/register</code>, <code>/auth/login</code>, <code>/auth/me</code>, <code>/&lt;collection&gt;</code> CRUD. Your app's <code>/api</code> calls are routed here automatically.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {onRefresh && (
                <button onClick={onRefresh} disabled={busy} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-muted disabled:opacity-50">
                  <RefreshCw className={`h-3 w-3 ${busy ? "animate-spin" : ""}`} /> Refresh
                </button>
              )}
              {onReset && (
                <button
                  onClick={() => {
                    if (confirm("Delete all users and records for this project's backend?")) onReset();
                  }}
                  disabled={busy}
                  className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1 text-[11px] text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <RotateCcw className="h-3 w-3" /> Reset data
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
