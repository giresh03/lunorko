import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TOTAL_LEVELS } from "@/lib/learningRoadmap";

export type LevelStatus = "locked" | "available" | "current" | "completed";

export interface LevelRecord {
  level_index: number;
  status: "completed" | "in_progress";
  score: number | null;
}

const lsKey = (domainId: string, userId?: string) => `lunor_level_progress_${userId ?? "guest"}_${domainId}`;

export function useLearningProgress(domainId: string) {
  const { user } = useAuth();
  const [records, setRecords] = useState<LevelRecord[]>([]);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const readLocal = useCallback((): LevelRecord[] => {
    try {
      const raw = localStorage.getItem(lsKey(domainId, user?.id));
      return raw ? (JSON.parse(raw) as LevelRecord[]) : [];
    } catch {
      return [];
    }
  }, [domainId, user?.id]);

  const writeLocal = useCallback(
    (next: LevelRecord[]) => {
      try {
        localStorage.setItem(lsKey(domainId, user?.id), JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [domainId, user?.id],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const local = readLocal();
      if (active) setRecords(local);

      if (user) {
        const { data } = await (supabase as any)
          .from("level_progress")
          .select("level_index, status, score")
          .eq("user_id", user.id)
          .eq("domain_id", domainId);
        if (active && Array.isArray(data)) {
          const merged = new Map<number, LevelRecord>();
          [...local, ...(data as LevelRecord[])].forEach((r) => {
            const prev = merged.get(r.level_index);
            if (!prev || (prev.status !== "completed" && r.status === "completed")) merged.set(r.level_index, r);
          });
          const next = [...merged.values()].sort((a, b) => a.level_index - b.level_index);
          setRecords(next);
          writeLocal(next);
        }
        const { data: xpRow } = await supabase
          .from("user_xp")
          .select("total_xp, current_streak")
          .eq("user_id", user.id)
          .maybeSingle();
        if (active && xpRow) {
          setXp(xpRow.total_xp ?? 0);
          setStreak(xpRow.current_streak ?? 0);
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [domainId, user, readLocal, writeLocal]);

  const completedLevels = useMemo(
    () => records.filter((r) => r.status === "completed").map((r) => r.level_index),
    [records],
  );

  const highestCompleted = completedLevels.length ? Math.max(...completedLevels) : 0;
  const currentLevel = Math.min(TOTAL_LEVELS, highestCompleted + 1);

  const statusFor = useCallback(
    (index: number): LevelStatus => {
      if (completedLevels.includes(index)) return "completed";
      if (index === currentLevel) return "current";
      if (index < currentLevel) return "available";
      return "locked";
    },
    [completedLevels, currentLevel],
  );

  const scoreFor = useCallback(
    (index: number) => records.find((r) => r.level_index === index)?.score ?? null,
    [records],
  );

  const completeLevel = useCallback(
    async (levelIndex: number, score: number, xpReward: number) => {
      setRecords((prev) => {
        const next = [
          ...prev.filter((r) => r.level_index !== levelIndex),
          { level_index: levelIndex, status: "completed" as const, score },
        ].sort((a, b) => a.level_index - b.level_index);
        writeLocal(next);
        return next;
      });
      setXp((x) => x + xpReward);

      if (!user) return;
      await (supabase as any).from("level_progress").upsert(
        {
          user_id: user.id,
          domain_id: domainId,
          level_index: levelIndex,
          status: "completed",
          score,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,domain_id,level_index" },
      );

      const today = new Date().toISOString().slice(0, 10);
      const { data: existing } = await supabase
        .from("user_xp")
        .select("total_xp, current_streak, longest_streak, last_activity_date, level")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const last = existing.last_activity_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const nextStreak = last === today ? existing.current_streak : last === yesterday ? existing.current_streak + 1 : 1;
        const total = (existing.total_xp ?? 0) + xpReward;
        await supabase
          .from("user_xp")
          .update({
            total_xp: total,
            current_streak: nextStreak,
            longest_streak: Math.max(existing.longest_streak ?? 0, nextStreak),
            last_activity_date: today,
            level: Math.max(1, Math.floor(total / 1000) + 1),
          })
          .eq("user_id", user.id);
        setStreak(nextStreak);
      } else {
        await supabase.from("user_xp").insert({
          user_id: user.id,
          total_xp: xpReward,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          level: 1,
        });
        setStreak(1);
      }
    },
    [domainId, user, writeLocal],
  );

  return {
    loading,
    records,
    completedLevels,
    currentLevel,
    statusFor,
    scoreFor,
    completeLevel,
    xp,
    streak,
    progressPct: Math.round((completedLevels.length / TOTAL_LEVELS) * 100),
  };
}
