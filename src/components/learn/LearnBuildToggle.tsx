import { BookOpen, Code2 } from "lucide-react";

export type LearnMode = "learn" | "build";

interface Props {
  mode: LearnMode;
  onChange: (mode: LearnMode) => void;
}

const LearnBuildToggle = ({ mode, onChange }: Props) => (
  <div className="relative inline-flex items-center rounded-full border border-border/70 bg-card/70 p-1 backdrop-blur-xl shadow-[0_0_30px_-12px_hsl(var(--primary)/0.6)]">
    <span
      className="absolute inset-y-1 w-1/2 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-transform duration-500 ease-out"
      style={{ transform: mode === "learn" ? "translateX(0%)" : "translateX(100%)" }}
      aria-hidden
    />
    {(["learn", "build"] as LearnMode[]).map((m) => (
      <button
        key={m}
        type="button"
        onClick={() => onChange(m)}
        className={`relative z-10 flex w-28 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${
          mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={mode === m}
      >
        {m === "learn" ? <BookOpen className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
        {m}
      </button>
    ))}
  </div>
);

export default LearnBuildToggle;
