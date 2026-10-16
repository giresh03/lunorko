import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import whyLunorImg from "@/assets/sections/why-lunor.jpg";

const problems = [
  "Scattered YouTube tutorials with no clear path",
  "Expensive bootcamps costing ₹50,000–₹2,00,000",
  "No personalized AI help when you're stuck",
  "Outdated college syllabus that doesn't match industry",
  "No mentor guidance or real-world project exposure",
];

const solutions = [
  "Curated, structured roadmaps for 4 domains",
  "Free tier with AI-powered learning tools",
  "Real-time AI code assistant that understands your domain",
  "Industry-aligned curriculum updated regularly",
  "1:1 mentorship from top company professionals",
];

const WhyLunorSection = () => (
  <section className="relative overflow-hidden py-24">
    {/* Background image with overlay */}
    <div className="absolute inset-0 z-0">
      <img src={whyLunorImg} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
    </div>

    <div className="container relative z-10 mx-auto px-4">
      <div className="mb-12 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
        <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
          The Problem We Solve
        </span>
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Why Engineering Students <span className="text-primary">Need Lunor.AI</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Traditional learning is broken. Students waste months on unstructured resources,
          pay lakhs for bootcamps, and still aren't job-ready. We fix that.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Without Lunor */}
        <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <XCircle className="h-5 w-5 text-destructive" />
              Without Lunor.AI
            </h3>
            <ul className="space-y-3">
              {problems.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive/60" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* With Lunor */}
        <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 delay-150 ease-out">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              With Lunor.AI
            </h3>
            <ul className="space-y-3">
              {solutions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 delay-300 ease-out">
        <Button size="lg" className="hover-scale" asChild>
          <Link to="/domains">
            Start Learning Free <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

export default WhyLunorSection;
