import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import GradientText from "@/components/hero/GradientText";
import MagneticButton from "@/components/hero/MagneticButton";

const HeroParticleField = lazy(() => import("@/components/hero/HeroParticleField"));

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const parallaxSlow = scrollY * 0.3;
  const parallaxMedium = scrollY * 0.5;
  const opacityFade = Math.max(0, 1 - scrollY / 800);

  return (
    <section ref={sectionRef} className="relative overflow-hidden min-h-screen flex items-center justify-center">
      {/* 3D Particle Background — parallax layer (slow) */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${parallaxSlow}px)` }}
      >
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-background">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-[100px] animate-pulse" />
            </div>
          }
        >
          <HeroParticleField />
        </Suspense>
      </div>

      {/* Depth gradient overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20" />
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background))_100%)]" />
      </div>

      {/* Ambient glow spots — parallax layer (medium) */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{ transform: `translateY(${parallaxSlow * 0.5}px)`, opacity: opacityFade }}
      >
        <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] bg-[hsl(239,84%,67%/0.06)] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/6 w-[400px] h-[400px] bg-[hsl(192,91%,36%/0.05)] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(270,60%,50%/0.04)] rounded-full blur-[180px]" />
      </div>

      {/* Content — parallax layer (foreground, minimal shift) */}
      <div
        className="relative z-10 mx-auto flex flex-col items-center px-6 text-center max-w-6xl py-32 md:py-44"
        style={{ transform: `translateY(${parallaxMedium * 0.1}px)`, opacity: opacityFade }}
      >
        {/* Badge */}
        <div className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-[hsl(239,84%,67%/0.25)] bg-[hsl(239,84%,67%/0.06)] px-6 py-2.5 backdrop-blur-2xl animate-hero-badge">
          <Sparkles className="h-4 w-4 text-[hsl(239,84%,67%)] animate-pulse" />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[hsl(239,84%,67%)]">
            Next-Gen AI Learning Ecosystem
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-hero-title font-serif select-none">
          <span className="block text-5xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold text-foreground leading-[1.05] tracking-tight">
            Code Smarter with
          </span>
          <span className="block text-5xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold mt-3 leading-[1.05]">
            <GradientText>Lunor.AI</GradientText>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-10 max-w-2xl text-lg md:text-xl lg:text-[1.35rem] text-muted-foreground leading-relaxed animate-hero-subtitle">
          Your AI-powered coding companion. Master any engineering domain with personalized guidance,
          intelligent code assistants, curated resources, and hands-on projects.
        </p>

        {/* CTA */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-5 animate-hero-cta">
          <MagneticButton size="lg" className="text-base px-8 py-6" asChild>
            <Link to="/domains">
              Explore Domains <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </MagneticButton>
          <MagneticButton
            size="lg"
            magnetStrength={0.2}
            variant="outline"
            className="!bg-[hsl(var(--background)/0.4)] !border-border/40 !text-foreground hover:!border-[hsl(239,84%,67%/0.5)] !shadow-none hover:!shadow-[0_0_40px_hsl(239,84%,67%/0.12)] text-base px-8 py-6 backdrop-blur-xl"
            asChild
          >
            <Link to="/about">Learn More</Link>
          </MagneticButton>
        </div>

        {/* Floating stats strip */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-12 animate-hero-cta text-center">
          {[
            { value: "12+", label: "Domains" },
            { value: "50K+", label: "Students" },
            { value: "AI", label: "Powered" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground/70 uppercase tracking-widest mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
      >
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em]">Scroll</span>
        <div className="h-9 w-5 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center p-1.5">
          <div className="h-2 w-1 rounded-full bg-[hsl(239,84%,67%/0.6)] animate-scroll-dot" />
        </div>
      </div>
    </section>
  );
}
