import { useMemo, useState } from "react";
import { Lock, Unlock, ShieldAlert, Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFeatureLocks, type FeatureLock } from "@/hooks/useFeatureLocks";

const CATEGORY_LABELS: Record<string, string> = {
  learning: "Learning",
  ai: "AI & Tools",
  career: "Career",
  social: "Community",
  tools: "Builders",
  general: "General",
};

export function SystemControl() {
  const { locks, loading, reload } = useFeatureLocks();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const grouped = useMemo(() => {
    const map: Record<string, FeatureLock[]> = {};
    locks.forEach((l) => {
      map[l.category] = map[l.category] || [];
      map[l.category].push(l);
    });
    return map;
  }, [locks]);

  const lockedCount = locks.filter((l) => l.locked).length;

  const save = async (key: string, patch: Partial<FeatureLock>) => {
    setBusy(key);
    const { error } = await supabase.from("feature_locks").update(patch).eq("key", key);
    setBusy(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    await reload();
  };

  const setAll = async (locked: boolean) => {
    setBusy("__all__");
    const { error } = await supabase
      .from("feature_locks")
      .update({ locked })
      .in("key", locks.map((l) => l.key));
    setBusy(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: locked ? "All features locked" : "All features unlocked" });
    await reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldAlert className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">System Access Control</h3>
            <p className="text-xs text-muted-foreground">
              Lock any part of Lunor instantly — users see a lock screen, admins keep access.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={lockedCount ? "destructive" : "secondary"}>{lockedCount} locked</Badge>
          <Button size="sm" variant="outline" onClick={() => setAll(false)} disabled={busy === "__all__"}>
            <Unlock className="mr-1.5 h-3.5 w-3.5" /> Unlock all
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setAll(true)} disabled={busy === "__all__"}>
            <Lock className="mr-1.5 h-3.5 w-3.5" /> Lock all
          </Button>
        </div>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {CATEGORY_LABELS[category] || category}
          </h4>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((l) => (
              <div
                key={l.key}
                className={`rounded-xl border p-4 transition-all duration-300 ${
                  l.locked
                    ? "border-primary/50 bg-primary/5 shadow-glow"
                    : "border-border/70 bg-card/60 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        l.locked ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {l.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{l.label}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{l.key}</p>
                    </div>
                  </div>
                  <Switch
                    checked={l.locked}
                    disabled={busy === l.key}
                    onCheckedChange={(checked) => save(l.key, { locked: checked })}
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <Input
                    value={drafts[l.key] ?? l.message ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [l.key]: e.target.value }))}
                    placeholder="Custom message shown to users…"
                    className="h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    disabled={busy === l.key || drafts[l.key] === undefined}
                    onClick={() => save(l.key, { message: drafts[l.key] || null })}
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
