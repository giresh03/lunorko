import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import GradientText from "@/components/hero/GradientText";
import MagneticButton from "@/components/hero/MagneticButton";

const HeroParticleField = lazy(() => import("@/components/hero/HeroParticleField"));

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
      {/* 3D Particle Background */}
      <Suspense fallback={null}>
        <HeroParticleField />
      </Suspense>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/10 via-background/50 to-background pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-background/30 via-transparent to-background/30 pointer-events-none" />

      {/* Ambient glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(239,84%,67%/0.08)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(192,91%,36%/0.06)] rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex flex-col items-center px-6 text-center max-w-6xl py-32 md:py-40">
        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[hsl(239,84%,67%/0.3)] bg-[hsl(239,84%,67%/0.08)] px-5 py-2 backdrop-blur-xl animate-hero-badge"
        >
          <Sparkles className="h-4 w-4 text-[hsl(239,84%,67%)] animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-[hsl(239,84%,67%)]">
            Next-Gen AI Learning Ecosystem
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-hero-title font-serif">
          <span className="block text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[1.1] tracking-tight">
            Code Smarter with
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl font-bold mt-2 leading-[1.1]">
            <GradientText>Lunor.AI</GradientText>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed animate-hero-subtitle">
          Your AI-powered coding companion. Master any engineering domain with personalized guidance,
          intelligent code assistants, curated resources, and hands-on projects.
        </p>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 animate-hero-cta">
          <MagneticButton size="lg" asChild>
            <Link to="/domains">
              Explore Domains <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </MagneticButton>
          <MagneticButton
            size="lg"
            magnetStrength={0.2}
            variant="outline"
            className="!bg-transparent !border-border/50 !text-foreground hover:!border-[hsl(239,84%,67%/0.5)] !shadow-none hover:!shadow-[0_0_30px_hsl(239,84%,67%/0.15)]"
            asChild
          >
            <Link to="/about">Learn More</Link>
          </MagneticButton>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Scroll</span>
          <div className="h-8 w-5 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
            <div className="h-2 w-1 rounded-full bg-[hsl(239,84%,67%)] animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
