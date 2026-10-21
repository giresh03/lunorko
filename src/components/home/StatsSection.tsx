import { Users, BookOpen, Code2, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const stats = [
  { icon: Users, value: 5000, suffix: "+", label: "Students" },
  { icon: BookOpen, value: 4, suffix: "", label: "Learning Domains" },
  { icon: Code2, value: 4, suffix: "", label: "AI Code Assistants" },
  { icon: Award, value: 30, suffix: "", label: "Levels per Domain" },
];

const formatNumber = (n: number) => n.toLocaleString("en-IN");

const useCountUp = (target: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = duration / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, interval);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
};

const StatItem = ({ icon: Icon, value, suffix, label }: typeof stats[number]) => {
  const { count, ref } = useCountUp(value);
  return (
    <div
      ref={ref}
      className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out text-center"
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="text-3xl font-bold text-foreground md:text-4xl">
        {formatNumber(count)}{suffix}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

const StatsSection = () => (
  <section className="border-y border-border bg-card/50 py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat, i) => (
          <StatItem key={i} {...stat} />
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
