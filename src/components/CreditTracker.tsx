import { Link } from "react-router-dom";
import { Coins, Zap } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { cn } from "@/lib/utils";

interface CreditTrackerProps {
  className?: string;
  compact?: boolean;
}

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  premium: "Premium",
  professional: "Professional",
};

export function CreditTracker({ className, compact = false }: CreditTrackerProps) {
  const { credits } = useCredits();
  if (!credits) return null;

  const total = Math.max(credits.allowance, credits.usedThisMonth + credits.balance);
  const usedPct = Math.min(100, Math.round((credits.usedThisMonth / Math.max(total, 1)) * 100));
  const low = credits.balance <= Math.max(5, Math.round(credits.allowance * 0.05));

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-xs", className)}>
        <Zap className={cn("h-3.5 w-3.5", low ? "text-destructive" : "text-primary")} />
        <span className="font-semibold text-foreground">{credits.balance.toLocaleString()}</span>
        <span className="text-muted-foreground">credits</span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card/60 p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI credit tracker</span>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {PLAN_LABEL[credits.planId] ?? credits.planId}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", low ? "bg-destructive" : "bg-primary")}
          style={{ width: `${usedPct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Used <span className="font-semibold text-foreground">{credits.usedThisMonth.toLocaleString()}</span> this month
        </span>
        <span>
          <span className={cn("font-semibold", low ? "text-destructive" : "text-foreground")}>
            {credits.balance.toLocaleString()}
          </span>{" "}
          left of {total.toLocaleString()}
        </span>
      </div>

      <div className="mt-1 text-[11px] text-muted-foreground">
        {credits.planCredits.toLocaleString()} plan + {credits.topupCredits.toLocaleString()} top-up
      </div>

      {credits.recent.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-border pt-2">
          {credits.recent.map((r) => (
            <li key={r.id} className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="truncate">{r.feature.replace(/[-_]/g, " ")}</span>
              <span className="tabular-nums">
                -{r.amount} · {new Date(r.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/pricing"
        className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
      >
        Top up 200 credits for ₹50 →
      </Link>
    </div>
  );
}

export default CreditTracker;
