import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GitHubStatus {
  connected: boolean;
  login: string | null;
  auth_type: "oauth" | "pat" | null;
  last_repo: string | null;
  oauth_available: boolean;
}

export interface PushResult {
  ok: boolean;
  created: boolean;
  repo: string;
  repoUrl: string;
  commitUrl: string;
  branch: string;
  fileCount: number;
}

const EMPTY: GitHubStatus = {
  connected: false,
  login: null,
  auth_type: null,
  last_repo: null,
  oauth_available: false,
};

async function call<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("github-oauth", {
    body: { action, ...payload },
  });
  if (error) {
    const details = (data as { error?: string } | null)?.error;
    throw new Error(details || error.message);
  }
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as T;
}

export function useGitHub() {
  const [status, setStatus] = useState<GitHubStatus>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus(EMPTY);
        return;
      }
      const next = await call<GitHubStatus>("status");
      setStatus({ ...EMPTY, ...next });
    } catch {
      setStatus(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connectOAuth = useCallback(async () => {
    const redirectUri = `${window.location.origin}/github/callback`;
    const { url, state } = await call<{ url: string; state: string }>("start", { redirect_uri: redirectUri });
    sessionStorage.setItem("lunor_github_state", state);
    sessionStorage.setItem("lunor_github_return", window.location.pathname + window.location.search);
    window.location.href = url;
  }, []);

  const savePat = useCallback(async (token: string) => {
    await call("save_pat", { token });
    await refresh();
  }, [refresh]);

  const disconnect = useCallback(async () => {
    await call("disconnect");
    await refresh();
  }, [refresh]);

  const push = useCallback(async (
    files: Array<{ path: string; content: string }>,
    opts: { repo?: string; private?: boolean; commitMessage?: string } = {},
  ): Promise<PushResult> => {
    const { data, error } = await supabase.functions.invoke("github-push", {
      body: { files, ...opts },
    });
    if (error) {
      const details = (data as { error?: string; message?: string } | null);
      throw new Error(details?.message || details?.error || error.message);
    }
    if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
    const result = data as PushResult;
    setStatus((prev) => ({ ...prev, last_repo: result.repo }));
    return result;
  }, []);

  return { status, loading, refresh, connectOAuth, savePat, disconnect, push };
}

export default useGitHub;
