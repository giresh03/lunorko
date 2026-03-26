import {
  BookOpen,
  Compass,
  Hammer,
  Lightbulb,
  Map,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Domain } from "@/lib/domains";
import { getDomainGuidance } from "@/lib/domainGuidanceContent";

const accentIcon = {
  install: Hammer,
  path: Compass,
  build: Sparkles,
} as const;

export default function DomainGuidanceJourney({ domain }: { domain: Domain }) {
  const g = getDomainGuidance(domain.id);
  if (!g) return null;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute inset-0 opacity-40">
          <img src={domain.image} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80"
            style={{ maskImage: "linear-gradient(90deg, black 40%, transparent)" }}
          />
        </div>
        <div className="relative grid gap-6 p-6 md:p-10 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <Badge variant="secondary" className="mb-3 gap-1">
              <Map className="h-3 w-3" /> Learning roadmap
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{g.headline}</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">{g.subhead}</p>
          </div>
          <Card className="border-primary/20 bg-background/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5" /> Documentation habits
              </p>
              <ul className="space-y-2">
                {g.docTips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Start here */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> How to start — step zero
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {g.startHere.map((block, i) => {
            const Icon = accentIcon[block.accent];
            return (
              <Card
                key={i}
                className="overflow-hidden border-border/80 bg-gradient-to-b from-card to-muted/20 hover:border-primary/25 transition-colors"
              >
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, hsl(${domain.color}), transparent)` }}
                />
                <CardContent className="p-5 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `hsl(${domain.color} / 0.12)` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: `hsl(${domain.color})` }} />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm leading-tight">{block.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{block.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Phases timeline */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" /> Phased roadmap — what to do in order
        </h3>
        <div className="relative space-y-0">
          <div
            className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/60 via-border to-transparent md:left-[27px]"
            aria-hidden
          />
          {g.phases.map((phase) => (
            <div key={phase.phase} className="relative grid gap-6 pb-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10 last:pb-0">
              <div className="flex gap-4 md:gap-6">
                <div
                  className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background text-sm font-bold text-primary-foreground shadow-md md:h-14 md:w-14 md:text-lg"
                  style={{ background: `linear-gradient(135deg, hsl(${domain.color}), hsl(${domain.color} / 0.65))` }}
                >
                  {phase.phase}
                </div>
                <div className="min-w-0 pt-0.5 md:pt-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-foreground">{phase.title}</h4>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {phase.duration}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{phase.summary}</p>
                  <ul className="space-y-3">
                    {phase.steps.map((step, si) => (
                      <li
                        key={si}
                        className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-foreground">{step.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:pt-2 pl-14 md:pl-0">
                <div className="overflow-hidden rounded-xl border border-border shadow-lg aspect-[4/3] md:aspect-auto md:h-[min(280px,100%)]">
                  <img
                    src={phase.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
