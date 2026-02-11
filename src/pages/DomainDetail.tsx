import { useParams, Link } from "react-router-dom";
import { useRef, useState } from "react";
import {
  ArrowLeft, BookOpen, Video, FileText, ExternalLink,
  CheckCircle2, Maximize2, Play, Clock, GraduationCap, Star, BookMarked
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodeEditorComponent, { type CodeEditorHandle } from "@/components/CodeEditor";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { domains, type Resource } from "@/lib/domains";

const sourceColors: Record<string, string> = {
  YouTube: "bg-red-500/10 text-red-400 border-red-500/20",
  Udemy: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Coursera: "bg-blue-500/10 text-blue-400 border-blue-500/20",
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

const DomainDetail = () => {
  const { domainId } = useParams();
  const domain = domains.find((d) => d.id === domainId);
  const editorRef = useRef<CodeEditorHandle>(null);
  const [activeTab, setActiveTab] = useState("guidance");
  const [isFullscreenIDE, setIsFullscreenIDE] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { progress, updateProgress, logActivity } = useDashboard();

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
  const videos = domain.resources.filter((r) => r.type === "video" || r.type === "course");
  const articles = domain.resources.filter((r) => r.type === "article");

  if (isFullscreenIDE) {
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
        {/* Tabs */}
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
                  Open Code Editor
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Code Editor Tab */}
          <TabsContent value="editor">
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                  <Maximize2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Lunor.AI Code Editor</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Full-screen VS Code-style IDE with file explorer, multi-tab editing,
                  integrated terminal, and AI assistant — all tuned for {domain.name}.
                </p>
                <Button size="lg" onClick={() => setIsFullscreenIDE(true)} className="mt-2">
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Launch Full-Screen Editor
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            {videos.length > 0 ? (
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
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
                <Video className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">Videos coming soon. Check back later!</p>
              </div>
            )}
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            {articles.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {articles.map((r) => (
                  <ArticleCard key={r.id} resource={r} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">Materials coming soon. Check back later!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default DomainDetail;
