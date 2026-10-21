import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, RefreshCw } from "lucide-react";

type Row = { layer: string; domain: string | null };

export function AITrainingDataCard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [uiCount, setUiCount] = useState(0);

  const load = async () => {
    setLoading(true);
    const [{ data }, { count }] = await Promise.all([
      supabase.from("ai_exemplars").select("layer, domain").limit(5000),
      supabase.from("ui_components").select("id", { count: "exact", head: true }),
    ]);
    setRows((data as Row[]) || []);
    setUiCount(count ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const byLayer = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.layer] = (acc[r.layer] || 0) + 1;
    return acc;
  }, {});
  const byDomain = rows.reduce<Record<string, number>>((acc, r) => {
    const k = r.domain || "general";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const topDomains = Object.entries(byDomain).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">AI Training Data</p>
            <p className="text-xs text-muted-foreground">Exemplars grounding the code engine</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold">{rows.length.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">total curated examples</p>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{uiCount.toLocaleString()}</span> premium UI components loaded
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(byLayer).sort((a, b) => b[1] - a[1]).map(([layer, n]) => (
          <Badge key={layer} variant="secondary" className="capitalize">
            {layer} · {n}
          </Badge>
        ))}
      </div>

      <div className="space-y-1.5">
        {topDomains.map(([domain, n]) => (
          <div key={domain} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-xs capitalize text-muted-foreground">{domain}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, (n / (topDomains[0]?.[1] || 1)) * 100)}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
