import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, X, Crown, Zap, Rocket, Star, Loader2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { domains } from "@/lib/domains";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const allFeatures = [
  "Credits / month",
  "Domain Access",
  "Videos",
  "Code Editor",
  "Notes",
  "Community",
  "Projects",
  "Skill Radar",
  "Resume Builder",
  "Interview Prep",
  "Hackathons",
];

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    amountPaise: 0,
    icon: Zap,
    credits: 4,
    color: "from-muted to-muted/50",
    access: {
      "Credits / month": "4",
      "Domain Access": false,
      "Videos": false,
      "Code Editor": false,
      "Notes": false,
      "Community": false,
      "Projects": false,
      "Skill Radar": false,
      "Resume Builder": false,
      "Interview Prep": false,
      "Hackathons": false,
    } as Record<string, string | boolean>,
  },
  {
    id: "pro",
    name: "Pro",
    price: 50,
    amountPaise: 5000,
    icon: Star,
    credits: 60,
    color: "from-primary/20 to-primary/5",
    popular: true,
    access: {
      "Credits / month": "60",
      "Domain Access": true,
      "Videos": true,
      "Code Editor": true,
      "Notes": true,
      "Community": true,
      "Projects": false,
      "Skill Radar": false,
      "Resume Builder": false,
      "Interview Prep": false,
      "Hackathons": false,
    } as Record<string, string | boolean>,
  },
  {
    id: "premium",
    name: "Premium",
    price: 100,
    amountPaise: 10000,
    icon: Crown,
    credits: 100,
    color: "from-yellow-500/20 to-yellow-500/5",
    access: {
      "Credits / month": "100",
      "Domain Access": true,
      "Videos": true,
      "Code Editor": true,
      "Notes": true,
      "Community": true,
      "Projects": true,
      "Skill Radar": true,
      "Resume Builder": false,
      "Interview Prep": false,
      "Hackathons": false,
    } as Record<string, string | boolean>,
  },
  {
    id: "professional",
    name: "Professional",
    price: 150,
    amountPaise: 15000,
    icon: Rocket,
    credits: 150,
    color: "from-purple-500/20 to-purple-500/5",
    access: {
      "Credits / month": "150",
      "Domain Access": true,
      "Videos": true,
      "Code Editor": true,
      "Notes": true,
      "Community": true,
      "Projects": true,
      "Skill Radar": true,
      "Resume Builder": true,
      "Interview Prep": true,
      "Hackathons": true,
    } as Record<string, string | boolean>,
  },
];

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const selectedDomainId = searchParams.get("domain") || "web-development";
  const selectedDomain = domains.find((d) => d.id === selectedDomainId);
  const { user } = useAuth();
  const { getPlanForDomain, loading: subLoading } = useSubscription();

  const [payDialog, setPayDialog] = useState<typeof plans[0] | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = (plan: typeof plans[0]) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    if (plan.id === "free") return;
    setPayDialog(plan);
    setUtrNumber("");
  };

  const handleSubmitUTR = async () => {
    if (!payDialog || !user) return;
    if (!utrNumber.trim()) {
      toast.error("Please enter the UTR number");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("payment_requests" as any).insert({
        user_id: user.id,
        plan_id: payDialog.id,
        domain_id: selectedDomainId,
        amount: payDialog.amountPaise,
        utr_number: utrNumber.trim(),
      } as any);

      if (error) throw error;
      toast.success("Payment request submitted! You'll get access once the admin verifies your payment.");
      setPayDialog(null);
      setUtrNumber("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit payment request");
    } finally {
      setSubmitting(false);
    }
  };

  const currentPlan = user ? getPlanForDomain(selectedDomainId) : "free";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock premium features to accelerate your learning journey.
            {selectedDomain && ` Selected domain: ${selectedDomain.name}.`}
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-16">
          {plans.map((p) => {
            const Icon = p.icon;
            const isCurrentPlan = currentPlan === p.id;
            const planRank = ["free", "pro", "premium", "professional"];
            const isDowngrade = planRank.indexOf(p.id) < planRank.indexOf(currentPlan);

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
                <div className="mt-2 mb-3">
                  {p.id === "free" ? (
                    <span className="text-4xl font-bold text-foreground">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-foreground">₹{p.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </>
                  )}
                </div>

                {/* Credits highlight */}
                <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-accent/50">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{p.credits} credits/month</span>
                </div>

                {/* Key features */}
                <ul className="space-y-2 flex-1 mb-6">
                  {Object.entries(p.access).filter(([k]) => k !== "Credits / month").map(([feature, has]) => (
                    <li key={feature} className={`flex items-center gap-2 text-sm ${has ? "text-foreground" : "text-muted-foreground/50 line-through"}`}>
                      {has ? (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button variant="outline" disabled className="w-full">
                    Current Plan ✓
                  </Button>
                ) : p.id === "free" || isDowngrade ? (
                  <Button variant="outline" disabled className="w-full">
                    {p.id === "free" ? "Free Forever" : "Current plan is higher"}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={p.popular ? "default" : "outline"}
                    disabled={!user}
                    onClick={() => handleSubscribe(p)}
                  >
                    {!user ? "Sign in to subscribe" : `Subscribe ₹${p.price}/mo`}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                  {plans.map((p) => (
                    <th key={p.id} className="p-4 text-center font-semibold text-foreground">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((feature, i) => (
                  <tr key={feature} className={i % 2 === 0 ? "bg-card" : "bg-muted/10"}>
                    <td className="p-4 font-medium text-foreground">{feature}</td>
                    {plans.map((p) => {
                      const val = p.access[feature];
                      return (
                        <td key={p.id} className="p-4 text-center">
                          {typeof val === "string" ? (
                            <span className="font-semibold text-primary">{val}</span>
                          ) : val ? (
                            <Check className="h-4 w-4 text-primary mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* UPI Payment Dialog */}
      <Dialog open={!!payDialog} onOpenChange={(open) => !open && setPayDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Pay ₹{payDialog?.price} for {payDialog?.name} Plan
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Scan the QR code below using any UPI app (PhonePe, GPay, Paytm, etc.)
            </p>

            <div className="rounded-xl border border-border p-2 bg-white">
              <img
                src="/images/upi-qr.jpeg"
                alt="UPI QR Code"
                className="w-64 h-auto rounded-lg"
              />
            </div>

            <div className="w-full space-y-3 mt-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Enter UTR / Transaction ID after payment
                </label>
                <Input
                  placeholder="e.g. 412345678901"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your access will be activated once the admin verifies your payment.
              </p>
              <Button
                className="w-full"
                disabled={submitting || !utrNumber.trim()}
                onClick={handleSubmitUTR}
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  "Submit Payment"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Pricing;
