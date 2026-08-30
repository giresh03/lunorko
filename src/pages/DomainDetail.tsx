import { useParams, Link } from "react-router-dom";
import EditorPaywall from "@/components/EditorPaywall";
import DesignEditorMain from "@/components/design-editor/DesignEditorMain";
import { useRef, useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, BookOpen, Video, FileText, ExternalLink,
  CheckCircle2, Maximize2, Play, Clock, GraduationCap, Star, BookMarked,
  TrendingUp, Zap, Bookmark, CalendarDays, Download, Eye
} from "lucide-react";
import VideoLearningHub from "@/components/VideoLearningHub";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LockGate from "@/components/LockGate";
import CodeEditorComponent, { type CodeEditorHandle } from "@/components/CodeEditor";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useCredits, FREE_TRIAL_CREDITS } from "@/hooks/useCredits";

import { useDashboard } from "@/hooks/useDashboard";
import { domains, type Resource } from "@/lib/domains";
import { supabase } from "@/integrations/supabase/client";
import LearnBuildToggle, { type LearnMode } from "@/components/learn/LearnBuildToggle";
import RoadmapMap from "@/components/learn/RoadmapMap";
import ProgressHud from "@/components/learn/ProgressHud";
import LevelWorkspace from "@/components/learn/LevelWorkspace";
import { getRoadmap } from "@/lib/learningRoadmap";
import { useLearningProgress } from "@/hooks/useLearningProgress";

