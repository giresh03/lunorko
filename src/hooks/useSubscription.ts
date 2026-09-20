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

export interface InstitutionSeat {
  institution_id: string;
  institution_name: string;
  plan_id: string;
  role: string;
  cohort: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<{
    subscriptions: Subscription[];
    isAdmin: boolean;
    seat: InstitutionSeat | null;
    loading: boolean;
  }>({ subscriptions: [], isAdmin: false, seat: null, loading: true });

  const fetchData = useCallback(async () => {
    if (!user) {
      setState({ subscriptions: [], isAdmin: false, seat: null, loading: false });
      return;
    }

    setState((s) => ({ ...s, loading: true }));
    const [{ data: roleData }, { data: subData }, { data: memberData }] = await Promise.all([
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
      supabase
        .from("institution_members")
        .select("institution_id, role, cohort, institutions(name, plan_id, status, expires_at)")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle(),
    ]);

    const member = memberData as unknown as
      | {
          institution_id: string;
          role: string;
          cohort: string | null;
          institutions: { name: string; plan_id: string; status: string; expires_at: string | null } | null;
        }
      | null;

    const inst = member?.institutions ?? null;
    const seatActive =
      !!inst && inst.status === "active" && (!inst.expires_at || new Date(inst.expires_at) > new Date());

    setState({
      isAdmin: !!roleData,
      subscriptions: (subData as Subscription[]) || [],
      seat:
        seatActive && member
          ? {
              institution_id: member.institution_id,
              institution_name: inst!.name,
              plan_id: inst!.plan_id,
              role: member.role,
              cohort: member.cohort,
            }
          : null,
      loading: false,
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      setState({ subscriptions: [], isAdmin: false, seat: null, loading: false });
      return;
    }
    fetchData();
  }, [user, fetchData]);

  const { subscriptions, isAdmin, seat, loading } = state;

  /** Check if user has editor access for a specific domain */
  const hasEditorAccessForDomain = useCallback(
    (domainId: string): boolean => {
      if (isAdmin) return true;
      if (seat) return true;
      return subscriptions.some(
        (s) => s.domain_id === domainId || s.domain_id === null
      );
    },
    [subscriptions, isAdmin, seat]
  );

  const hasEditorAccess = isAdmin || !!seat || subscriptions.length > 0;

  const getPlanForDomain = useCallback(
    (domainId: string): string => {
      if (isAdmin) return "premium";
      const sub = subscriptions.find(
        (s) => s.domain_id === domainId || s.domain_id === null
      );
      return sub?.plan_id ?? seat?.plan_id ?? "free";
    },
    [subscriptions, isAdmin, seat]
  );

  const plan = isAdmin ? "premium" : (subscriptions[0]?.plan_id ?? seat?.plan_id ?? "free");
  const subscription = subscriptions[0] ?? null;

  return {
    subscription,
    subscriptions,
    seat,
    institution: seat,
    plan,
    loading,
    hasEditorAccess,
    hasEditorAccessForDomain,
    getPlanForDomain,
    refetch: fetchData,
  };
};
