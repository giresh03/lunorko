import React, { useRef, useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends ButtonProps {
  magnetStrength?: number;
}

const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, className, magnetStrength = 0.3, ...props }, ref) => {
    const btnRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState("translate(0px, 0px)");
    const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setTransform(`translate(${x * magnetStrength}px, ${y * magnetStrength}px)`);
      setGlowPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };

    const handleMouseLeave = () => {
      setTransform("translate(0px, 0px)");
      setGlowPos({ x: 50, y: 50 });
    };

    return (
      <div
        ref={btnRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative inline-block"
        style={{ transform, transition: "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, hsl(var(--primary) / 0.4), transparent 70%)`,
          }}
        />
        <Button
          ref={ref}
          className={cn(
            "relative overflow-hidden group",
            "bg-gradient-to-r from-[hsl(239,84%,67%)] to-[hsl(192,91%,36%)]",
            "hover:from-[hsl(239,84%,72%)] hover:to-[hsl(192,91%,42%)]",
            "text-[hsl(0,0%,100%)] border-0 shadow-[0_0_30px_hsl(239,84%,67%/0.3)]",
            "hover:shadow-[0_0_50px_hsl(239,84%,67%/0.5)]",
            "transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            className
          )}
          {...props}
        >
          {children}
        </Button>
      </div>
    );
  }
);

MagneticButton.displayName = "MagneticButton";
export default MagneticButton;
