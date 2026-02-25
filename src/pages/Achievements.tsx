import { Navigate, Link } from "react-router-dom";
import { Trophy, Flame, Star, Zap, Lock, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useGamification, getLevelName, getXPProgress } from "@/hooks/useGamification";

const categoryIcons: Record<string, string> = {
  coding: "💻",
  streak: "🔥",
  domains: "🌐",
  learning: "📚",
  challenges: "🎯",
  mentoring: "🤝",
  engagement: "📌",
};

const Achievements = () => {
  const { user, loading: authLoading } = useAuth();
  const { xp, achievements, earnedAchievements, loading } = useGamification();

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  const earned = new Set(earnedAchievements.map(a => a.achievement_id));
  const categories = [...new Set(achievements.map(a => a.category))];
  const progressPercent = xp ? getXPProgress(xp.total_xp, xp.level) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20 max-w-5xl">
        {/* XP Header */}
        <div className="mb-10 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-bold text-primary">
              {xp?.level || 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{getLevelName(xp?.level || 1)}</h1>
                <Badge variant="outline" className="text-xs">Level {xp?.level || 1}</Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-3">
                {xp?.total_xp || 0} XP total · {earned.size}/{achievements.length} achievements unlocked
              </p>
              <div className="flex items-center gap-3">
                <Progress value={progressPercent} className="flex-1 h-3" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {progressPercent}% to Level {(xp?.level || 1) + 1}
                </span>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="h-5 w-5" />
                  <span className="text-2xl font-bold">{xp?.current_streak || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Current Streak</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-5 w-5" />
                  <span className="text-2xl font-bold">{xp?.longest_streak || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid gap-3 sm:grid-cols-3 mb-10">
          {[
            { to: "/challenge/web-development", label: "Daily Challenge", icon: Zap, desc: "Solve today's coding challenge" },
            { to: "/skill-radar", label: "Skill Radar", icon: Medal, desc: "See your strength radar" },
            { to: "/resume-builder", label: "AI Resume", icon: Star, desc: "Generate your resume" },
          ].map(link => (
            <Link key={link.to} to={link.to} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <link.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Achievements Grid by Category */}
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading achievements...</div>
        ) : (
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category}>
                <h2 className="text-lg font-bold text-foreground capitalize mb-4 flex items-center gap-2">
                  <span>{categoryIcons[category] || "🏆"}</span> {category}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {achievements.filter(a => a.category === category).map(ach => {
                    const isEarned = earned.has(ach.id);
                    return (
                      <div
                        key={ach.id}
                        className={`rounded-xl border p-4 transition-all ${
                          isEarned
                            ? "border-primary/30 bg-primary/5"
                            : "border-border bg-card opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`text-2xl ${isEarned ? "" : "grayscale"}`}>{ach.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold text-sm ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>
                                {ach.name}
                              </h3>
                              {!isEarned && <Lock className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Zap className="h-3 w-3 text-primary" />
                              <span className="text-xs font-medium text-primary">+{ach.xp_reward} XP</span>
                            </div>
                          </div>
                          {isEarned && (
                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">
                              ✓ Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Achievements;
