import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CreditUsageRow {
  id: string;
  feature: string;
  amount: number;
  created_at: string;
}

export interface CreditState {
  balance: number;
  planCredits: number;
  topupCredits: number;
  planId: string;
  allowance: number;
  usedThisMonth: number;
  recent: CreditUsageRow[];
}

export const PLAN_ALLOWANCE: Record<string, number> = {
  free: 100,
  pro: 1500,
  premium: 4000,
  professional: 10000,
};

export const allowanceFor = (planId: string) => PLAN_ALLOWANCE[planId] ?? PLAN_ALLOWANCE.free;

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<CreditState | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      return;
    }
    setLoading(true);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [{ data, error }, { data: usage }] = await Promise.all([
      supabase
        .from("ai_credits")
        .select("plan_credits, topup_credits, plan_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("ai_credit_usage")
        .select("id, feature, amount, created_at")
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    setLoading(false);
    if (error || !data) return;

    const rows = (usage as CreditUsageRow[]) ?? [];
    const planId = data.plan_id ?? "free";
    setCredits({
      balance: (data.plan_credits ?? 0) + (data.topup_credits ?? 0),
      planCredits: data.plan_credits ?? 0,
      topupCredits: data.topup_credits ?? 0,
      planId,
      allowance: allowanceFor(planId),
      usedThisMonth: rows.reduce((sum, r) => sum + (r.amount ?? 0), 0),
      recent: rows.slice(0, 8),
    });
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, loading, refetch: fetchCredits };
};
