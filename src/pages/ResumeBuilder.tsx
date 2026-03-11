import { useState } from "react";
import { Navigate } from "react-router-dom";
import { FileText, Loader2, Download, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureGate from "@/components/FeatureGate";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const ResumeBuilder = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [extraInfo, setExtraInfo] = useState("");
  const [resume, setResume] = useState("");
  const [generating, setGenerating] = useState(false);

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ extra_info: extraInfo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResume(data.resume);
      toast({ title: "Resume Generated!", description: "Your AI-powered resume is ready." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  const handleDownload = () => {
    const blob = new Blob([resume], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lunor-resume.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FeatureGate feature="resume-builder" featureName="Resume Builder" requiredPlan="professional">
      <main className="container mx-auto px-4 pt-24 pb-20 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">AI Resume Builder</h1>
          </div>
          <p className="text-muted-foreground">
            Auto-generates a professional tech resume from your Lunor.AI learning data — domains, topics, challenges, mentor sessions, and achievements.
          </p>
        </div>

        {!resume ? (
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Additional Information (optional)
              </label>
              <Textarea
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                placeholder="Add your education details, personal projects, internship experience, etc. The AI will merge this with your Lunor.AI learning data."
                className="min-h-[150px]"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <div className="text-sm text-muted-foreground">
                <strong className="text-foreground">How it works:</strong> The AI analyzes your completed topics, daily challenges solved, mentor sessions, XP level, and achievements to create a compelling, ATS-optimized resume.
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={generating} size="lg" className="w-full">
              {generating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Resume...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Generate My Resume</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button onClick={handleDownload} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download Markdown
              </Button>
              <Button onClick={() => setResume("")} variant="ghost">
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{resume}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ResumeBuilder;