const sourceColors: Record<string, string> = {
  YouTube: "bg-red-500/10 text-red-400 border-red-500/20",
  Udemy: "bg-primary/10 text-primary border-primary/20",
  Coursera: "bg-primary/10 text-primary border-primary/20",
  GeeksforGeeks: "bg-green-500/10 text-green-400 border-green-500/20",
  MDN: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const VideoCard = ({ resource }: { resource: Resource }) => {
  const videoId = resource.url.includes("youtube.com/watch?v=")
    ? resource.url.split("v=")[1]?.split("&")[0]
    : null;
  const thumb = resource.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {thumb ? (
          <img src={thumb} alt={resource.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Video className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
            <Play className="h-6 w-6 ml-0.5" />
          </div>
        </div>
        {/* Duration badge */}
        {resource.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {resource.duration}
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] ${sourceColors[resource.source] || "border-border"}`}>
            {resource.source}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
            {resource.type === "course" ? "Course" : "Video"}
          </Badge>
        </div>
        <h4 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {resource.title}
        </h4>
        {resource.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{resource.description}</p>
        )}
      </div>
    </a>
  );
};

const ArticleCard = ({ resource }: { resource: Resource }) => (
  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
      {resource.source === "GeeksforGeeks" ? (
        <BookMarked className="h-5 w-5 text-primary" />
      ) : (
        <FileText className="h-5 w-5 text-primary" />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <div className="mb-1.5">
        <Badge variant="outline" className={`text-[10px] ${sourceColors[resource.source] || "border-border"}`}>
          {resource.source}
        </Badge>
      </div>
      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {resource.title}
      </h4>
      {resource.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{resource.description}</p>
      )}
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
        Read Article <ExternalLink className="h-3 w-3" />
      </span>
    </div>
  </a>
);

const PdfCard = ({ resource }: { resource: Resource }) => {
  const [showViewer, setShowViewer] = useState(false);
  
  return (
    <>
      <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <FileText className="h-7 w-7 text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">PDF</Badge>
              {resource.source && (
                <Badge variant="outline" className={`text-[10px] ${sourceColors[resource.source] || "border-border"}`}>
                  {resource.source}
                </Badge>
              )}
              {resource.duration && (
                <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                  {resource.duration}
                </Badge>
              )}
            </div>
            <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {resource.title}
            </h4>
            {resource.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{resource.description}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowViewer(true)}>
                <Eye className="mr-1.5 h-3.5 w-3.5" /> Read Online
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                <a href={resource.url} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl h-[85vh] rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
              <h3 className="text-sm font-semibold text-foreground truncate">{resource.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                  <a href={resource.url} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                  </a>
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowViewer(false)}>
                  ✕ Close
                </Button>
              </div>
            </div>
            <iframe
              src={`${resource.url}#toolbar=1&navpanes=1`}
              className="flex-1 w-full"
              title={resource.title}
            />
          </div>
        </div>
      )}
    </>
  );
};

const DomainDetail = () => {
  const { domainId } = useParams();
  const domain = domains.find((d) => d.id === domainId);
  const editorRef = useRef<CodeEditorHandle>(null);
  const [activeTab, setActiveTab] = useState("guidance");
  const [learnMode, setLearnMode] = useState<LearnMode>("learn");
  const [activeLevelIndex, setActiveLevelIndex] = useState<number | null>(null);
  const roadmap = useMemo(() => getRoadmap(domainId ?? ""), [domainId]);
  const learning = useLearningProgress(domainId ?? "");
  const activeLevel = activeLevelIndex ? roadmap.find((l) => l.index === activeLevelIndex) ?? null : null;
  const [isFullscreenIDE, setIsFullscreenIDE] = useState(false);
  const [adminResources, setAdminResources] = useState<Resource[]>([]);

  useEffect(() => {
    if (!domainId) return;
    const fetchAdminResources = async () => {
      const { data } = await supabase
        .from("admin_resources")
        .select("id, title, resource_type, source, url, duration, thumbnail, description")
        .eq("domain_id", domainId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) {
        const mapped: Resource[] = data.map((r: any) => ({
          id: r.id,
          title: r.title,
          type: (r.resource_type === "material" ? "article" : r.resource_type) as "video" | "article" | "course" | "pdf",
          source: r.source,
          url: r.url,
          duration: r.duration,
          thumbnail: r.thumbnail,
          description: r.description,
        }));
        setAdminResources(mapped);
      }
    };
    fetchAdminResources();
  }, [domainId]);
  const isUIUXDomain = domainId === 'ui-ux';
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasEditorAccessForDomain } = useSubscription();
  const { credits } = useCredits();
  const paidEditorAccess = domainId ? hasEditorAccessForDomain(domainId) : false;
  // Free users get a credit-metered trial of the workspace.
  const trialCreditsLeft = credits?.planId === "free" ? credits.balance : 0;
  const isTrialWorkspace = !paidEditorAccess && trialCreditsLeft > 0;
  const hasEditorAccess = paidEditorAccess || isTrialWorkspace;

  const { progress, bookmarks, activity, bookings, updateProgress, logActivity } = useDashboard();

  const handleSendToEditor = (code: string, language: string) => {
    editorRef.current?.setExternalCode(code, language);
    setActiveTab("editor");
    toast({ title: "Code sent to editor", description: "Switch to the Editor tab to run it." });
  };

  if (!domain) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Domain not found</h1>
          <Button className="mt-4" asChild>
            <Link to="/domains">Back to Domains</Link>
          </Button>
        </div>
      </div>
    );
  }

  const Icon = domain.icon;
  const allResources: Resource[] = [...adminResources, ...domain.resources];
  const videos = allResources.filter((r) => r.type === "video" || r.type === "course");
  const articles = allResources.filter((r) => r.type === "article");
  const pdfs = allResources.filter((r) => r.type === "pdf");

  if (isFullscreenIDE && hasEditorAccess) {
    if (isUIUXDomain) {
      return (
        <div className="fixed inset-0 z-50">
          <DesignEditorMain onExit={() => setIsFullscreenIDE(false)} />
        </div>
      );
    }
    return (
      <div className="fixed inset-0 z-50">
        <CodeEditorComponent
          ref={editorRef}
          domainName={domain.name}
          onExit={() => setIsFullscreenIDE(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={domain.image} alt={domain.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-28">
          <Link
            to="/domains"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Domains
          </Link>
          <div className="flex items-start gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl shadow-lg"
              style={{ backgroundColor: `hsl(${domain.color} / 0.2)` }}
            >
              <Icon className="h-8 w-8" style={{ color: `hsl(${domain.color})` }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground md:text-5xl font-serif">{domain.name}</h1>
              <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{domain.description}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {domain.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  borderColor: `hsl(${domain.color} / 0.3)`,
                  backgroundColor: `hsl(${domain.color} / 0.1)`,
                  color: `hsl(${domain.color})`,
                }}
              >
                {topic}
              </span>
            ))}
          </div>
          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Video className="h-4 w-4 text-primary" />
              <span>{videos.length} Videos & Courses</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 text-primary" />
              <span>{articles.length} Articles & Guides</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>{domain.topics.length} Topics to Master</span>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-20">
        {/* Domain Dashboard Overview */}
        {(() => {
          const dp = progress.find((p) => p.domain_id === domainId);
          const completedCount = dp?.completed_topics.length ?? 0;
          const totalTopics = domain.topics.length;
          const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
          const domainBookmarks = bookmarks.filter((b) => b.domain_id === domainId);
          const domainActivity = activity.filter((a) => a.domain_id === domainId);
          const domainBookingsCount = bookings.filter((b) => b.domain_id === domainId).length;
          const lastAccessed = dp?.last_accessed_at ? new Date(dp.last_accessed_at) : null;

          return (
            <div className="mb-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
              {/* Progress Card */}
              <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Progress</p>
                    <p className="text-2xl font-bold text-foreground">{progressPct}%</p>
                  </div>
                </div>
                <Progress value={progressPct} className="h-1.5 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {completedCount}/{totalTopics} topics completed
                </p>
              </div>

              {/* Resources Card */}
              <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `hsl(${domain.color} / 0.1)` }}>
                    <BookOpen className="h-5 w-5" style={{ color: `hsl(${domain.color})` }} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Resources</p>
                    <p className="text-2xl font-bold text-foreground">{allResources.length}</p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {videos.length} videos</span>
                  <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {articles.length} articles</span>
                </div>
              </div>

              {/* Bookmarks Card */}
              <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <Bookmark className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Saved</p>
                    <p className="text-2xl font-bold text-foreground">{domainBookmarks.length}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {domainActivity.length} activities logged
                </p>
              </div>

              {/* Status Card */}
              <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Zap className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Status</p>
                    <p className="text-sm font-bold text-foreground">
                      {progressPct === 100 ? "Completed ✨" : progressPct > 0 ? "In Progress" : "Not Started"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {lastAccessed
                    ? `Last active ${lastAccessed.toLocaleDateString()}`
                    : user ? "Start learning today!" : "Sign in to track"
                  }
                </p>
                {domainBookingsCount > 0 && (
                  <p className="mt-1 text-xs text-primary flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> {domainBookingsCount} mentor session{domainBookingsCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Learn / Build toggle */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <LearnBuildToggle
            mode={learnMode}
            onChange={(m) => {
              setLearnMode(m);
              setActiveTab(m === "build" ? "editor" : "guidance");
              setActiveLevelIndex(null);
            }}
          />
          <p className="text-xs text-muted-foreground">
            {learnMode === "learn"
              ? "Gamified roadmap · AI lessons · live coding · AI tutor"
              : "Full AI coding workspace for this domain"}
          </p>
        </div>

        {learnMode === "learn" && (
          <div className="mb-10 space-y-6 animate-in fade-in duration-500">
            <ProgressHud
              domainName={domain.name}
              currentLevelTitle={roadmap[Math.min(roadmap.length - 1, learning.currentLevel - 1)]?.title ?? ""}
              currentLevel={learning.currentLevel}
              completed={learning.completedLevels.length}
              xp={learning.xp}
              streak={learning.streak}
              progressPct={learning.progressPct}
            />
            {activeLevel ? (
              <LevelWorkspace
                domainId={domainId ?? ""}
                domainName={domain.name}
                level={activeLevel}
                videoUrl={videos[0]?.url}
                onBack={() => setActiveLevelIndex(null)}
                onComplete={(score) => learning.completeLevel(activeLevel.index, score, activeLevel.xp)}
              />
            ) : (
              <RoadmapMap
                levels={roadmap}
                statusFor={learning.statusFor}
                scoreFor={learning.scoreFor}
                onOpen={(lvl) => setActiveLevelIndex(lvl.index)}
              />
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 w-full justify-start border-b border-border bg-transparent p-0 rounded-none">
            <TabsTrigger
              value="guidance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              <BookOpen className="mr-2 h-4 w-4" /> Guidance
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              <Maximize2 className="mr-2 h-4 w-4" /> Code Editor
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              <Video className="mr-2 h-4 w-4" /> Videos & Courses
            </TabsTrigger>
            <TabsTrigger
              value="materials"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              <FileText className="mr-2 h-4 w-4" /> Reading Materials
            </TabsTrigger>
          </TabsList>

          {/* Guidance Tab */}
          <TabsContent value="guidance">
            <div className="grid gap-8 lg:grid-cols-5">
              {/* Roadmap - wider */}
              <div className="lg:col-span-3">
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Learning Roadmap</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Follow this path to master {domain.name}</p>
                    </div>
                    {user && domainId && (() => {
                      const dp = progress.find((p) => p.domain_id === domainId);
                      const completed = dp?.completed_topics.length ?? 0;
                      const total = domain.topics.length;
                      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                      return (
                        <Badge variant="outline" className="text-xs">
                          {completed}/{total} ({pct}%)
                        </Badge>
                      );
                    })()}
                  </div>
                  {user && domainId && (() => {
                    const dp = progress.find((p) => p.domain_id === domainId);
                    const pct = domain.topics.length > 0
                      ? Math.round(((dp?.completed_topics.length ?? 0) / domain.topics.length) * 100)
                      : 0;
                    return <Progress value={pct} className="mb-6 h-2" />;
                  })()}
                  <div className="space-y-1">
                    {domain.topics.map((topic, i) => {
                      const dp = progress.find((p) => p.domain_id === domainId);
                      const isCompleted = dp?.completed_topics.includes(topic) ?? false;
                      return (
                        <div
                          key={topic}
                          className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${
                            isCompleted ? "bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        >
                          {user ? (
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => {
                                if (domainId) {
                                  updateProgress(domainId, topic);
                                  if (!isCompleted) logActivity(domainId, "Completed topic", topic);
                                }
                              }}
                              className="h-5 w-5"
                            />
                          ) : (
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                              style={{
                                backgroundColor: `hsl(${domain.color} / 0.15)`,
                                color: `hsl(${domain.color})`,
                              }}
                            >
                              {i + 1}
                            </div>
                          )}
                          <span className={`text-sm font-medium ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {topic}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {!user && (
                    <p className="mt-5 text-xs text-muted-foreground">
                      <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to track your progress
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Why Learn */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-bold text-foreground">Why Learn {domain.name}?</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    {[
                      "High demand in the job market with competitive salaries",
                      "Build real-world projects that matter",
                      "AI-assisted learning accelerates your progress",
                      "Industry-aligned curriculum with practical focus",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick start video */}
                {videos[0] && (
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <VideoCard resource={videos[0]} />
                  </div>
                )}

                {/* Open IDE */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setIsFullscreenIDE(true)}
                >
                  <Maximize2 className="mr-2 h-4 w-4" />
                  {isUIUXDomain ? 'Open Design Editor' : 'Open Code Editor'}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Code Editor Tab */}
          <TabsContent value="editor">
            {hasEditorAccess ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                    <Maximize2 className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {isUIUXDomain ? 'Lunor.AI Design Studio' : 'Lunor.AI Code Editor'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {isUIUXDomain
                      ? 'Figma-like visual design editor with drag & drop widgets, properties panel, layer management, and export to React + Tailwind CSS.'
                      : `Full-screen VS Code-style IDE with file explorer, multi-tab editing, integrated terminal, and AI assistant — all tuned for ${domain.name}.`
                    }
                  </p>
                  {isTrialWorkspace ? (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm">
                      <span className="font-semibold text-primary">Free trial</span>{" "}
                      <span className="text-muted-foreground">
                        · {trialCreditsLeft} of {FREE_TRIAL_CREDITS} credits left. Full advanced AI engine — upgrade
                        anytime for 1,500 credits.
                      </span>
                    </div>
                  ) : credits ? (
                    <div className="rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm">
                      <span className="font-semibold text-primary">{credits.balance} AI credits</span>
                      <span className="text-muted-foreground"> · {credits.planCredits} plan + {credits.topupCredits} top-up</span>
                    </div>
                  ) : null}

                  <Button size="lg" onClick={() => setIsFullscreenIDE(true)} className="mt-2">
                    <Maximize2 className="mr-2 h-4 w-4" />
                    {isUIUXDomain ? 'Launch Design Studio' : 'Launch Full-Screen Editor'}
                  </Button>

                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card">
                <EditorPaywall domainId={domainId} domainName={domain.name} />
              </div>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <LockGate lockKey="videos" name="Video Library" compact>
            {videos.length > 0 ? (
              domainId === "app-development" ? (
                <VideoLearningHub videos={videos} domainColor={domain.color} />
              ) : (
                <>
                  {/* Featured video */}
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" /> Featured Course
                    </h3>
                    <a
                      href={videos[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
                    >
                      <div className="grid md:grid-cols-2">
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          {videos[0].thumbnail ? (
                            <img
                              src={videos[0].thumbnail}
                              alt={videos[0].title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Video className="h-16 w-16 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
                              <Play className="h-7 w-7 ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center p-8">
                          <div className="mb-3 flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${sourceColors[videos[0].source] || ""}`}>
                              {videos[0].source}
                            </Badge>
                            {videos[0].duration && (
                              <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" /> {videos[0].duration}
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {videos[0].title}
                          </h4>
                          {videos[0].description && (
                            <p className="mt-2 text-sm text-muted-foreground">{videos[0].description}</p>
                          )}
                          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                            Watch Now <ExternalLink className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* All videos grid */}
                  <h3 className="mb-4 text-lg font-bold text-foreground">All Videos & Courses</h3>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {videos.slice(1).map((r) => (
                      <VideoCard key={r.id} resource={r} />
                    ))}
                  </div>
                </>
              )
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
                <Video className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">Videos coming soon. Check back later!</p>
              </div>
            )}
            </LockGate>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <LockGate lockKey="materials" name="Learning Materials" compact>
            {pdfs.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-400" /> PDF Documents
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {pdfs.map((r) => (
                    <PdfCard key={r.id} resource={r} />
                  ))}
                </div>
              </div>
            )}
            {articles.length > 0 ? (
              <>
                {pdfs.length > 0 && (
                  <h3 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-primary" /> Articles & Guides
                  </h3>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {articles.map((r) => (
                    <ArticleCard key={r.id} resource={r} />
                  ))}
                </div>
              </>
            ) : pdfs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">Materials coming soon. Check back later!</p>
              </div>
            ) : null}
            </LockGate>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default DomainDetail;
