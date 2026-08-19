import { useState } from "react";
import { Loader2, Sparkles, Download, Save, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useStudio, type MediaKind } from "@/hooks/useStudio";

const STYLES = [
  { id: "poster", label: "Poster", hint: "bold typographic poster, high contrast, print-ready layout" },
  { id: "cinematic", label: "Cinematic", hint: "cinematic lighting, 35mm film grain, dramatic shadows" },
  { id: "3d", label: "3D Render", hint: "glossy 3D render, soft studio lighting, octane style" },
  { id: "product", label: "Product Shot", hint: "studio product photography, seamless backdrop, crisp reflections" },
  { id: "logo", label: "Logo / Icon", hint: "minimal vector logo mark, flat, centered, solid background" },
  { id: "thumbnail", label: "Thumbnail", hint: "YouTube thumbnail, punchy colors, large readable subject" },
];

const RATIOS = [
  { id: "1:1", label: "Square 1:1" },
  { id: "16:9", label: "Wide 16:9" },
  { id: "9:16", label: "Story 9:16" },
  { id: "4:5", label: "Portrait 4:5" },
];

interface Props {
  kind?: MediaKind;
}

const ImageStudio = ({ kind = "image" }: Props) => {
  const { toast } = useToast();
  const { streamImage, saveImage } = useStudio();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(kind === "poster" ? "poster" : "cinematic");
  const [ratio, setRatio] = useState(kind === "poster" ? "4:5" : "16:9");
  const [preview, setPreview] = useState<string | null>(null);
  const [finalB64, setFinalB64] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    if (prompt.trim().length < 3) {
      toast({ title: "Add a prompt", description: "Describe what you want to see." });
      return;
    }
    setBusy(true);
    setIsFinal(false);
    setPreview(null);
    setFinalB64(null);
    const styleHint = STYLES.find((s) => s.id === style)?.hint ?? "";
    const fullPrompt = `${prompt.trim()}. Style: ${styleHint}. Aspect ratio ${ratio}. High detail, no watermarks, no gibberish text.`;
    try {
      const b64 = await streamImage({ prompt: fullPrompt }, (dataUrl, final) => {
        setPreview(dataUrl);
        setIsFinal(final);
      });
      setFinalB64(b64);
      setIsFinal(true);
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!finalB64) return;
    setSaving(true);
    try {
      await saveImage(finalB64, kind, prompt.trim());
      toast({ title: "Saved to your library" });
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="space-y-5 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Prompt
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              kind === "poster"
                ? "Launch poster for a hackathon called Lunor Night, neon red grid, bold headline"
                : "A futuristic developer workstation lit by red neon, obsidian black desk"
            }
            className="mt-2 min-h-[130px] resize-none bg-background/70"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Style</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-all duration-300 ${
                  style === s.id
                    ? "border-primary bg-primary/15 text-primary shadow-[0_0_18px_-6px_hsl(var(--primary))]"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Format</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {RATIOS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRatio(r.id)}
                className={`rounded-lg border px-3 py-2 text-xs transition-all duration-300 ${
                  ratio === r.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={generate} disabled={busy} className="group w-full">
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rendering…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" /> Generate
            </>
          )}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">Uses 1 AI credit per render</p>
      </div>

      <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-card/40 p-4">
        {preview ? (
          <>
            <img
              src={preview}
              alt={prompt || "Generated artwork"}
              className={`max-h-[560px] w-auto rounded-xl transition-all duration-500 ${
                isFinal ? "blur-0" : "blur-2xl"
              }`}
            />
            {isFinal && finalB64 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
                <Button size="sm" asChild>
                  <a href={preview} download={`lunor-${kind}-${Date.now()}.png`}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </a>
                </Button>
              </div>
            )}
            {!isFinal && (
              <Badge className="absolute left-4 top-4 animate-pulse bg-primary/20 text-primary">
                rendering…
              </Badge>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-10 w-10 opacity-40" />
            <p className="mt-3 text-sm">Your render appears here, live, as the model paints it.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;
