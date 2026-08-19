import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Brain, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureGate from "@/components/FeatureGate";
import LockGate from "@/components/LockGate";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { domains } from "@/lib/domains";

interface SkillScore {
  topic: string;
  score: number;
}

const SkillRadar = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedDomain, setSelectedDomain] = useState(domains[0].id);
  const [scores, setScores] = useState<SkillScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [assessing, setAssessing] = useState(false);

  const domain = domains.find(d => d.id === selectedDomain);

  useEffect(() => {
    if (!user || !selectedDomain) return;
    fetchScores();
  }, [user, selectedDomain]);

  const fetchScores = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("skill_assessments")
      .select("topic, score")
      .eq("user_id", user.id)
      .eq("domain_id", selectedDomain);
    setScores((data as SkillScore[]) ?? []);
    setLoading(false);
  };

  const handleAssess = async () => {
    if (!user || !domain) return;
    setAssessing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assess-skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain_id: selectedDomain, topics: domain.topics }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScores(data.scores);
      toast({ title: "Skills Assessed!", description: "Your skill radar has been updated." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setAssessing(false);
  };

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  const chartData = domain?.topics.map(topic => ({
    topic: topic.length > 12 ? topic.slice(0, 12) + "…" : topic,
    fullTopic: topic,
    score: scores.find(s => s.topic === topic)?.score ?? 0,
  })) ?? [];

  const avgScore = chartData.length > 0 ? Math.round(chartData.reduce((s, d) => s + d.score, 0) / chartData.length) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LockGate lockKey="skill_radar" name="AI Skill Radar"><FeatureGate feature="skill-radar" featureName="Skill Radar" requiredPlan="premium">
      <main className="container mx-auto px-4 pt-24 pb-20 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI Skill Radar</h1>
        </div>
        <p className="text-muted-foreground mb-8">AI-powered skill assessment across your domains. See your strengths and areas to improve.</p>

        {/* Domain selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {domains.map(d => {
            const DIcon = d.icon;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedDomain === d.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <DIcon className="h-4 w-4" />
                {d.name}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Radar Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">{domain?.name} Skills</h3>
              <Badge variant="outline">Avg: {avgScore}%</Badge>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-[350px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : chartData.length > 0 && chartData.some(d => d.score > 0) ? (
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Radar name="Skills" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                <Brain className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No assessment yet. Run the AI assessment to see your radar.</p>
              </div>
            )}
            <Button onClick={handleAssess} disabled={assessing} className="w-full mt-4">
              {assessing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assessing...</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" /> {scores.length > 0 ? "Reassess Skills" : "Run AI Assessment"}</>
              )}
            </Button>
          </div>

          {/* Topic Breakdown */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-bold text-foreground mb-4">Topic Breakdown</h3>
            <div className="space-y-3">
              {chartData.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{item.fullTopic}</span>
                    <span className={`text-sm font-bold ${item.score >= 70 ? "text-green-400" : item.score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                      {item.score}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.score >= 70 ? "bg-green-500" : item.score >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {chartData.length > 0 && chartData.some(d => d.score > 0) && (
              <div className="mt-6 rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">💡 Recommendation:</strong>{" "}
                  Focus on {chartData.filter(d => d.score < 50).map(d => d.fullTopic).slice(0, 3).join(", ") || "maintaining your strong skills"} to level up.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      </FeatureGate></LockGate>
      <Footer />
    </div>
  );
};

export default SkillRadar;
