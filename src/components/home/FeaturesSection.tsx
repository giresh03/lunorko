import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import createGlobe from "cobe";
import { Code2, BookOpen, Cpu, Rocket } from "lucide-react";

import webDevImg from "@/assets/domains/web-development.jpg";
import appDevImg from "@/assets/domains/app-development.jpg";
import cybersecurityImg from "@/assets/domains/cybersecurity.jpg";
import dataScienceImg from "@/assets/domains/data-science.jpg";
import cloudImg from "@/assets/domains/cloud-computing.jpg";
import platformDemoVideo from "@/assets/sections/platform-demo.mp4";

/* ───── Main Section ───── */
const FeaturesSection = () => {
  const features = [
    {
      title: "AI Code Assistant for Every Domain",
      description:
        "Get real-time code generation, debugging, and explanations powered by domain-specific AI models across 12+ engineering fields.",
      skeleton: <SkeletonOne />,
      className: "col-span-1 lg:col-span-4 border-b lg:border-r border-border",
    },
    {
      title: "12+ Specialized Domains",
      description:
        "From Web Dev to Cybersecurity, each domain comes with curated resources, structured roadmaps, and hands-on projects.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-border",
    },
    {
      title: "Watch & Learn with Video Hub",
      description:
        "Curated video tutorials from top educators — organized by domain and skill level for structured, visual learning.",
      skeleton: <SkeletonThree />,
      className: "col-span-1 lg:col-span-3 lg:border-r border-border",
    },
    {
      title: "Learn from Anywhere",
      description:
        "Access Lunor.AI from any device, anywhere in the world. Your learning progress syncs seamlessly across all platforms.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-primary">
            Platform Features
          </span>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mt-4">
            Everything You Need to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-[hsl(192,91%,50%)]">
              Excel
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            From AI code assistants to curated learning paths, Lunor.AI has everything
            an engineering student needs to become job-ready.
          </p>
        </div>

        {/* Features Grid */}
        <div className="relative scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <div className="grid grid-cols-1 lg:grid-cols-6 rounded-xl border border-border bg-card overflow-hidden">
            {features.map((feature) => (
              <FeatureCard key={feature.title} className={feature.className}>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
                <div className="h-full w-full mt-4">{feature.skeleton}</div>
              </FeatureCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

/* ───── Sub-components ───── */

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("p-4 sm:p-8 relative overflow-hidden", className)}>
    {children}
  </div>
);

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => (
  <p className="max-w-5xl mx-auto text-left tracking-tight text-foreground text-xl md:text-2xl md:leading-snug font-semibold">
    {children}
  </p>
);

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => (
  <p className="text-sm md:text-base max-w-4xl text-left mx-auto text-muted-foreground font-normal my-2">
    {children}
  </p>
);

/* ───── Skeleton One: Code Editor Preview ───── */
const SkeletonOne = () => (
  <div className="relative flex py-8 px-2 gap-10 h-full">
    <div className="w-full mx-auto bg-card shadow-lg group h-full rounded-lg overflow-hidden border border-border">
      <div className="flex items-center gap-2 p-3 border-b border-border bg-secondary/30">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-destructive/60" />
          <div className="h-3 w-3 rounded-full bg-[hsl(45,80%,55%)]" />
          <div className="h-3 w-3 rounded-full bg-[hsl(168,80%,50%)]" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">assistant.py</span>
      </div>
      <div className="p-4 font-mono text-xs md:text-sm leading-relaxed space-y-1">
        <div><span className="text-primary">from</span> <span className="text-[hsl(168,80%,50%)]">lunor</span> <span className="text-primary">import</span> CodeAssistant</div>
        <div />
        <div><span className="text-[hsl(192,91%,50%)]">assistant</span> = CodeAssistant(<span className="text-[hsl(45,80%,55%)]">"web-dev"</span>)</div>
        <div><span className="text-[hsl(192,91%,50%)]">result</span> = assistant.generate(</div>
        <div className="pl-4"><span className="text-[hsl(45,80%,55%)]">"Build a REST API with auth"</span></div>
        <div>)</div>
        <div />
        <div><span className="text-primary">print</span>(result.code)</div>
        <div className="text-muted-foreground"># → Express.js server with JWT auth</div>
        <div className="text-muted-foreground"># → MongoDB connection setup</div>
        <div className="text-muted-foreground"># → Protected route middleware</div>
      </div>
    </div>
    <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-card to-transparent w-full pointer-events-none" />
  </div>
);

/* ───── Skeleton Two: Domain Image Cards ───── */
const SkeletonTwo = () => {
  const images = [webDevImg, appDevImg, cybersecurityImg, dataScienceImg, cloudImg];

  const imageVariants = {
    whileHover: { scale: 1.1, rotate: 0, zIndex: 100 },
    whileTap: { scale: 1.1, rotate: 0, zIndex: 100 },
  };

  return (
    <div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
      <div className="flex flex-row -ml-20">
        {images.map((image, idx) => (
          <motion.div
            variants={imageVariants}
            key={"images-first" + idx}
            style={{ rotate: Math.random() * 20 - 10 }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-card border border-border shrink-0 overflow-hidden"
          >
            <img
              src={image}
              alt="domain"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row -ml-10">
        {images.map((image, idx) => (
          <motion.div
            variants={imageVariants}
            key={"images-second" + idx}
            style={{ rotate: Math.random() * 20 - 10 }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-card border border-border shrink-0 overflow-hidden"
          >
            <img
              src={image}
              alt="domain"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-card to-transparent h-full pointer-events-none" />
      <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-card to-transparent h-full pointer-events-none" />
    </div>
  );
};

/* ───── Skeleton Three: Video Preview ───── */
const SkeletonThree = () => (
  <div className="relative group/video h-full min-h-[200px] flex items-center justify-center">
    <div className="w-full mx-auto rounded-lg overflow-hidden relative shadow-lg border border-border">
      <video
        src={platformDemoVideo}
        className="w-full aspect-video object-cover"
        muted
        loop
        playsInline
        autoPlay
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/video:bg-black/10 transition-colors">
        <div className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
          <svg className="h-6 w-6 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

/* ───── Skeleton Four: Globe ───── */
const SkeletonFour = () => (
  <div className="h-60 md:h-60 flex flex-col items-center relative bg-transparent mt-10">
    <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
  </div>
);

const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.39, 0.4, 0.95],
      glowColor: [0.25, 0.25, 0.4],
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [28.6139, 77.209], size: 0.08 },
        { location: [51.5074, -0.1278], size: 0.05 },
        { location: [35.6762, 139.6503], size: 0.06 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => globe.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: "1" }}
      className={className}
    />
  );
};
