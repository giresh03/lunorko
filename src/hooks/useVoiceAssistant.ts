import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Strip code blocks / markdown so the assistant only speaks prose. */
export function toSpeakableText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/[*_>#|]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useVoiceAssistant(opts: { onFinalTranscript?: (text: string) => void } = {}) {
  const { onFinalTranscript } = opts;
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(
    () => localStorage.getItem("lunor-voice-enabled") === "1",
  );
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const supported = typeof window !== "undefined" && !!getRecognitionCtor();

  useEffect(() => {
    localStorage.setItem("lunor-voice-enabled", voiceEnabled ? "1" : "0");
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* noop */
    }
    setSpeaking(false);
  }, []);

  /** Free browser voice fallback when the server TTS is unavailable (404/402/5xx). */
  const speakLocally = useCallback((text: string) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return false;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 1.02;
      utter.pitch = 1;
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      synth.speak(utter);
      return true;
    } catch {
      return false;
    }
  }, []);

  /** Speak text via the Lovable AI TTS edge function (streamed PCM playback). */
  const speak = useCallback(async (raw: string) => {
    const text = toSpeakableText(raw);
    if (!text) return;
    stopSpeaking();

    const controller = new AbortController();
    abortRef.current = controller;
    setSpeaking(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Sign in to use the voice assistant.");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-speak`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        // Server voice unavailable (missing function, no AI credits, upstream error):
        // fall back to the browser's built-in voice instead of surfacing an error.
        if (speakLocally(text)) {
          abortRef.current = null;
          return;
        }
        throw new Error(
          res.status === 402
            ? "Voice needs AI credits. Top up to hear replies."
            : `Voice unavailable (${res.status})`,
        );
      }


      const ctx = new AudioContext({ sampleRate: 24000 });
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume().catch(() => {});
      let playhead = 0;
      let pending = new Uint8Array(0);

      const playChunk = (incoming: Uint8Array) => {
        const bytes = new Uint8Array(pending.length + incoming.length);
        bytes.set(pending);
        bytes.set(incoming, pending.length);
        const usable = bytes.length - (bytes.length % 2);
        pending = bytes.slice(usable);
        if (usable === 0) return;
        const samples = new Int16Array(bytes.buffer, 0, usable / 2);
        const floats = Float32Array.from(samples, (s) => s / 32768);
        const buffer = ctx.createBuffer(1, floats.length, 24000);
        buffer.copyToChannel(floats, 0);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        if (playhead === 0) playhead = ctx.currentTime + 0.05;
        else playhead = Math.max(playhead, ctx.currentTime);
        source.start(playhead);
        playhead += buffer.duration;
      };

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          for (const line of part.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const payloadText = line.slice(5).trim();
            if (!payloadText || payloadText === "[DONE]") continue;
            let payload: { type?: string; audio?: string };
            try {
              payload = JSON.parse(payloadText);
            } catch {
              continue;
            }
            if (payload.type !== "speech.audio.delta" || !payload.audio) continue;
            const binary = atob(payload.audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            playChunk(bytes);
          }
        }
      }
      // let scheduled audio finish before tearing down
      const remaining = Math.max(0, playhead - ctx.currentTime) * 1000 + 150;
      await new Promise((r) => setTimeout(r, remaining));
    } catch (e: any) {
      if (e?.name !== "AbortError" && !speakLocally(toSpeakableText(raw))) {
        setError(e?.message || "Voice playback failed");
      }
    } finally {

      if (abortRef.current === controller) {
        abortRef.current = null;
        if (ctxRef.current) {
          ctxRef.current.close().catch(() => {});
          ctxRef.current = null;
        }
        setSpeaking(false);
      }
    }
  }, [stopSpeaking, speakLocally]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }
    stopSpeaking();
    setError(null);
    setTranscript("");
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += chunk;
        else interim += chunk;
      }
      setTranscript((final || interim).trim());
      if (final.trim()) {
        onFinalTranscript?.(final.trim());
        setListening(false);
        rec.stop();
      }
    };
    rec.onerror = (e: any) => {
      setError(e?.error === "not-allowed" ? "Microphone access is needed for voice commands." : "Voice input failed.");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [onFinalTranscript, stopSpeaking]);

  const toggleListening = useCallback(() => {
    if (listening) stopListening();
    else startListening();
  }, [listening, startListening, stopListening]);

  useEffect(() => () => {
    recognitionRef.current?.abort();
    abortRef.current?.abort();
    ctxRef.current?.close().catch(() => {});
  }, []);

  return {
    supported,
    listening,
    speaking,
    transcript,
    error,
    voiceEnabled,
    setVoiceEnabled,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    clearError: () => setError(null),
  };
}
