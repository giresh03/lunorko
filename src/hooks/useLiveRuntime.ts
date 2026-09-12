import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import {
  applyDataModel,
  ensureRuntime,
  resetRuntime,
  runtimeCredentials,
  runtimeStats,
  RuntimeError,
  type DataModelTable,
  type RuntimeCredentials,
  type RuntimeInfo,
  type RuntimeScope,
} from "@/lib/liveRuntime";

export type LiveRuntimeStatus = "off" | "locked" | "starting" | "live" | "error";

interface Options {
  scope: RuntimeScope;
  scopeKey: string | null | undefined;
  name?: string;
  /** Only provision when the project actually needs a backend. */
  enabled?: boolean;
}

export function useLiveRuntime({ scope, scopeKey, name, enabled = true }: Options) {
  const { user } = useAuth();
  const { hasFeature, loading: planLoading, plan } = useFeatureAccess();
  const allowed = hasFeature("live-backend");

  const [info, setInfo] = useState<RuntimeInfo | null>(null);
  const [status, setStatus] = useState<LiveRuntimeStatus>("off");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inflight = useRef<Promise<RuntimeInfo | null> | null>(null);

  const provision = useCallback(async (): Promise<RuntimeInfo | null> => {
    if (!user || !scopeKey) return null;
    if (!allowed) {
      setStatus("locked");
      return null;
    }
    if (inflight.current) return inflight.current;
    setStatus("starting");
    setError(null);
    const p = ensureRuntime(scope, scopeKey, name)
      .then((r) => {
        setInfo(r);
        setStatus("live");
        return r;
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Could not start live backend";
        if (e instanceof RuntimeError && e.code === "PLAN_REQUIRED") {
          setStatus("locked");
        } else {
          setStatus("error");
          setError(msg);
        }
        return null;
      })
      .finally(() => {
        inflight.current = null;
      });
    inflight.current = p;
    return p;
  }, [user, scopeKey, allowed, scope, name]);

  // Auto-provision when enabled and plan is known.
  useEffect(() => {
    if (planLoading) return;
    if (!enabled || !user || !scopeKey) {
      setStatus("off");
      setInfo(null);
      return;
    }
    if (!allowed) {
      setStatus("locked");
      setInfo(null);
      return;
    }
    void provision();
  }, [enabled, user, scopeKey, allowed, planLoading, provision]);

  const refresh = useCallback(async () => {
    if (!scopeKey || !allowed) return;
    setBusy(true);
    try {
      setInfo(await runtimeStats(scope, scopeKey));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load stats");
    } finally {
      setBusy(false);
    }
  }, [scope, scopeKey, allowed]);

  const reset = useCallback(async () => {
    if (!scopeKey || !allowed) return;
    setBusy(true);
    try {
      setInfo(await resetRuntime(scope, scopeKey));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reset data");
    } finally {
      setBusy(false);
    }
  }, [scope, scopeKey, allowed]);

  return {
    status,
    info,
    apiUrl: status === "live" ? info?.apiUrl ?? null : null,
    error,
    busy,
    allowed,
    plan,
    provision,
    refresh,
    reset,
  };
}
