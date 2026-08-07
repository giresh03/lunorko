import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AssistantThread {
  id: string;
  title: string;
  updated_at: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  pending?: boolean;
}

const titleFrom = (text: string) => text.replace(/\s+/g, " ").trim().slice(0, 48) || "New chat";

export function useSiteAssistant(threadId: string | null) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<AssistantThread[]>([]);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastReplyRef = useRef<string>("");

  const loadThreads = useCallback(async () => {
    if (!user) {
      setThreads([]);
      setLoadingThreads(false);
      return [] as AssistantThread[];
    }
    setLoadingThreads(true);
    const { data } = await supabase
      .from("assistant_threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    const rows = (data as AssistantThread[]) ?? [];
    setThreads(rows);
    setLoadingThreads(false);
    return rows;
  }, [user]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user || !threadId) {
        setMessages([]);
        return;
      }
      setLoadingMessages(true);
      const { data } = await supabase
        .from("assistant_messages")
        .select("id, role, content, created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      setMessages(((data as AssistantMessage[]) ?? []).map((m) => ({ ...m, role: m.role === "assistant" ? "assistant" : "user" })));
      setLoadingMessages(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user, threadId]);

  const createThread = useCallback(
    async (title = "New chat") => {
      if (!user) return null;
      const { data, error: insErr } = await supabase
        .from("assistant_threads")
        .insert({ user_id: user.id, title })
        .select("id, title, updated_at")
        .single();
      if (insErr || !data) {
        setError(insErr?.message ?? "Could not start a new chat.");
        return null;
      }
      setThreads((prev) => [data as AssistantThread, ...prev]);
      return data.id as string;
    },
    [user],
  );

  // Reuse an existing empty "New chat" thread instead of piling up blanks.
  const openOrCreateThread = useCallback(async () => {
    if (!user) return null;
    if (bootstrapInFlight) return bootstrapInFlight;
    bootstrapInFlight = (async () => {
      const { data: blanks } = await supabase
        .from("assistant_threads")
        .select("id")
        .eq("title", "New chat")
        .order("updated_at", { ascending: false })
        .limit(5);
      for (const row of blanks ?? []) {
        const { count } = await supabase
          .from("assistant_messages")
          .select("id", { count: "exact", head: true })
          .eq("thread_id", row.id);
        if (!count) return row.id as string;
      }
      return await createThread();
    })();
    try {
      return await bootstrapInFlight;
    } finally {
      bootstrapInFlight = null;
    }
  }, [user, createThread]);

  const deleteThread = useCallback(
    async (id: string) => {
      const { error: delErr } = await supabase.from("assistant_threads").delete().eq("id", id);
      if (delErr) {
        setError(delErr.message);
        return;
      }
      setThreads((prev) => prev.filter((t) => t.id !== id));
    },
    [],
  );

  const send = useCallback(
    async (text: string, currentPath: string) => {
      const clean = text.trim();
      if (!clean || !user || sending) return null;

      let activeId = threadId;
      if (!activeId) activeId = await createThread(titleFrom(clean));
      if (!activeId) return null;

      setError(null);
      setSending(true);
      const optimistic: AssistantMessage = {
        id: `tmp-${Date.now()}`,
        role: "user",
        content: clean,
        created_at: new Date().toISOString(),
        pending: true,
      };
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, optimistic]);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) throw new Error("Please sign in again.");

        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/site-assistant`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ message: clean, history, currentPath }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.error || `Assistant failed (${res.status})`);

        const reply: string = payload.reply;
        const target: string = payload.navigate || "";
        lastReplyRef.current = reply;

        setMessages((prev) => [
          ...prev.map((m) => (m.id === optimistic.id ? { ...m, pending: false } : m)),
          { id: `a-${Date.now()}`, role: "assistant", content: reply, created_at: new Date().toISOString() },
        ]);

        const { error: saveErr } = await supabase.from("assistant_messages").insert([
          { thread_id: activeId, user_id: user.id, role: "user", content: clean },
          { thread_id: activeId, user_id: user.id, role: "assistant", content: reply },
        ]);
        if (saveErr) console.error("assistant message save failed", saveErr);

        const threadPatch: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
        if (messages.length === 0) threadPatch.title = titleFrom(clean);
        await supabase.from("assistant_threads").update(threadPatch).eq("id", activeId);
        await loadThreads();

        if (target) {
          setTimeout(() => navigate(target), 350);
        }
        return { reply, navigate: target, threadId: activeId };
      } catch (e: any) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setError(e?.message || "The assistant could not answer.");
        return null;
      } finally {
        setSending(false);
      }
    },
    [user, threadId, messages, sending, createThread, loadThreads, navigate],
  );

  return {
    threads,
    messages,
    loadingThreads,
    loadingMessages,
    sending,
    error,
    clearError: () => setError(null),
    createThread,
    deleteThread,
    loadThreads,
    send,
    lastReply: lastReplyRef,
  };
}
