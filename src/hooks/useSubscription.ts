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
  const [state, setState] = useState<{
    subscriptions: Subscription[];
    isAdmin: boolean;
    loading: boolean;
  }>({ subscriptions: [], isAdmin: false, loading: true });

  useEffect(() => {
    if (!user) {
      setState({ subscriptions: [], isAdmin: false, loading: false });
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      const [{ data: roleData }, { data: subData }] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle(),
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .gte("expires_at", new Date().toISOString())
          .order("expires_at", { ascending: false }),
      ]);

      if (!cancelled) {
        setState({
          isAdmin: !!roleData,
          subscriptions: (subData as Subscription[]) || [],
          loading: false,
        });
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [user]);

  /** Check if user has editor access for a specific domain */
  const hasEditorAccessForDomain = useCallback(
    (domainId: string): boolean => {
      // Admins have full access to all domains
      if (isAdmin) return true;
      return subscriptions.some(
        (s) => s.domain_id === domainId || s.domain_id === null
      );
    },
    [subscriptions, isAdmin]
  );

  /** true if user has any active paid subscription */
  const hasEditorAccess = isAdmin || subscriptions.length > 0;

  /** Get the plan for a specific domain */
  const getPlanForDomain = useCallback(
    (domainId: string): string => {
      if (isAdmin) return "premium";
      const sub = subscriptions.find(
        (s) => s.domain_id === domainId || s.domain_id === null
      );
      return sub?.plan_id ?? "free";
    },
    [subscriptions, isAdmin]
  );

  // backward compat
  const plan = isAdmin ? "premium" : (subscriptions[0]?.plan_id ?? "free");
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
