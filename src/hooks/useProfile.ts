import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  resume_url: string | null;
  resume_filename: string | null;
  wants_to_join_team: boolean;
  age: number | null;
  dob: string | null;
  stream: string | null;
  interests: string[];
  onboarded_at: string | null;
}


export const USERNAME_RULES = "3-20 characters — letters, numbers, underscore or dash.";
export const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/;

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.rpc("get_my_profile");
    const row = Array.isArray(data) ? data[0] : data;
    setProfile((row as ProfileRow) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Case-insensitive availability check. */
  const isUsernameAvailable = useCallback(
    async (username: string) => {
      const clean = username.trim();
      if (!usernamePattern.test(clean)) return false;
      const { data, error } = await supabase
        .from("public_profiles")
        .select("user_id")
        .ilike("username", clean)
        .limit(1);
      if (error) return true; // don't block on a read failure; the unique index is the real guard
      const taken = (data ?? []).some((row: any) => row.user_id !== user?.id);
      return !taken;
    },
    [user],
  );

  const updateProfile = useCallback(
    async (patch: Partial<Omit<ProfileRow, "id" | "user_id">>) => {
      if (!user) return { error: new Error("Not signed in") };
      const { error } = await supabase.from("profiles").update(patch).eq("user_id", user.id);
      if (!error) await refresh();
      return { error };
    },
    [user, refresh],
  );

  /** Uploads to the private `resumes` bucket at <uid>/<filename>. */
  const uploadResume = useCallback(
    async (file: File) => {
      if (!user) return { error: new Error("Not signed in"), path: null };
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const path = `${user.id}/resume-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("resumes").upload(path, file, { upsert: true });
      if (error) return { error, path: null };
      return { error: null, path };
    },
    [user],
  );

  /** Short-lived signed URL for viewing a stored resume. */
  const getResumeUrl = useCallback(async (path: string) => {
    const { data } = await supabase.storage.from("resumes").createSignedUrl(path, 300);
    return data?.signedUrl ?? null;
  }, []);

  const needsOnboarding = !!user && !loading && !!profile && !profile.onboarded_at;

  return { profile, loading, needsOnboarding, refresh, updateProfile, isUsernameAvailable, uploadResume, getResumeUrl };
}
