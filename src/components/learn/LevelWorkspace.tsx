import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Play, Pause, Square, RotateCcw, Save, Sparkles, Loader2, Trophy, Clock, ListChecks, Wand2, CheckCircle2,
  Maximize2, Minimize2,
} from "lucide-react";
import { editorModeFor, lessonDuration, starterCodeFor, type LevelDef } from "@/lib/learningRoadmap";
import LevelTutor from "./LevelTutor";

interface Challenge {
  title: string;
  statement: string;
  requirements?: string[];
  constraints?: string[];
  example?: string;
  expected_output?: string;
  hints?: string[];
  test_cases?: string[];
  difficulty?: string;
}

interface Evaluation {
  score: number;
  passed: boolean;
  correctness?: number;
  code_quality?: number;
  concepts?: number;
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  errors?: string[];
}

interface Props {
  domainId: string;
  domainName: string;
  level: LevelDef;
  videoUrl?: string;
  onBack: () => void;
  onComplete: (score: number) => void;
}

type Phase = "learning" | "challenge" | "result";

const LevelWorkspace = ({ domainId, domainName, level, videoUrl, onBack, onComplete }: Props) => {
  const mode = editorModeFor(domainId);
  const starter = useMemo(() => starterCodeFor(mode, level), [mode, level]);
  const storageKey = `lunor_level_code_${domainId}_${level.index}`;
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const isYouTubeVideo = Boolean(videoUrl?.includes("youtube.com") || videoUrl?.includes("youtu.be"));
  const [theater, setTheater] = useState(false);

  const toggleTheater = () => setTheater((t) => !t);

  // Native fullscreen as the ultimate "maximize" when available.
  const toggleMaximize = async () => {
    const el = stageRef.current;
    if (!el) return;
    const docAny = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
      webkitFullscreenElement?: Element | null;
    };
    const elAny = el as HTMLDivElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      webkitRequestEnterFullscreen?: () => Promise<void>;
    };
    const isFull = docAny.webkitFullscreenElement || document.fullscreenElement;
    try {
      if (isFull) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (docAny.webkitExitFullscreen) await docAny.webkitExitFullscreen();
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (elAny.webkitRequestFullscreen) {
        await elAny.webkitRequestFullscreen();
      } else {
        // Fallback: toggle the in-page theater layout.
        setTheater((t) => !t);
      }
    } catch {
      setTheater((t) => !t);
    }
  };

  const [html, setHtml] = useState((starter as any).html ?? "");
  const [css, setCss] = useState((starter as any).css ?? "");
  const [js, setJs] = useState((starter as any).js ?? "");
  const [code, setCode] = useState((starter as any).code ?? "");
  const [preview, setPreview] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("learning");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.html !== undefined) setHtml(p.html);
        if (p.css !== undefined) setCss(p.css);
        if (p.js !== undefined) setJs(p.js);
        if (p.code !== undefined) setCode(p.code);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const currentCode = mode === "web" ? `<!--HTML-->\n${html}\n/*CSS*/\n${css}\n//JS\n${js}` : code;

  const run = async () => {
    setRunning(true);
    try {
      if (mode === "web") {
        setPreview(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`);
      } else {
        const { data, error } = await supabase.functions.invoke("run-code", {
          body: { code, language: mode === "python" ? "python" : mode === "sql" ? "sql" : "javascript" },
        });
        if (error) throw error;
        setOutput(data?.output ?? ["No output"]);
      }
    } catch (e) {
      setOutput([`❌ ${(e as Error).message}`]);
    } finally {
      setRunning(false);
    }
  };

  const sendYouTubeCommand = (func: "playVideo" | "pauseVideo" | "seekTo") => {
    youtubeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: func === "seekTo" ? [0, true] : [] }), "*");
  };

  const startVideo = () => {
    if (isYouTubeVideo) sendYouTubeCommand("playVideo");
    else void videoRef.current?.play();
  };

  const stopVideo = () => {
    if (isYouTubeVideo) sendYouTubeCommand("pauseVideo");
    else videoRef.current?.pause();
  };

  const restartVideo = () => {
    if (isYouTubeVideo) {
      sendYouTubeCommand("seekTo");
      sendYouTubeCommand("playVideo");
      return;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play();
    }
  };

  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ html, css, js, code }));
      toast({ title: "Saved", description: "Your work for this level is stored locally." });
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    setHtml((starter as any).html ?? "");
    setCss((starter as any).css ?? "");
    setJs((starter as any).js ?? "");
    setCode((starter as any).code ?? "");
    setPreview("");
    setOutput([]);
  };

  const callCoach = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("level-coach", {
      body: {
        domain_name: domainName,
        level_index: level.index,
        level_title: level.title,
        tier: level.tier,
        concepts: level.concepts,
        ...body,
      },
    });
    if (error) throw error;
    return data;
  };

  const startChallenge = async () => {
    setBusy(true);
    try {
      const data = await callCoach({ mode: "challenge", seed: Math.random().toString(36).slice(2, 8) });
      setChallenge(data.challenge);
      setPhase("challenge");
    } catch (e) {
      toast({ title: "Could not generate challenge", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!challenge) return;
    setBusy(true);
    try {
      const data = await callCoach({ mode: "evaluate", challenge, code: currentCode });
      const ev: Evaluation = data.evaluation;
      setEvaluation(ev);
      setPhase("result");
      if (ev.passed || ev.score >= 70) onComplete(ev.score);
    } catch (e) {
      toast({ title: "Evaluation failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const CodePanel = (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5">
        <p className="text-sm font-semibold text-foreground">Coding Workspace</p>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" className="h-7 text-xs" onClick={run} disabled={running}>
            {running ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Play className="mr-1 h-3 w-3" />} Run
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={reset}>
            <RotateCcw className="mr-1 h-3 w-3" /> Reset
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={save}>
            <Save className="mr-1 h-3 w-3" /> Save
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-3">
        {mode === "web" ? (
          <Tabs defaultValue="html" className="flex h-full flex-col">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
              <TabsTrigger value="css" className="text-xs">CSS</TabsTrigger>
              <TabsTrigger value="js" className="text-xs">JS</TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="flex-1">
              <Textarea value={html} onChange={(e) => setHtml(e.target.value)} className="h-[300px] font-mono text-xs" spellCheck={false} />
            </TabsContent>
            <TabsContent value="css" className="flex-1">
              <Textarea value={css} onChange={(e) => setCss(e.target.value)} className="h-[300px] font-mono text-xs" spellCheck={false} />
            </TabsContent>
            <TabsContent value="js" className="flex-1">
              <Textarea value={js} onChange={(e) => setJs(e.target.value)} className="h-[300px] font-mono text-xs" spellCheck={false} />
            </TabsContent>
            <TabsContent value="preview" className="flex-1">
              <iframe
                title="Live preview"
                srcDoc={preview || "<p style='font-family:system-ui;color:#888;padding:16px'>Press Run to see your output.</p>"}
                className="h-[300px] w-full rounded-lg border border-border bg-white"
                sandbox="allow-scripts allow-forms allow-modals"
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex h-full flex-col gap-3">
            <Textarea value={code} onChange={(e) => setCode(e.target.value)} className="h-[240px] font-mono text-xs" spellCheck={false} />
            <div className="min-h-[90px] rounded-lg border border-border bg-background/70 p-3 font-mono text-xs text-muted-foreground">
              {output.length ? output.map((l, i) => <div key={i}>{l}</div>) : "Terminal output appears here."}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const LessonPanel = (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-xl">
      <div>
        <Badge variant="outline" className="mb-2 border-primary/30 bg-primary/10 text-primary text-[10px]">
          {level.tier} · Level {level.index}
        </Badge>
        <h3 className="text-lg font-bold text-foreground">{level.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {lessonDuration(level.index)} lesson
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-black shadow-lg">
        {videoUrl ? (
          isYouTubeVideo ? (
            <iframe
              ref={youtubeRef}
              title={`${level.title} lesson video`}
              src={`${videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}?enablejsapi=1`}
              className="aspect-video min-h-[280px] w-full md:min-h-[360px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video ref={videoRef} src={videoUrl} controls preload="metadata" className="aspect-video min-h-[280px] w-full object-contain md:min-h-[360px]" />
          )
        ) : (
          <div className="flex aspect-video min-h-[280px] flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 to-background text-center md:min-h-[360px]">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="px-6 text-xs text-muted-foreground">
              AI lesson for <span className="text-foreground">{level.title}</span> — read the outline below and code along.
            </p>
          </div>
        )}
      </div>

      {videoUrl && (
        <div className="flex flex-wrap gap-2" aria-label="Video controls">
          <Button type="button" size="sm" onClick={startVideo} className="flex-1">
            <Play className="mr-1.5 h-3.5 w-3.5" /> Start
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={stopVideo} className="flex-1">
            <Square className="mr-1.5 h-3.5 w-3.5" /> Stop
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={restartVideo} className="flex-1">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Restart
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-background/40 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Objective</p>
        <p className="mt-1 text-sm text-muted-foreground">{level.objective}</p>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <ListChecks className="h-3.5 w-3.5" /> Key concepts
        </p>
        <ul className="space-y-1.5">
          {level.concepts.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {c}
            </li>
          ))}
        </ul>
      </div>

      {phase === "learning" && (
        <Button className="mt-auto w-full" onClick={startChallenge} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} I'm Ready — Give me the challenge
        </Button>
      )}

      {phase === "challenge" && challenge && (
        <div className="mt-auto space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="text-sm font-bold text-foreground">Challenge — {challenge.title}</p>
          <p className="text-xs text-muted-foreground">{challenge.statement}</p>
          {!!challenge.requirements?.length && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {challenge.requirements.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          )}
          <Button className="w-full" onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trophy className="mr-2 h-4 w-4" />} Submit for AI evaluation
          </Button>
        </div>
      )}

      {phase === "result" && evaluation && (
        <div className="mt-auto space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="text-sm font-bold text-foreground">
            {evaluation.passed || evaluation.score >= 70 ? "Challenge Completed 🎉" : "Almost there"}
          </p>
          <p className="text-3xl font-black text-primary">{evaluation.score}<span className="text-base text-muted-foreground">/100</span></p>
          {[["Correctness", evaluation.correctness], ["Code quality", evaluation.code_quality], ["Concepts", evaluation.concepts]].map(
            ([label, val]) =>
              typeof val === "number" ? (
                <div key={label as string}>
                  <p className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>{label}</span>
                    <span>{val}%</span>
                  </p>
                  <Progress value={val} className="h-1.5" />
                </div>
              ) : null,
          )}
          {evaluation.summary && <p className="text-xs text-muted-foreground">{evaluation.summary}</p>}
          {!!evaluation.improvements?.length && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {evaluation.improvements.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setPhase("challenge")}>
              Retry
            </Button>
            <Button className="flex-1" onClick={onBack}>
              {evaluation.passed || evaluation.score >= 70 ? "Continue →" : "Back to roadmap"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const TutorPanel = <LevelTutor domainName={domainName} level={level} code={currentCode} challenge={challenge} />;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Roadmap
        </Button>
        <Badge variant="outline" className="text-xs">+{level.xp} XP on completion</Badge>
      </div>

      {/* Desktop / tablet: three columns */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-12">
        <div className="lg:col-span-4">{LessonPanel}</div>
        <div className="lg:col-span-5">{CodePanel}</div>
        <div className="lg:col-span-3">{TutorPanel}</div>
      </div>

      {/* Mobile: tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="lesson">
          <TabsList className="w-full">
            <TabsTrigger value="lesson" className="flex-1 text-xs">Lesson</TabsTrigger>
            <TabsTrigger value="code" className="flex-1 text-xs">Code</TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 text-xs">AI</TabsTrigger>
          </TabsList>
          <TabsContent value="lesson">{LessonPanel}</TabsContent>
          <TabsContent value="code">{CodePanel}</TabsContent>
          <TabsContent value="ai">{TutorPanel}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LevelWorkspace;
