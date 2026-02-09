import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DomainProgressRow {
  id: string;
  domain_id: string;
  completed_topics: string[];
  last_accessed_at: string;
}

export interface BookmarkRow {
  id: string;
  domain_id: string;
  resource_id: string;
  resource_title: string;
  resource_type: string;
  created_at: string;
}

export interface ActivityRow {
  id: string;
  domain_id: string;
  action: string;
  detail: string | null;
  created_at: string;
}

export function useDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<DomainProgressRow[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetch = async () => {
      setLoading(true);
      const [pRes, bRes, aRes] = await Promise.all([
        supabase.from("domain_progress").select("*").eq("user_id", user.id).order("last_accessed_at", { ascending: false }),
        supabase.from("bookmarks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
      ]);
      setProgress((pRes.data as DomainProgressRow[]) ?? []);
      setBookmarks((bRes.data as BookmarkRow[]) ?? []);
      setActivity((aRes.data as ActivityRow[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const logActivity = async (domain_id: string, action: string, detail?: string) => {
    if (!user) return;
    await supabase.from("activity_log").insert({ user_id: user.id, domain_id, action, detail });
  };

  const toggleBookmark = async (domain_id: string, resource_id: string, resource_title: string, resource_type: string) => {
    if (!user) return;
    const existing = bookmarks.find((b) => b.resource_id === resource_id);
    if (existing) {
      await supabase.from("bookmarks").delete().eq("id", existing.id);
      setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
    } else {
      const { data } = await supabase.from("bookmarks").insert({ user_id: user.id, domain_id, resource_id, resource_title, resource_type }).select().maybeSingle();
      if (data) setBookmarks((prev) => [data as BookmarkRow, ...prev]);
    }
  };

  const updateProgress = async (domain_id: string, topic: string) => {
    if (!user) return;
    const existing = progress.find((p) => p.domain_id === domain_id);
    if (existing) {
      const topics = existing.completed_topics.includes(topic)
        ? existing.completed_topics.filter((t) => t !== topic)
        : [...existing.completed_topics, topic];
      await supabase.from("domain_progress").update({ completed_topics: topics, last_accessed_at: new Date().toISOString() }).eq("id", existing.id);
      setProgress((prev) => prev.map((p) => p.id === existing.id ? { ...p, completed_topics: topics, last_accessed_at: new Date().toISOString() } : p));
    } else {
      const { data } = await supabase.from("domain_progress").insert({ user_id: user.id, domain_id, completed_topics: [topic], last_accessed_at: new Date().toISOString() }).select().maybeSingle();
      if (data) setProgress((prev) => [data as DomainProgressRow, ...prev]);
    }
  };

  return { progress, bookmarks, activity, loading, logActivity, toggleBookmark, updateProgress };
}
