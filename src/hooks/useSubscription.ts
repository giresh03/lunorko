import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  amount: number;
  started_at: string;
  expires_at: string;
  domain_id: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    const fetchSubscriptions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false });

      if (data && !error) {
        setSubscriptions(data as Subscription[]);
      } else {
        setSubscriptions([]);
      }
      setLoading(false);
    };

    fetchSubscriptions();
  }, [user]);

  /** Check if user has editor access for a specific domain */
  const hasEditorAccessForDomain = useCallback(
    (domainId: string): boolean => {
      return subscriptions.some(
        (sub) => sub.domain_id === domainId || sub.domain_id === null
      );
    },
    [subscriptions]
  );

  /** Legacy: true if user has any active subscription */
  const hasEditorAccess = subscriptions.length > 0;

  /** Get the plan for a specific domain */
  const getPlanForDomain = useCallback(
    (domainId: string): string => {
      const sub = subscriptions.find(
        (s) => s.domain_id === domainId || s.domain_id === null
      );
      return sub?.plan_id ?? "free";
    },
    [subscriptions]
  );

  // backward compat
  const plan = subscriptions[0]?.plan_id ?? "free";
  const subscription = subscriptions[0] ?? null;

  return {
    subscription,
    subscriptions,
    plan,
    loading,
    hasEditorAccess,
    hasEditorAccessForDomain,
    getPlanForDomain,
  };
};
