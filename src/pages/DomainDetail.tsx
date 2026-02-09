import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Video, FileText, ExternalLink, CheckCircle2, CodeXml } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodeAssistant from "@/components/CodeAssistant";
import CodeEditorComponent from "@/components/CodeEditor";
import { domains } from "@/lib/domains";

const DomainDetail = () => {
  const { domainId } = useParams();
  const domain = domains.find((d) => d.id === domainId);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link to="/domains" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Domains
          </Link>
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `hsl(${domain.color} / 0.15)` }}
            >
              <Icon className="h-7 w-7" style={{ color: `hsl(${domain.color})` }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{domain.name}</h1>
              <p className="mt-1 text-muted-foreground">{domain.description}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {domain.topics.map((topic) => (
              <span key={topic} className="rounded-sm bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="guidance" className="w-full">
          <TabsList className="mb-6 w-full justify-start bg-card border border-border">
            <TabsTrigger value="guidance">Guidance</TabsTrigger>
            <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            <TabsTrigger value="editor">Code Editor</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="guidance">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Learning Roadmap</h3>
                <div className="space-y-3">
                  {domain.topics.map((topic, i) => (
                    <div key={topic} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {i + 1}
                      </div>
                      <span className="text-sm text-foreground">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Why Learn {domain.name}?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>High demand in the job market with competitive salaries</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Build real-world projects that matter</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>AI-assisted learning accelerates your progress</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Industry-aligned curriculum with practical focus</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assistant">
            <CodeAssistant domainName={domain.name} />
          </TabsContent>

          <TabsContent value="editor">
            <CodeEditorComponent domainName={domain.name} />
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {domain.resources
                .filter((r) => r.type === "video" || r.type === "course")
                .map((r) => (
                  <div key={r.id} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30">
                    <div className="mb-3 flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{r.source}</span>
                      {r.duration && (
                        <span className="ml-auto text-xs text-muted-foreground">{r.duration}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-foreground">{r.title}</h4>
                    <a href={r.url} className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      Watch <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              {domain.resources.filter((r) => r.type === "video" || r.type === "course").length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground">Videos coming soon. Check back later!</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="materials">
            <div className="grid gap-4 sm:grid-cols-2">
              {domain.resources
                .filter((r) => r.type === "article")
                .map((r) => (
                  <div key={r.id} className="rounded-lg border border-border bg-card p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-accent-foreground" />
                      <span className="text-xs text-muted-foreground">{r.source}</span>
                    </div>
                    <h4 className="text-sm font-medium text-foreground">{r.title}</h4>
                    <a href={r.url} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      Read <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              <div className="rounded-lg border border-dashed border-border bg-card/50 p-5 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">More materials will be uploaded soon</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default DomainDetail;
