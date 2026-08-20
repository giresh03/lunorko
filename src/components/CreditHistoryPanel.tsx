import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Gift, History, RefreshCw, Settings2 } from "lucide-react";
import { useCreditHistory, type CreditTransactionKind } from "@/hooks/useCredits";
import { cn } from "@/lib/utils";

interface CreditHistoryPanelProps {
  className?: string;
  limit?: number;
}

type Filter = "all" | CreditTransactionKind;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "usage", label: "Usage" },
  { key: "topup", label: "Top-ups" },
  { key: "grant", label: "Grants" },
  { key: "adjustment", label: "Adjustments" },
];

const KIND_META: Record<CreditTransactionKind, { label: string; icon: typeof History }> = {
  usage: { label: "AI usage", icon: ArrowDownRight },
  topup: { label: "Top-up", icon: ArrowUpRight },
  grant: { label: "Monthly grant", icon: Gift },
  adjustment: { label: "Adjustment", icon: Settings2 },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function CreditHistoryPanel({ className, limit = 60 }: CreditHistoryPanelProps) {
  const { transactions, loading, refetch } = useCreditHistory(limit);
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(
    () => (filter === "all" ? transactions : transactions.filter((t) => t.kind === filter)),
    [transactions, filter],
  );

  const totals = useMemo(() => {
    let spent = 0;
    let added = 0;
    for (const t of transactions) {
      if (t.amount < 0) spent += Math.abs(t.amount);
      else added += t.amount;
    }
    return { spent, added };
  }, [transactions]);

  return (
    <div className={cn("rounded-xl border border-border bg-card/60 p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Credit transaction history</span>
        </div>
        <button
          onClick={refetch}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          title="Refresh history"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="mt-1 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">{totals.added.toLocaleString()}</span> credits added ·{" "}
        <span className="font-semibold text-foreground">{totals.spent.toLocaleString()}</span> spent
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
              filter === f.key
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto border-t border-border pt-2">
        {rows.map((t) => {
          const meta = KIND_META[t.kind] ?? KIND_META.adjustment;
          const Icon = meta.icon;
          const positive = t.amount >= 0;
          return (
            <li key={t.id} className="flex items-center gap-2 rounded-md px-1 py-1.5 text-xs hover:bg-muted/40">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                  positive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">
                  {t.description?.replace(/[-_]/g, " ") || meta.label}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {meta.label} · {formatDate(t.created_at)}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span
                  className={cn(
                    "block font-semibold tabular-nums",
                    positive ? "text-primary" : "text-destructive",
                  )}
                >
                  {positive ? "+" : "−"}
                  {Math.abs(t.amount).toLocaleString()}
                </span>
                <span className="block text-[10px] text-muted-foreground tabular-nums">
                  bal {t.balance_after.toLocaleString()}
                </span>
              </span>
            </li>
          );
        })}

        {rows.length === 0 && (
          <li className="py-6 text-center text-xs text-muted-foreground">
            {loading ? "Loading history…" : "No credit transactions yet."}
          </li>
        )}
      </ul>
    </div>
  );
}

export default CreditHistoryPanel;
