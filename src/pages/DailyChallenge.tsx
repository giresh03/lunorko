import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft, Clock, Zap, Trophy, Lightbulb, Send, Loader2, CheckCircle2,
  XCircle, ChevronRight, Flame, Timer, Medal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import LockGate from "@/components/LockGate";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { domains } from "@/lib/domains";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Challenge {
  id: string;
  domain_id: string;
  title: string;
  description: string;
  difficulty: string;
  hints: string[];
  xp_reward: number;
  challenge_date: string;
}

interface EvalResult {
  is_correct: boolean;
  feedback: string;
  score: number;
  xp_earned: number;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

const DailyChallenge = () => {
  const { domainId } = useParams();
  const domain = domains.find((d) => d.id === domainId);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (!domainId) return;
    fetchChallenge();
    fetchLeaderboard();
  }, [domainId]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ domain_id: domainId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChallenge(data);
      setTimerRunning(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("user_xp")
      .select("user_id, total_xp, level, current_streak")
      .order("total_xp", { ascending: false })
      .limit(10);
    
    if (data && data.length > 0) {
      const userIds = data.map((d: any) => d.user_id);
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("user_id, display_name, username")
        .in("user_id", userIds);
      
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.username || p.display_name]));
      setLeaderboard(data.map((d: any) => ({ ...d, display_name: profileMap.get(d.user_id) || "Anonymous" })));
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || !challenge || !user) return;
    setSubmitting(true);
    setTimerRunning(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challenge_id: challenge.id,
          code,
          time_taken_seconds: timerSeconds,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      if (data.is_correct) {
        toast({ title: "🎉 Correct!", description: `+${data.xp_earned} XP earned!` });
        fetchLeaderboard();
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (!authLoading && !user) return <Navigate to="/auth" replace />;
  if (!domain) return <Navigate to="/domains" replace />;

  const Icon = domain.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LockGate lockKey="challenges" name="Daily Challenges">
      <main className="container mx-auto px-4 pt-24 pb-20">
        <Link to={`/domain/${domainId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to {domain.name}
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `hsl(${domain.color} / 0.2)` }}>
            <Icon className="h-6 w-6" style={{ color: `hsl(${domain.color})` }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daily Challenge</h1>
            <p className="text-sm text-muted-foreground">{domain.name} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
              <Timer className="h-4 w-4 text-primary" />
              <span className="text-lg font-mono font-bold text-foreground">{formatTime(timerSeconds)}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Generating today's challenge with AI...</span>
          </div>
        ) : challenge ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Challenge */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-foreground">{challenge.title}</h2>
                  <Badge variant="outline" className={difficultyColors[challenge.difficulty]}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Zap className="mr-1 h-3 w-3" /> +{challenge.xp_reward} XP
                  </Badge>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
                  <ReactMarkdown>{challenge.description}</ReactMarkdown>
                </div>
              </div>

              {/* Hints */}
              {challenge.hints.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lightbulb className="h-4 w-4 text-yellow-400" />
                    Hints ({hintsRevealed}/{challenge.hints.length})
                    <ChevronRight className={`h-4 w-4 transition-transform ${showHints ? "rotate-90" : ""}`} />
                  </button>
                  {showHints && (
                    <div className="mt-3 space-y-2">
                      {challenge.hints.map((hint, i) => (
                        <div key={i}>
                          {i < hintsRevealed ? (
                            <p className="text-sm text-muted-foreground pl-6">💡 {hint}</p>
                          ) : (
                            <button
                              onClick={() => setHintsRevealed(i + 1)}
                              className="text-sm text-primary hover:underline pl-6"
                            >
                              Reveal hint {i + 1}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Code Editor */}
              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Your Solution</span>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Write your solution here..."
                  className="w-full min-h-[300px] bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y"
                  disabled={!!result?.is_correct}
                />
                <div className="border-t border-border px-4 py-3 flex justify-end">
                  <Button onClick={handleSubmit} disabled={submitting || !code.trim() || !!result?.is_correct}>
                    {submitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> Submit Solution</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Result */}
              {result && (
                <div className={`rounded-xl border p-6 ${result.is_correct ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {result.is_correct ? (
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-400" />
                    )}
                    <h3 className="text-lg font-bold text-foreground">
                      {result.is_correct ? "Correct! 🎉" : "Not quite right"}
                    </h3>
                    <Badge className="ml-auto">{result.score}/100</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.feedback}</p>
                  {result.xp_earned > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-primary font-medium">
                      <Zap className="h-4 w-4" /> +{result.xp_earned} XP earned!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Leaderboard */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-bold text-foreground">Leaderboard</h3>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No entries yet. Be the first!</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => (
                      <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${i < 3 ? "bg-primary/5" : ""}`}>
                        <span className={`text-sm font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                          #{i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {entry.display_name}
                            {entry.user_id === user?.id && <span className="text-primary ml-1">(You)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{entry.total_xp}</p>
                          <p className="text-[10px] text-muted-foreground">XP</p>
                        </div>
                        {entry.current_streak > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Flame className="h-3 w-3 text-orange-400" />
                            <span className="text-xs text-orange-400">{entry.current_streak}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* All domains */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-bold text-foreground mb-3">Try Other Domains</h3>
                <div className="space-y-1.5">
                  {domains.filter(d => d.id !== domainId).slice(0, 6).map(d => {
                    const DIcon = d.icon;
                    return (
                      <Link
                        key={d.id}
                        to={`/challenge/${d.id}`}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <DIcon className="h-4 w-4" style={{ color: `hsl(${d.color})` }} />
                        {d.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>No challenge available. Try again later.</p>
          </div>
        )}
      </main>
      </LockGate>
      <Footer />
    </div>
  );
};

export default DailyChallenge;
