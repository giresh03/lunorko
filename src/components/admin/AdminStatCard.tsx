import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: number;
  prefix?: string;
  icon: LucideIcon;
  tone?: string;
  series?: number[];
  delta?: number | null;
  index?: number;
}

/** Animated count-up hook (respects reduced motion). */
const useCountUp = (target: number, duration = 900) => {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !Number.isFinite(target)) {
      setDisplay(target || 0);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(target * eased);
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => frame.current && cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return display;
};

export const AdminStatCard = ({
  label,
  value,
  prefix = "",
  icon: Icon,
  tone = "text-primary",
  series,
  delta,
  index = 0,
}: AdminStatCardProps) => {
  const animated = useCountUp(value ?? 0);
  const shown = Math.round(animated);
  const chartData = (series?.length ? series : []).map((v, i) => ({ i, v }));
  const gradientId = `stat-spark-${label.replace(/\W+/g, "")}`;

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border gradient-card p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 animate-fade-in"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground truncate">{label}</p>
          <p className="mt-1 text-lg sm:text-2xl font-bold font-display text-foreground tabular-nums">
            {prefix}
            {shown.toLocaleString()}
          </p>
        </div>
        <div className={cn("shrink-0 rounded-lg border border-border/60 bg-secondary/60 p-2", tone)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="relative mt-2 flex items-end justify-between gap-2">
        {typeof delta === "number" && Number.isFinite(delta) ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              delta >= 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(Math.round(delta))}%
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground">all time</span>
        )}

        {chartData.length > 1 && (
          <div className="h-8 w-16 sm:w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  fill={`url(#${gradientId})`}
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStatCard;
