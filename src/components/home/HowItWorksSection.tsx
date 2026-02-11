import { Search, Route, Code2, Rocket } from "lucide-react";
import howItWorksImg from "@/assets/sections/how-it-works.jpg";

const steps = [
  {
    icon: Search,
    title: "Choose Your Domain",
    desc: "Pick from 12+ engineering domains — Web Dev, AI/ML, Cybersecurity, Cloud, and more.",
  },
  {
    icon: Route,
    title: "Follow the Roadmap",
    desc: "Get a structured, step-by-step learning path with curated videos, articles, and projects.",
  },
  {
    icon: Code2,
    title: "Code with AI",
    desc: "Use our AI code assistant to write, debug, and understand code in your chosen domain.",
  },
  {
    icon: Rocket,
    title: "Build & Get Hired",
    desc: "Complete hands-on projects, get mentor feedback, and land your dream tech role.",
  },
];

const HowItWorksSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <div className="mb-16 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
        <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
          Simple Process
        </span>
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          How It <span className="text-primary">Works</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          From zero to job-ready in four simple steps
        </p>
      </div>

      {/* Background image banner */}
      <div className="scroll-reveal opacity-0 scale-95 transition-all duration-700 ease-out mb-16 overflow-hidden rounded-xl">
        <img
          src={howItWorksImg}
          alt="Learning pathway from beginner to expert"
          className="w-full h-48 md:h-64 object-cover"
          loading="lazy"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out"
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <div className="group relative rounded-lg border border-border bg-card p-6 text-center transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg">
              {/* Step number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                {i + 1}
              </div>
              <div className="mx-auto mb-4 mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
