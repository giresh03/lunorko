import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import GradientText from "@/components/hero/GradientText";
import { Globe3D, GlobeMarker } from "@/components/ui/3d-globe";

const sampleMarkers: GlobeMarker[] = [
  { lat: 40.7128, lng: -74.006, src: "https://assets.aceternity.com/avatars/1.webp", label: "New York" },
  { lat: 51.5074, lng: -0.1278, src: "https://assets.aceternity.com/avatars/2.webp", label: "London" },
  { lat: 35.6762, lng: 139.6503, src: "https://assets.aceternity.com/avatars/3.webp", label: "Tokyo" },
  { lat: -33.8688, lng: 151.2093, src: "https://assets.aceternity.com/avatars/4.webp", label: "Sydney" },
  { lat: 48.8566, lng: 2.3522, src: "https://assets.aceternity.com/avatars/5.webp", label: "Paris" },
  { lat: 28.6139, lng: 77.209, src: "https://assets.aceternity.com/avatars/6.webp", label: "New Delhi" },
  { lat: 55.7558, lng: 37.6173, src: "https://assets.aceternity.com/avatars/7.webp", label: "Moscow" },
  { lat: -22.9068, lng: -43.1729, src: "https://assets.aceternity.com/avatars/8.webp", label: "Rio de Janeiro" },
  { lat: 31.2304, lng: 121.4737, src: "https://assets.aceternity.com/avatars/9.webp", label: "Shanghai" },
  { lat: 25.2048, lng: 55.2708, src: "https://assets.aceternity.com/avatars/10.webp", label: "Dubai" },
  { lat: -34.6037, lng: -58.3816, src: "https://assets.aceternity.com/avatars/11.webp", label: "Buenos Aires" },
  { lat: 1.3521, lng: 103.8198, src: "https://assets.aceternity.com/avatars/12.webp", label: "Singapore" },
  { lat: 37.5665, lng: 126.978, src: "https://assets.aceternity.com/avatars/13.webp", label: "Seoul" },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const opacityFade = Math.max(0, 1 - scrollY / 800);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-screen flex items-center"
    >
      {/* Dark background for globe visibility */}
      <div className="absolute inset-0 bg-[#030712] z-0" />

      {/* Ambient glow spots */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ opacity: opacityFade }}
      >
        <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-[hsl(239,84%,67%/0.08)] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] bg-[hsl(192,91%,36%/0.06)] rounded-full blur-[120px]" />
      </div>

      {/* Content + Globe layout */}
      <div
        className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 items-center gap-8 py-20 md:py-28"
        style={{ opacity: opacityFade }}
      >
        {/* Left: Text content */}
        <div className="flex flex-col items-start text-left max-w-xl">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[hsl(239,84%,67%/0.25)] bg-[hsl(239,84%,67%/0.06)] px-5 py-2 backdrop-blur-2xl animate-hero-badge">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(239,84%,67%)] animate-pulse" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[hsl(239,84%,67%)]">
              Next-Gen AI Learning Ecosystem
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-hero-title font-serif select-none">
            <span className="block text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] tracking-tight">
              Code Smarter with
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mt-2 leading-[1.08]">
              <GradientText>Lunor.AI</GradientText>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-8 max-w-lg text-base md:text-lg text-[#94a3b8] leading-relaxed animate-hero-subtitle">
            Your AI-powered coding companion. Master any engineering domain with personalized guidance,
            intelligent code assistants, curated resources, and hands-on projects.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-wrap items-center gap-4 animate-hero-cta">
            <Button size="lg" className="text-base px-8 py-6" asChild>
              <Link to="/domains">
                Explore Domains <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="!bg-white/5 !border-white/10 !text-white hover:!bg-white/10 hover:!border-white/20 text-base px-8 py-6 backdrop-blur-xl"
              asChild
            >
              <Link to="/about">Learn More</Link>
            </Button>
          </div>

          {/* Stats strip */}
          <div className="mt-14 flex items-center gap-8 md:gap-10 animate-hero-cta">
            {[
              { value: "12+", label: "Domains" },
              { value: "50K+", label: "Students" },
              { value: "AI", label: "Powered" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-xl md:text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-[10px] text-[#64748b] uppercase tracking-widest mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 3D Globe */}
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] animate-hero-title">
          <Globe3D
            markers={sampleMarkers}
            config={{
              radius: 2,
              showAtmosphere: true,
              atmosphereColor: "#6366f1",
              atmosphereIntensity: 0.6,
              atmosphereBlur: 3,
              autoRotateSpeed: 0.4,
              enableZoom: false,
              enablePan: false,
              showWireframe: true,
              wireframeColor: "#6366f1",
              markerSize: 0.055,
              bumpScale: 0.8,
            }}
            onMarkerClick={(marker) => console.log("Clicked:", marker.label)}
            onMarkerHover={(marker) => marker && console.log("Hover:", marker.label)}
          />

          {/* Glow behind globe */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[hsl(239,84%,67%/0.06)] rounded-full blur-[100px] pointer-events-none" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
      >
        <span className="text-[10px] text-[#475569] uppercase tracking-[0.3em]">Scroll</span>
        <div className="h-9 w-5 rounded-full border-2 border-white/10 flex items-start justify-center p-1.5">
          <div className="h-2 w-1 rounded-full bg-[hsl(239,84%,67%/0.6)] animate-scroll-dot" />
        </div>
      </div>
    </section>
  );
}
