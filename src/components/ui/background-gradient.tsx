import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <div className={cn("relative p-[2px] group", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? { duration: 5, repeat: Infinity, repeatType: "reverse" }
            : undefined
        }
        style={{ backgroundSize: "400% 400%" }}
        className={cn(
          "absolute inset-0 rounded-xl z-[1] opacity-40 group-hover:opacity-100 blur-xl transition-opacity duration-500 will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,hsl(260_60%_30%),transparent),radial-gradient(circle_farthest-side_at_100%_0,hsl(200_80%_25%),transparent),radial-gradient(circle_farthest-side_at_100%_100%,hsl(280_50%_20%),transparent),radial-gradient(circle_farthest-side_at_0_0,hsl(220_60%_15%),hsl(230_20%_10%))]"
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? { duration: 5, repeat: Infinity, repeatType: "reverse" }
            : undefined
        }
        style={{ backgroundSize: "400% 400%" }}
        className={cn(
          "absolute inset-0 rounded-xl z-[1] will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,hsl(260_60%_30%),transparent),radial-gradient(circle_farthest-side_at_100%_0,hsl(200_80%_25%),transparent),radial-gradient(circle_farthest-side_at_100%_100%,hsl(280_50%_20%),transparent),radial-gradient(circle_farthest-side_at_0_0,hsl(220_60%_15%),hsl(230_20%_10%))]"
        )}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
