import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen, Code2, Zap, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal, scrollRevealStyle } from "@/hooks/useScrollReveal";
import { ParallaxLayer } from "@/hooks/useParallax";
import DomainParallaxSection from "@/components/home/DomainParallaxSection";
import WhyLunorSection from "@/components/home/WhyLunorSection";
import Domains3DSection from "@/components/home/Domains3DSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AIPowerSection from "@/components/home/AIPowerSection";
import PricingPreviewSection from "@/components/home/PricingPreviewSection";
import ComparisonSection from "@/components/home/ComparisonSection";
import VideoSection from "@/components/home/VideoSection";
import FAQSection from "@/components/home/FAQSection";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";

const Index = () => {
  const pageRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" ref={pageRef}>
      <Navbar />

      {/* Hero – no parallax (has its own scroll-driven opacity) */}
      <HeroSection />

      {/* Domain Parallax Showcase */}
      <DomainParallaxSection />

      {/* Features */}
      <ParallaxLayer speed={0.04}>
        <section className="container mx-auto px-4 py-20">
          <div className="mb-12 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
            <TypewriterEffectSmooth
              words={[
                { text: "Everything" },
                { text: "You" },
                { text: "Need" },
                { text: "to" },
                { text: "Excel", className: "text-primary dark:text-primary" },
              ]}
              className="font-serif justify-center text-foreground"
            />
            <p className="mt-2 text-muted-foreground">Built for engineering students who want to go beyond the classroom</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Code2, title: "AI Code Assistant", desc: "Domain-specific AI that generates, debugs, and explains code in real-time." },
              { icon: BookOpen, title: "Curated Learning", desc: "Handpicked YouTube videos, Udemy courses, and reading materials for each domain." },
              { icon: Zap, title: "Guided Roadmaps", desc: "Step-by-step learning paths designed by industry professionals." },
              { icon: Shield, title: "12+ Domains", desc: "Web Dev, App Dev, Cybersecurity, ML, Cloud, DevOps, and many more." },
              { icon: Users, title: "Community Driven", desc: "Learn alongside thousands of students and share your projects." },
              { icon: Sparkles, title: "AI Debugging", desc: "Paste your code, get instant fixes and explanations from AI." },
            ].map((f, i) => (
              <div
                key={i}
                className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-4 rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ParallaxLayer>

      {/* 3D Domains Showcase */}
      <ParallaxLayer speed={0.06}>
        <Domains3DSection />
      </ParallaxLayer>

      {/* Why Lunor */}
      <ParallaxLayer speed={0.05}>
        <WhyLunorSection />
      </ParallaxLayer>

      {/* Features Section */}
      <ParallaxLayer speed={0.03}>
        <FeaturesSection />
      </ParallaxLayer>

      {/* Stats */}
      <ParallaxLayer speed={0.02}>
        <StatsSection />
      </ParallaxLayer>

      {/* AI Power */}
      <ParallaxLayer speed={0.06}>
        <AIPowerSection />
      </ParallaxLayer>

      {/* Comparison */}
      <ParallaxLayer speed={0.03}>
        <ComparisonSection />
      </ParallaxLayer>

      {/* Testimonials */}
      <ParallaxLayer speed={0.05}>
        <TestimonialsSection />
      </ParallaxLayer>

      {/* Pricing */}
      <ParallaxLayer speed={0.04}>
        <PricingPreviewSection />
      </ParallaxLayer>

      {/* FAQ */}
      <ParallaxLayer speed={0.03}>
        <FAQSection />
      </ParallaxLayer>

      {/* CTA */}
      <ParallaxLayer speed={0.05}>
        <section className="container mx-auto px-4 py-20">
          <div className="scroll-reveal opacity-0 scale-95 transition-all duration-700 ease-out">
            <div className="relative overflow-hidden rounded-lg border border-primary/20 gradient-hero p-12 text-center">
              <TypewriterEffectSmooth
                words={[
                  { text: "Ready" },
                  { text: "to" },
                  { text: "Level" },
                  { text: "Up?", className: "text-primary dark:text-primary" },
                ]}
                className="font-serif justify-center text-foreground"
              />
              <p className="mt-3 text-muted-foreground">Start learning with AI-powered assistance across 12+ domains</p>
              <Button size="lg" className="mt-6 hover-scale" asChild>
                <Link to="/domains">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </ParallaxLayer>

      <Footer />

      <style>{`
        ${scrollRevealStyle}
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift { animation: gradient-shift 4s ease infinite; }
        @keyframes hero-badge {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-hero-badge { animation: hero-badge 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
        @keyframes hero-title {
          0% { opacity: 0; transform: translateY(30px); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-hero-title { animation: hero-title 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
        @keyframes hero-subtitle {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-hero-subtitle { animation: hero-subtitle 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both; }
        @keyframes hero-cta {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-hero-cta { animation: hero-cta 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both; }
        @keyframes scroll-dot {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        .animate-scroll-dot { animation: scroll-dot 2s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
      `}</style>
    </div>
  );
};

export default Index;
