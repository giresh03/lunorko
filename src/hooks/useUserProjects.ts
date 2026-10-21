import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ProjectFile {
  path: string;
  content: string;
  language?: string;
}

export interface UserProject {
  id: string;
  name: string;
  domain: string;
  prompt: string | null;
  files: ProjectFile[];
  runtime_project_id: string | null;
  is_full_stack: boolean;
  thumbnail_url: string | null;
  visibility: "private" | "link" | "public";
  share_slug: string | null;
  created_at: string;
  updated_at: string;
}

const randomSlug = () =>
  Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);

/** Saved builds for the signed-in user, with version snapshots and link sharing. */
export const useUserProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setProjects((data as unknown as UserProject[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  /** Create or update a project and store a version snapshot of the files. */
  const saveProject = useCallback(
    async (input: {
      id?: string;
      name: string;
      domain?: string;
      prompt?: string | null;
      files: ProjectFile[];
      runtimeProjectId?: string | null;
      isFullStack?: boolean;
      versionLabel?: string;
    }): Promise<UserProject | null> => {
      if (!user) return null;

      const payload = {
        user_id: user.id,
        name: input.name,
        domain: input.domain ?? "web-development",
        prompt: input.prompt ?? null,
        files: input.files as unknown as never,
        runtime_project_id: input.runtimeProjectId ?? null,
        is_full_stack: input.isFullStack ?? false,
      };

      const query = input.id
        ? supabase.from("user_projects").update(payload).eq("id", input.id).eq("user_id", user.id).select().maybeSingle()
        : supabase.from("user_projects").insert(payload).select().maybeSingle();

      const { data, error } = await query;
      if (error || !data) return null;
      const project = data as unknown as UserProject;

      await supabase.from("user_project_versions").insert({
        project_id: project.id,
        user_id: user.id,
        label: input.versionLabel ?? new Date().toLocaleString(),
        files: input.files as unknown as never,
      });

      await refetch();
      return project;
    },
    [user, refetch]
  );

  const listVersions = useCallback(
    async (projectId: string) => {
      const { data } = await supabase
        .from("user_project_versions")
        .select("id,label,created_at,files")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    []
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!user) return;
      await supabase.from("user_projects").delete().eq("id", projectId).eq("user_id", user.id);
      await refetch();
    },
    [user, refetch]
  );

  /** Make a project shareable and return the share slug. */
  const shareProject = useCallback(
    async (projectId: string, visibility: "private" | "link" | "public" = "link") => {
      if (!user) return null;
      const existing = projects.find((p) => p.id === projectId);
      const slug = existing?.share_slug ?? randomSlug();
      const { data } = await supabase
        .from("user_projects")
        .update({ visibility, share_slug: visibility === "private" ? existing?.share_slug ?? slug : slug })
        .eq("id", projectId)
        .eq("user_id", user.id)
        .select()
        .maybeSingle();
      await refetch();
      return (data as unknown as UserProject)?.share_slug ?? null;
    },
    [user, projects, refetch]
  );

  return { projects, loading, refetch, saveProject, listVersions, deleteProject, shareProject };
};

/** Load a publicly shared project by its slug (no auth required). */
export const fetchSharedProject = async (slug: string): Promise<UserProject | null> => {
  const { data } = await supabase
    .from("user_projects")
    .select("*")
    .eq("share_slug", slug)
    .in("visibility", ["link", "public"])
    .maybeSingle();
  return (data as unknown as UserProject) ?? null;
};
