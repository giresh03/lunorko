import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export default function GradientText({ children, className, animate = true }: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent",
        "bg-[length:200%_200%]",
        animate && "animate-gradient-shift",
        className
      )}
      style={{
        backgroundImage: "linear-gradient(135deg, #6366f1 0%, #06b6d4 30%, #8b5cf6 60%, #14b8a6 100%)",
      }}
    >
      {children}
    </span>
  );
}
