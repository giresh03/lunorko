import { useEffect, useState } from "react";

const LETTERS = "LUNOR.AI".split("");

const LunorLoader = ({ onDone }: { onDone: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const total = 1800;
    const id = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / total) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(id);
        setTimeout(onDone, 220);
      }
    }, 40);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* orbiting ring mark */}
      <div className="relative mb-10 h-24 w-24">
        <div className="absolute inset-0 rounded-full border border-border/60" />
        <div className="absolute inset-0 animate-[lunor-spin_1.5s_linear_infinite] rounded-full border-2 border-transparent border-t-primary border-r-primary/40" />
        <div className="absolute inset-3 animate-[lunor-spin-rev_2.2s_linear_infinite] rounded-full border border-transparent border-b-primary/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_24px_hsl(var(--primary))] animate-[lunor-pulse_1.4s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* wordmark */}
      <div className="flex items-center gap-[0.06em] font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
        {LETTERS.map((c, i) => (
          <span
            key={i}
            className="inline-block opacity-0 animate-[lunor-in_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {c === "." ? <span className="text-primary">.</span> : c}
          </span>
        ))}
      </div>

      <p className="mt-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">Initializing workspace</p>

      {/* progress sweep */}
      <div className="mt-8 h-[2px] w-56 overflow-hidden rounded-full bg-border/60">
        <div
          className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <style>{`
        @keyframes lunor-spin { to { transform: rotate(360deg); } }
        @keyframes lunor-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes lunor-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: .55; } }
        @keyframes lunor-in { 0% { opacity: 0; transform: translateY(14px); filter: blur(6px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
      `}</style>
    </div>
  );
};

export default LunorLoader;
