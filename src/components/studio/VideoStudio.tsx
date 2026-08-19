import { useEffect, useRef, useState } from "react";
import { Loader2, Film, Play, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useStudio } from "@/hooks/useStudio";

const DURATIONS = [
  { id: "30", label: "30s" },
  { id: "45", label: "45s" },
  { id: "60", label: "1 min" },
  { id: "120", label: "2 min" },
];
const ORIENTATIONS = [
  { id: "1280x720", label: "Landscape 16:9" },
  { id: "720x1280", label: "Portrait 9:16" },
];

const VideoStudio = () => {
  const { toast } = useToast();
  const { startVideo, pollVideo, fetchCreations } = useStudio();
  const [prompt, setPrompt] = useState("");
  const [seconds, setSeconds] = useState("30");
  const [size, setSize] = useState("1280x720");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const generate = async () => {
    if (prompt.trim().length < 3) {
      toast({ title: "Add a prompt", description: "Describe the shot you want in English." });
      return;
    }
    setBusy(true);
    setProgress(5);
    setVideoUrl(null);
    try {
      const { jobId, recordId } = await startVideo(prompt.trim(), seconds, size);

      const tick = async () => {
        try {
          const status = await pollVideo(jobId, recordId);
          if (status.status === "completed") {
            setProgress(100);
            setVideoUrl(status.url ?? null);
            setBusy(false);
            fetchCreations();
            toast({ title: "Your video is ready" });
            return;
          }
          if (status.status === "failed") {
            setBusy(false);
            toast({
              title: "Video generation failed",
              description: status.error ?? "The request was rejected.",
              variant: "destructive",
            });
            return;
          }
          setProgress((p) => Math.min(95, Math.max(p + 4, status.progress ?? 0)));
          timerRef.current = window.setTimeout(tick, 7000);
        } catch (err) {
          setBusy(false);
          toast({
            title: "Could not check status",
            description: err instanceof Error ? err.message : "Please try again.",
            variant: "destructive",
          });
        }
      };
      timerRef.current = window.setTimeout(tick, 7000);
    } catch (err) {
      setBusy(false);
      toast({
        title: "Could not start the video",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="space-y-5 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Shot description
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Slow dolly across a dark studio desk, red neon reflections on glass, cinematic"
            className="mt-2 min-h-[130px] resize-none bg-background/70"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Duration</p>
          <div className="mt-2 flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSeconds(d.id)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs transition-all duration-300 ${
                  seconds === d.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Orientation</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ORIENTATIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => setSize(o.id)}
                className={`rounded-lg border px-3 py-2 text-xs transition-all duration-300 ${
                  size === o.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={generate} disabled={busy} className="group w-full">
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Film className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" /> Generate video
            </>
          )}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          Uses 10 AI credits · takes 1–3 minutes · English prompts only
        </p>
      </div>

      <div className="relative flex min-h-[420px] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border bg-card/40 p-6">
        {videoUrl ? (
          <>
            <video src={videoUrl} controls playsInline className="max-h-[520px] rounded-xl" />
            <Button size="sm" asChild>
              <a href={videoUrl} download={`lunor-video-${Date.now()}.mp4`}>
                <Download className="mr-2 h-4 w-4" /> Download MP4
              </a>
            </Button>
          </>
        ) : busy ? (
          <div className="w-full max-w-sm text-center">
            <Play className="mx-auto h-10 w-10 animate-pulse text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Rendering your clip…</p>
            <Progress value={progress} className="mt-4" />
            <p className="mt-2 text-xs text-muted-foreground">{Math.round(progress)}%</p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <Film className="mx-auto h-10 w-10 opacity-40" />
            <p className="mt-3 text-sm">Describe a shot and Lunor will render an MP4 with sound.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStudio;
