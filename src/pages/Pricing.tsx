import { useSearchParams } from "react-router-dom";
import { Check, Crown, Zap, Rocket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { domains } from "@/lib/domains";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    icon: Zap,
    color: "from-muted to-muted/50",
    features: ["Full code editor access", "All domains unlocked", "AI code assistant", "Community support", "Unlimited projects"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    icon: Star,
    color: "from-primary/20 to-primary/5",
    popular: true,
    comingSoon: true,
    features: ["Everything in Free", "Priority support", "Advanced AI features", "Custom themes"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 99,
    icon: Crown,
    color: "from-yellow-500/20 to-yellow-500/5",
    comingSoon: true,
    features: ["Everything in Pro", "1-on-1 mentorship sessions", "Project code reviews", "Career guidance", "Certificate of completion"],
  },
  {
    id: "professional",
    name: "Professional",
    price: 149,
    icon: Rocket,
    color: "from-purple-500/20 to-purple-500/5",
    comingSoon: true,
    features: ["Everything in Premium", "Unlimited mentorship", "Resume building & review", "Job referrals", "Custom learning path", "Priority booking"],
  },
];

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const selectedDomainId = searchParams.get("domain");
  const selectedDomain = domains.find((d) => d.id === selectedDomainId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
            Everything is Free — For Now!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All features are currently unlocked for free. Paid plans coming soon.
            {selectedDomain && ` You were looking at ${selectedDomain.name}.`}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {plans.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl border bg-card p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl ${
                  p.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-md">Most Popular</Badge>
                  </div>
                )}

                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-foreground" />
                </div>

                <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                <div className="mt-2 mb-6">
                  {p.id === "free" ? (
                    <span className="text-4xl font-bold text-foreground">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-foreground line-through opacity-50">₹{p.price}</span>
                      <span className="ml-2 text-sm text-primary font-semibold">Coming Soon</span>
                    </>
                  )}
                </div>

                <ul className="space-y-3 flex-1 mb-6">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {p.comingSoon ? (
                  <Button variant="outline" disabled className="w-full">
                    Coming Soon
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    Current Plan ✓
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
