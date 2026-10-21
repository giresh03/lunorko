import { useRef, useState } from "react";
import { Loader2, Wand2, Upload, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useStudio } from "@/hooks/useStudio";

const QUICK_EDITS = [
  "Make the background deep black with red neon rim light",
  "Remove the background completely",
  "Turn this into a bold startup poster with headline space",
  "Make it look cinematic and moody",
  "Upscale the detail and sharpen the subject",
];

const EditStudio = () => {
  const { toast } = useToast();
  const { streamImage, saveImage } = useStudio();
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<{ dataUrl: string; base64: string; mimeType: string } | null>(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [finalB64, setFinalB64] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const onPick = (file?: File | null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please use an image under 10MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setSource({ dataUrl, base64: dataUrl.split(",")[1] ?? "", mimeType: file.type || "image/png" });
      setResult(null);
      setFinalB64(null);
    };
    reader.readAsDataURL(file);
  };

  const runEdit = async () => {
    if (!source) {
      toast({ title: "Upload an image first" });
      return;
    }
    if (prompt.trim().length < 3) {
      toast({ title: "Describe the edit", description: "e.g. make the sky red" });
      return;
    }
    setBusy(true);
    setIsFinal(false);
    setResult(null);
    setFinalB64(null);
    try {
      const b64 = await streamImage(
        {
          mode: "edit",
          prompt: `${prompt.trim()}. Keep everything else in the image unchanged.`,
          imageBase64: source.base64,
          mimeType: source.mimeType,
        },
        (dataUrl, final) => {
          setResult(dataUrl);
          setIsFinal(final);
        },
      );
      setFinalB64(b64);
      setIsFinal(true);
    } catch (err) {
      toast({
        title: "Edit failed",
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
      await saveImage(finalB64, "edit", prompt.trim());
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
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onPick(e.dataTransfer.files?.[0]);
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 p-6 text-center transition-colors hover:border-primary/60"
        >
          {source ? (
            <img src={source.dataUrl} alt="Source" className="max-h-40 rounded-lg" />
          ) : (
            <>
              <Upload className="h-7 w-7 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Drop an image or click to upload</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            What should change?
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Make the sky red and add glowing city lights"
            className="mt-2 min-h-[110px] resize-none bg-background/70"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_EDITS.map((q) => (
            <button
              key={q}
              onClick={() => setPrompt(q)}
              className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>

        <Button onClick={runEdit} disabled={busy} className="group w-full">
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Editing…
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4 transition-transform group-hover:-rotate-12" /> Apply edit
            </>
          )}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">Uses 1 AI credit per edit</p>
      </div>

      <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-card/40 p-4">
        {result ? (
          <>
            <img
              src={result}
              alt="Edited result"
              className={`max-h-[560px] w-auto rounded-xl transition-all duration-500 ${isFinal ? "blur-0" : "blur-2xl"}`}
            />
            {isFinal && finalB64 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
                <Button size="sm" asChild>
                  <a href={result} download={`lunor-edit-${Date.now()}.png`}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </a>
                </Button>
              </div>
            )}
            {!isFinal && (
              <Badge className="absolute left-4 top-4 animate-pulse bg-primary/20 text-primary">editing…</Badge>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <Wand2 className="mx-auto h-10 w-10 opacity-40" />
            <p className="mt-3 text-sm">Upload an image, describe the change, and watch it transform.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditStudio;
