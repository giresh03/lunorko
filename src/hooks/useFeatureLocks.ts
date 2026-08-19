import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeatureLock {
  key: string;
  label: string;
  category: string;
  locked: boolean;
  message: string | null;
}

/** Reads the admin-controlled system locks and keeps them live via realtime. */
export function useFeatureLocks() {
  const [locks, setLocks] = useState<FeatureLock[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("feature_locks")
      .select("key,label,category,locked,message")
      .order("category")
      .order("label");
    setLocks((data as FeatureLock[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("feature-locks")
      .on("postgres_changes", { event: "*", schema: "public", table: "feature_locks" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const isLocked = useCallback(
    (key: string) => locks.some((l) => l.key === key && l.locked),
    [locks]
  );

  const lockMessage = useCallback(
    (key: string) => locks.find((l) => l.key === key)?.message || null,
    [locks]
  );

  const lockLabel = useCallback(
    (key: string) => locks.find((l) => l.key === key)?.label || key,
    [locks]
  );

  return { locks, loading, isLocked, lockMessage, lockLabel, reload: load };
}
