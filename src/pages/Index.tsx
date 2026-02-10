import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen, Code2, Zap, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DomainCard from "@/components/DomainCard";
import { domains } from "@/lib/domains";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="relative z-10 mx-auto flex flex-col items-center px-6 py-32 text-center md:py-44 max-w-5xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">AI-Powered Learning for Engineers</span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-tight text-foreground md:text-7xl font-serif">
            Code Smarter with{" "}
            <span className="text-gradient">Lunor.AI</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Your AI-powered coding companion. Learn any engineering domain with personalized guidance, 
            intelligent code assistants, curated resources, and hands-on projects.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/domains">
                Explore Domains <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">Everything You Need to Excel</h2>
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
            <div key={i} className="flex gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Domains Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Explore Domains</h2>
            <p className="mt-2 text-muted-foreground">Dive into any engineering discipline</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/domains">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {domains.slice(0, 8).map((d) => (
            <DomainCard key={d.id} domain={d} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-lg border border-primary/20 gradient-hero p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">Ready to Level Up?</h2>
          <p className="mt-3 text-muted-foreground">Start learning with AI-powered assistance across 12+ domains</p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/domains">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
