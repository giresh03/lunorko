import { Link } from "react-router-dom";
import { useRef, useEffect, useCallback } from "react";
import { domains } from "@/lib/domains";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";

const useCardParallax = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !imgRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const windowH = window.innerHeight;
    // Progress: 0 when card enters bottom, 1 when it exits top
    const progress = 1 - (rect.top + rect.height) / (windowH + rect.height);
    // Shift image between -15px and +15px based on scroll position
    const offset = (progress - 0.5) * 30;
    imgRef.current.style.transform = `translateY(${offset}px) scale(1.15)`;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return { containerRef, imgRef };
};

const DomainCard = ({ domain }: { domain: typeof domains[0] }) => {
  const Icon = domain.icon;
  const { containerRef, imgRef } = useCardParallax();
  const { user } = useAuth();
  const { progress } = useDashboard();
  
  const dp = progress.find((p) => p.domain_id === domain.id);
  const completedCount = dp?.completed_topics.length ?? 0;
  const totalTopics = domain.topics.length;
  const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const hasProgress = user && completedCount > 0;

  return (
    <BackgroundGradient containerClassName="rounded-xl h-full">
      <Link
        to={`/domain/${domain.id}`}
        className="group relative flex flex-col rounded-xl bg-card overflow-hidden min-h-[340px] transition-all duration-500 hover:bg-card/90 hover:-translate-y-1 hover:shadow-xl"
      >
        {/* Image with parallax + glassmorphism */}
        <div ref={containerRef} className="relative h-44 w-full overflow-hidden">
          <img
            ref={imgRef}
            src={domain.image}
            alt={domain.name}
            className="h-full w-full object-cover will-change-transform transition-transform duration-700 group-hover:scale-[1.2]"
            style={{ transform: "translateY(0) scale(1.15)" }}
            loading="lazy"
          />
          {/* Multi-layer gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(circle at 50% 80%, hsl(${domain.color} / 0.15) 0%, transparent 70%)` }}
          />

          {/* Glassmorphism icon badge */}
          <div
            className="absolute top-3 left-3 flex h-11 w-11 items-center justify-center rounded-xl backdrop-blur-xl border border-border/20 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-primary/20"
            style={{ backgroundColor: `hsl(${domain.color} / 0.2)` }}
          >
            <Icon className="h-5 w-5 drop-shadow-sm" style={{ color: `hsl(${domain.color})` }} />
          </div>

          {/* Glassmorphism topic count pill */}
          <div className="absolute top-3 right-3 rounded-full backdrop-blur-xl border border-border/20 bg-background/30 px-2.5 py-1 text-[10px] font-medium text-foreground/80 shadow-sm">
            {domain.topics.length} topics
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              {domain.name}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">{domain.description}</p>
          </div>
          <div className="mt-auto flex flex-wrap gap-1.5">
            {domain.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="rounded-md backdrop-blur-sm bg-secondary/60 px-2.5 py-1 text-xs text-secondary-foreground border border-border/10 transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
              >
                {topic}
              </span>
            ))}
            {domain.topics.length > 3 && (
              <span className="text-xs text-muted-foreground px-1 py-1">+{domain.topics.length - 3}</span>
            )}
          </div>
          {/* Progress indicator */}
          {hasProgress && (
            <div className="flex items-center gap-2">
              <Progress value={progressPct} className="h-1.5 flex-1" />
              <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                {progressPct === 100 ? (
                  <span className="flex items-center gap-0.5 text-primary"><CheckCircle2 className="h-3 w-3" /> Done</span>
                ) : (
                  `${progressPct}%`
                )}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            {hasProgress ? "Continue" : "Explore"} <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </Link>
    </BackgroundGradient>
  );
};

export default DomainCard;
