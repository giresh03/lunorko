import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import GradientText from "@/components/hero/GradientText";
import { Globe3D, GlobeMarker } from "@/components/ui/3d-globe";

import webDevImg from "@/assets/domains/web-development.jpg";
import appDevImg from "@/assets/domains/app-development.jpg";
import cybersecurityImg from "@/assets/domains/cybersecurity.jpg";
import dataScienceImg from "@/assets/domains/data-science.jpg";
import cloudImg from "@/assets/domains/cloud-computing.jpg";
import devopsImg from "@/assets/domains/devops.jpg";
import databaseImg from "@/assets/domains/database.jpg";
import iotImg from "@/assets/domains/iot.jpg";
import blockchainImg from "@/assets/domains/blockchain.jpg";
import uiuxImg from "@/assets/domains/ui-ux.jpg";
import dsaImg from "@/assets/domains/dsa.jpg";
import systemDesignImg from "@/assets/domains/system-design.jpg";
import vlsiImg from "@/assets/domains/vlsi.jpg";
import powerSystemsImg from "@/assets/domains/power-systems.jpg";
import signalProcessingImg from "@/assets/domains/signal-processing.jpg";
import roboticsImg from "@/assets/domains/robotics.jpg";

const domainMarkers: GlobeMarker[] = [
  { lat: 40.71, lng: -74.0, src: webDevImg, label: "Web Development" },
  { lat: 51.51, lng: -0.13, src: appDevImg, label: "App Development" },
  { lat: 35.68, lng: 139.65, src: cybersecurityImg, label: "Cybersecurity" },
  { lat: -33.87, lng: 151.21, src: dataScienceImg, label: "Data Science & ML" },
  { lat: 48.86, lng: 2.35, src: cloudImg, label: "Cloud Computing" },
  { lat: 28.61, lng: 77.21, src: devopsImg, label: "DevOps" },
  { lat: 55.76, lng: 37.62, src: databaseImg, label: "Database Engineering" },
  { lat: -22.91, lng: -43.17, src: iotImg, label: "IoT & Embedded" },
  { lat: 31.23, lng: 121.47, src: blockchainImg, label: "Blockchain" },
  { lat: 25.2, lng: 55.27, src: uiuxImg, label: "UI/UX Design" },
  { lat: -34.6, lng: -58.38, src: dsaImg, label: "DSA" },
  { lat: 1.35, lng: 103.82, src: systemDesignImg, label: "System Design" },
  { lat: 13.08, lng: 80.27, src: vlsiImg, label: "VLSI Design" },
  { lat: 52.52, lng: 13.41, src: powerSystemsImg, label: "Power Systems" },
  { lat: 37.57, lng: 126.98, src: signalProcessingImg, label: "Signals & Systems" },
  { lat: 39.9, lng: 116.4, src: roboticsImg, label: "Robotics & Automation" },
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
      {/* Dark background */}
      <div className="absolute inset-0 bg-[#0a0a0a] z-0" />

      {/* Ambient glow spots */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ opacity: opacityFade }}
      >
        <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-[hsl(0,84%,55%/0.08)] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] bg-[hsl(14,92%,58%/0.06)] rounded-full blur-[120px]" />
      </div>

      {/* Content + Globe */}
      <div
        className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 items-center gap-8 py-20 md:py-28"
        style={{ opacity: opacityFade }}
      >
        {/* Left: Text */}
        <div className="flex flex-col items-start text-left max-w-xl">
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[hsl(0,84%,55%/0.25)] bg-[hsl(0,84%,55%/0.06)] px-5 py-2 backdrop-blur-2xl animate-hero-badge">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(0,84%,55%)] animate-pulse" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[hsl(0,84%,55%)]">
              Next-Gen AI Learning Ecosystem
            </span>
          </div>

          <h1 className="animate-hero-title font-serif select-none">
            <span className="block text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] tracking-tight">
              Code Smarter with
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mt-2 leading-[1.08]">
              <GradientText>Lunor.AI</GradientText>
            </span>
          </h1>

          <p className="mt-8 max-w-lg text-base md:text-lg text-[#94a3b8] leading-relaxed animate-hero-subtitle">
            Your AI-powered coding companion. Master any engineering domain with personalized guidance,
            intelligent code assistants, curated resources, and hands-on projects.
          </p>

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

          <div className="mt-14 flex items-center gap-8 md:gap-10 animate-hero-cta">
            {[
              { value: "16+", label: "Domains" },
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

        {/* Right: 3D Globe with domain markers */}
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] animate-hero-title">
          <Globe3D
            markers={domainMarkers}
            config={{
              radius: 2,
              showAtmosphere: true,
              atmosphereColor: "#ef4444",
              atmosphereIntensity: 0.6,
              atmosphereBlur: 3,
              autoRotateSpeed: 0.4,
              enableZoom: false,
              enablePan: false,
              showWireframe: true,
              wireframeColor: "#ef4444",
              markerSize: 0.055,
              bumpScale: 0.8,
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[hsl(0,84%,55%/0.06)] rounded-full blur-[100px] pointer-events-none" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
      >
        <span className="text-[10px] text-[#475569] uppercase tracking-[0.3em]">Scroll</span>
        <div className="h-9 w-5 rounded-full border-2 border-white/10 flex items-start justify-center p-1.5">
          <div className="h-2 w-1 rounded-full bg-[hsl(0,84%,55%/0.6)] animate-scroll-dot" />
        </div>
      </div>
    </section>
  );
}
