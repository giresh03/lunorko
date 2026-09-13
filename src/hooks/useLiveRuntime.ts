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
  const inflight = useRef<{ key: string; p: Promise<RuntimeInfo | null> } | null>(null);

  // Always-current scope, so callbacks captured by long-running closures (a streaming
  // build, for example) talk to the backend that is selected *now*, not the one that
  // was selected when the closure was created.
  const keyRef = useRef<string | null | undefined>(scopeKey);
  keyRef.current = scopeKey;
  const nameRef = useRef(name);
  nameRef.current = name;

  /** Accept a runtime result only if it belongs to the currently selected backend. */
  const commit = useCallback((r: RuntimeInfo) => {
    if (r.scopeKey && keyRef.current && r.scopeKey !== keyRef.current) return false;
    setInfo(r);
    return true;
  }, []);

  const provision = useCallback(async (): Promise<RuntimeInfo | null> => {
    const key = keyRef.current;
    if (!user || !key) return null;
    if (!allowed) {
      setStatus("locked");
      return null;
    }
    if (inflight.current && inflight.current.key === key) return inflight.current.p;
    setStatus("starting");
    setError(null);
    const p = ensureRuntime(scope, key, nameRef.current)
      .then((r) => {
        if (keyRef.current !== key) return null; // switched away meanwhile
        setInfo(r);
        setStatus("live");
        return r;
      })
      .catch((e: unknown) => {
        if (keyRef.current !== key) return null;
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
        if (inflight.current?.key === key) inflight.current = null;
      });
    inflight.current = { key, p };
    return p;
  }, [user, allowed, scope]);

  // A different scope means a different backend: drop the stale info right away.
  useEffect(() => {
    setInfo(null);
  }, [scopeKey]);

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
    const key = keyRef.current;
    if (!key || !allowed) return;
    setBusy(true);
    try {
      commit(await runtimeStats(scope, key));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load stats");
    } finally {
      setBusy(false);
    }
  }, [scope, allowed, commit]);

  const reset = useCallback(async () => {
    const key = keyRef.current;
    if (!key || !allowed) return;
    setBusy(true);
    try {
      commit(await resetRuntime(scope, key));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reset data");
    } finally {
      setBusy(false);
    }
  }, [scope, allowed, commit]);

  /** Create/extend the app's real tables from a declared data model. */
  const applySchema = useCallback(
    async (model: DataModelTable[]) => {
      const key = keyRef.current;
      if (!key || !allowed || model.length === 0) return;
      try {
        // Make sure the backend for this scope exists before adding tables to it.
        if (inflight.current?.key === key) await inflight.current.p;
        commit(await applyDataModel(scope, key, model));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not create tables");
      }
    },
    [scope, allowed, commit],
  );

  /** Read-only database credentials for outside tools. */
  const credentials = useCallback(async (): Promise<RuntimeCredentials | null> => {
    const key = keyRef.current;
    if (!key || !allowed) return null;
    setBusy(true);
    try {
      const next = await runtimeCredentials(scope, key);
      commit(next);
      return next.credentials ?? null;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load connection details");
      return null;
    } finally {
      setBusy(false);
    }
  }, [scope, allowed, commit]);

  return {
    status,
    info,
    apiUrl: status === "live" ? info?.apiUrl ?? null : null,
    schemaName: info?.schemaName ?? null,
    tables: info?.stats?.tables ?? [],
    error,
    busy,
    allowed,
    plan,
    provision,
    refresh,
    reset,
    applySchema,
    credentials,
  };
}
