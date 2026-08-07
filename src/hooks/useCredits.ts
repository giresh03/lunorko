import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CreditState {
  balance: number;
  planCredits: number;
  topupCredits: number;
  planId: string;
}

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
    const { data, error } = await supabase
      .from("ai_credits")
      .select("plan_credits, topup_credits, plan_id")
      .eq("user_id", user.id)
      .maybeSingle();
    setLoading(false);
    if (error || !data) return;
    setCredits({
      balance: (data.plan_credits ?? 0) + (data.topup_credits ?? 0),
      planCredits: data.plan_credits ?? 0,
      topupCredits: data.topup_credits ?? 0,
      planId: data.plan_id ?? "free",
    });
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, loading, refetch: fetchCredits };
};
