import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Sparkles, Trophy, Target, CheckCircle2 } from "lucide-react";
import { TOTAL_LEVELS } from "@/lib/learningRoadmap";

interface Props {
  domainName: string;
  currentLevelTitle: string;
  currentLevel: number;
  completed: number;
  xp: number;
  streak: number;
  progressPct: number;
}

const BADGES = [
  { id: "first", label: "First Code", need: 1 },
  { id: "five", label: "Fast Learner", need: 5 },
  { id: "debug", label: "Debugger", need: 8 },
  { id: "builder", label: "Project Builder", need: 12 },
  { id: "master", label: "Code Master", need: 20 },
];

const ProgressHud = ({ domainName, currentLevelTitle, currentLevel, completed, xp, streak, progressPct }: Props) => (
  <div className="rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current domain</p>
        <h3 className="text-xl font-bold text-foreground">{domainName}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Level {currentLevel} — {currentLevelTitle}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" /> {xp.toLocaleString()} XP
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Flame className="h-3.5 w-3.5 text-primary" /> {streak} day streak
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {completed}/{TOTAL_LEVELS} levels
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" /> {progressPct}%
        </Badge>
      </div>
    </div>
    <Progress value={progressPct} className="mt-5 h-2" />
    <div className="mt-5 flex flex-wrap gap-2">
      {BADGES.map((b) => {
        const earned = completed >= b.need;
        return (
          <span
            key={b.id}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all ${
              earned
                ? "border-primary/40 bg-primary/10 text-primary shadow-[0_0_20px_-8px_hsl(var(--primary))]"
                : "border-border/60 text-muted-foreground/60"
            }`}
          >
            <Trophy className="h-3 w-3" /> {b.label}
          </span>
        );
      })}
    </div>
  </div>
);

export default ProgressHud;
