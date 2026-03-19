import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const freeTier = [
  "Access to all 12+ domain roadmaps",
  "AI Code Assistant (limited queries/day)",
  "Curated YouTube & article resources",
  "Community access & discussions",
  "Basic project templates",
];

const proTier = [
  "Everything in Free, plus:",
  "Unlimited AI Code Assistant",
  "1:1 Mentor booking sessions",
  "Priority support & feedback",
  "Certificate of completion",
  "Resume & interview preparation",
];

const PricingPreviewSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
        <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
          Pricing
        </span>
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Start Free, <span className="text-primary">Upgrade When Ready</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          We believe great education should be accessible. Start with our powerful free tier — no credit card required.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <div className="h-full rounded-lg border border-border bg-card p-8">
            <h3 className="text-lg font-semibold text-foreground">Free Forever</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">₹0</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Perfect for getting started</p>
            <ul className="mt-6 space-y-3">
              {freeTier.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" size="lg" className="mt-8 w-full hover-scale" asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        </div>

        {/* Pro */}
        <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 delay-150 ease-out">
          <div className="relative h-full rounded-lg border-2 border-primary/40 bg-card p-8">
            <div className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
              <Sparkles className="h-3 w-3" /> Most Popular
            </div>
            <h3 className="text-lg font-semibold text-foreground">Pro</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">₹9</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">For serious learners & job seekers</p>
            <ul className="mt-6 space-y-3">
              {proTier.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {p}
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-8 w-full hover-scale" asChild>
              <Link to="/auth">
                Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default PricingPreviewSection;
