import { Check, Lock, Play, Sparkles } from "lucide-react";
import type { LevelDef } from "@/lib/learningRoadmap";
import type { LevelStatus } from "@/hooks/useLearningProgress";

interface Props {
  levels: LevelDef[];
  statusFor: (index: number) => LevelStatus;
  scoreFor: (index: number) => number | null;
  onOpen: (level: LevelDef) => void;
}

const RoadmapMap = ({ levels, statusFor, scoreFor, onOpen }: Props) => (
  <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-card/70 to-background p-6 md:p-10">
    <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(hsl(var(--primary))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px)] [background-size:44px_44px]" />

    <div className="relative flex flex-col gap-0">
      {levels.map((level, i) => {
        const status = statusFor(level.index);
        const locked = status === "locked";
        const isCurrent = status === "current";
        const completed = status === "completed";
        const side = i % 2 === 0 ? "left" : "right";
        const score = scoreFor(level.index);

        return (
          <div key={level.index} className="relative">
            {i > 0 && (
              <div
                className={`mx-auto h-12 w-px ${completed || isCurrent ? "bg-gradient-to-b from-primary/70 to-primary/20" : "bg-border/60"}`}
                aria-hidden
              />
            )}
            <div
              className={`flex items-center gap-4 md:gap-8 ${
                side === "left" ? "md:flex-row" : "md:flex-row-reverse"
              } flex-row`}
            >
              <button
                type="button"
                disabled={locked}
                onClick={() => onOpen(level)}
                aria-label={`Level ${level.index}: ${level.title}`}
                className={`group relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 md:h-24 md:w-24 ${
                  locked
                    ? "cursor-not-allowed border-border/60 bg-muted/30 text-muted-foreground/50"
                    : completed
                      ? "border-primary/70 bg-primary/15 text-primary hover:scale-105"
                      : isCurrent
                        ? "animate-pulse border-primary bg-primary/20 text-primary shadow-[0_0_45px_-8px_hsl(var(--primary))] hover:scale-105"
                        : "border-primary/40 bg-card text-foreground hover:scale-105 hover:border-primary"
                }`}
              >
                <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/5" aria-hidden />
                <div className="flex flex-col items-center">
                  {locked ? (
                    <Lock className="h-5 w-5" />
                  ) : completed ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                  <span className="mt-0.5 text-[11px] font-bold tracking-wider">LV {level.index}</span>
                </div>
              </button>

              <div className={`min-w-0 flex-1 ${side === "left" ? "text-left" : "md:text-right"}`}>
                <div
                  className={`inline-flex flex-col rounded-xl border px-4 py-3 backdrop-blur-sm transition-all ${
                    locked ? "border-border/50 bg-card/30" : "border-border/70 bg-card/70 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                      {level.tier}
                    </span>
                    {level.milestone && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                        <Sparkles className="h-3 w-3" /> Milestone
                      </span>
                    )}
                    {isCurrent && <span className="text-[10px] font-semibold text-primary">CONTINUE →</span>}
                  </div>
                  <h4 className={`mt-1 text-base font-bold ${locked ? "text-muted-foreground/70" : "text-foreground"}`}>
                    {level.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    +{level.xp} XP{score != null ? ` · scored ${score}/100` : ""}
                    {level.milestone ? ` · ${level.milestone}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default RoadmapMap;
