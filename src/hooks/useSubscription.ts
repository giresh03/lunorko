import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  amount: number;
  started_at: string;
  expires_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setPlan("free");
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setSubscription(data as Subscription);
        setPlan(data.plan_id);
      } else {
        setSubscription(null);
        setPlan("free");
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const hasEditorAccess = plan !== "free";

  return { subscription, plan, loading, hasEditorAccess };
};
