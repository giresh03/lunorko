import { useCallback, useEffect, useState } from "react";
import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type MediaKind = "image" | "poster" | "edit" | "video";

export interface Creation {
  id: string;
  kind: MediaKind;
  prompt: string;
  status: string;
  asset_path: string | null;
  meta: Record<string, unknown>;
  created_at: string;
  url?: string | null;
}

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const authHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in to use the AI Studio.");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

export const useStudio = () => {
  const { user } = useAuth();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loadingCreations, setLoadingCreations] = useState(false);

  const fetchCreations = useCallback(async () => {
    if (!user) {
      setCreations([]);
      return;
    }
    setLoadingCreations(true);
    const { data } = await supabase
      .from("media_generations")
      .select("id, kind, prompt, status, asset_path, meta, created_at")
      .order("created_at", { ascending: false })
      .limit(60);
    const rows = (data ?? []) as Creation[];
    const withUrls = await Promise.all(
      rows.map(async (row) => {
        if (!row.asset_path) return row;
        const { data: signed } = await supabase.storage
          .from("generated-media")
          .createSignedUrl(row.asset_path, 60 * 60 * 4);
        return { ...row, url: signed?.signedUrl ?? null };
      }),
    );
    setCreations(withUrls);
    setLoadingCreations(false);
  }, [user]);

  useEffect(() => {
    fetchCreations();
  }, [fetchCreations]);

  /** Streams an image (or an edit) and calls onFrame for every rendered frame. */
  const streamImage = useCallback(
    async (
      opts: { prompt: string; mode?: "generate" | "edit"; imageBase64?: string; mimeType?: string },
      onFrame: (dataUrl: string, isFinal: boolean) => void,
    ): Promise<string> => {
      const headers = await authHeaders();
      const payload = {
        mode: opts.mode ?? "generate",
        prompt: opts.prompt,
        imageBase64: opts.imageBase64,
        mimeType: opts.mimeType,
        stream: true,
      };
      const res = await fetch(`${FUNCTIONS_BASE}/generate-media`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) {
        let message = `Generation failed (${res.status})`;
        try {
          const err = await res.json();
          message = err?.error ?? message;
        } catch {
          /* keep default */
        }
        throw new Error(message);
      }

      let latest = "";
      let sawEvent = false;
      let sawCompleted = false;
      let streamError: string | undefined;

      const parser = createParser({
        onEvent(event) {
          let parsed: any;
          try {
            parsed = JSON.parse(event.data);
          } catch {
            return;
          }
          if (event.event === "error" || parsed?.type === "error") {
            sawEvent = true;
            streamError = parsed?.error?.message ?? "Generation failed";
            return;
          }
          const names = [
            "image_generation.partial_image",
            "image_generation.completed",
            "image_edit.partial_image",
            "image_edit.completed",
          ];
          if (!names.includes(event.event ?? "") || !parsed?.b64_json) return;
          sawEvent = true;
          const isFinal =
            event.event === "image_generation.completed" || event.event === "image_edit.completed";
          if (isFinal) sawCompleted = true;
          latest = parsed.b64_json;
          flushSync(() => onFrame(`data:image/png;base64,${parsed.b64_json}`, isFinal));
        },
      });

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          parser.feed(value);
        }
      } finally {
        reader.cancel().catch(() => {});
      }

      if (streamError) throw new Error(streamError);

      if (!sawEvent) {
        // Transport hiccup — replay once without streaming.
        const replay = await fetch(`${FUNCTIONS_BASE}/generate-media`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ...payload, stream: false }),
        });
        const body = await replay.json().catch(() => null);
        if (!replay.ok || !body?.b64_json) {
          throw new Error(body?.error ?? "Generation returned no image");
        }
        latest = body.b64_json;
        onFrame(`data:image/png;base64,${body.b64_json}`, true);
        return latest;
      }
      if (!sawCompleted && !latest) throw new Error("The image stream ended early. Please try again.");
      return latest;
    },
    [],
  );

  /** Persists a base64 image to storage and records it in the library. */
  const saveImage = useCallback(
    async (b64: string, kind: MediaKind, prompt: string) => {
      if (!user) throw new Error("Please sign in first.");
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const path = `${user.id}/images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
      const { error: uploadError } = await supabase.storage
        .from("generated-media")
        .upload(path, bytes, { contentType: "image/png" });
      if (uploadError) throw new Error(uploadError.message);
      await supabase.from("media_generations").insert({
        user_id: user.id,
        kind,
        prompt,
        status: "completed",
        asset_path: path,
      });
      await fetchCreations();
    },
    [user, fetchCreations],
  );

  const startVideo = useCallback(
    async (prompt: string, seconds: string, size: string) => {
      const headers = await authHeaders();
      const res = await fetch(`${FUNCTIONS_BASE}/generate-video`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "create", prompt, seconds, size }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Could not start the video.");
      return body as { jobId: string; recordId: string | null; status: string };
    },
    [],
  );

  const pollVideo = useCallback(async (jobId: string, recordId: string | null) => {
    const headers = await authHeaders();
    const res = await fetch(`${FUNCTIONS_BASE}/generate-video`, {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "status", jobId, recordId }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.error ?? "Could not check the video status.");
    return body as { status: string; progress?: number; url?: string | null; error?: string };
  }, []);

  const deleteCreation = useCallback(
    async (creation: Creation) => {
      if (creation.asset_path) {
        await supabase.storage.from("generated-media").remove([creation.asset_path]);
      }
      await supabase.from("media_generations").delete().eq("id", creation.id);
      setCreations((prev) => prev.filter((c) => c.id !== creation.id));
    },
    [],
  );

  return {
    creations,
    loadingCreations,
    fetchCreations,
    streamImage,
    saveImage,
    startVideo,
    pollVideo,
    deleteCreation,
  };
};
