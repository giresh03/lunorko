import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, X, Crown, Zap, Rocket, Star, Loader2, Coins, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FESTIVAL_COUPON, getPurchasePrice, normalizeCoupon } from "../../supabase/functions/_shared/subscriptionPricing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { domains } from "@/lib/domains";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useCredits } from "@/hooks/useCredits";
import { CreditTracker } from "@/components/CreditTracker";
import { CreditHistoryPanel } from "@/components/CreditHistoryPanel";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name: string;
      description: string;
      handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
    }) => void;
  }
}

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
    credits: 100,
    color: "from-muted to-muted/50",
    access: {
      "Credits / month": "100",
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
    price: 150,
    amountPaise: 15000,
    icon: Star,
    credits: 1500,
    color: "from-primary/20 to-primary/5",
    popular: true,
    access: {
      "Credits / month": "1,500",
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
    price: 250,
    amountPaise: 25000,
    icon: Crown,
    credits: 4000,
    color: "from-yellow-500/20 to-yellow-500/5",
    access: {
      "Credits / month": "4,000",
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
    price: 500,
    amountPaise: 50000,
    icon: Rocket,
    credits: 10000,
    color: "from-primary/20 to-primary/5",
    access: {
      "Credits / month": "10,000",
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
  const { getPlanForDomain, refetch } = useSubscription();
  const { credits, refetch: refetchCredits } = useCredits();
  const [submitting, setSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");

  const loadRazorpayScript = (): Promise<void> =>
    new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });

  const handleSubscribe = useCallback(
    async (plan: { id: string; name: string; amountPaise: number }) => {
      if (!user) {
        toast.error("Please sign in first");
        return;
      }
      if (plan.id === "free") return;

      setSubmitting(true);
      try {
        const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
          body: { plan_id: plan.id, domain_id: selectedDomainId, coupon_code: plan.id === "topup" ? undefined : appliedCoupon },
        });

        if (orderError) throw orderError;
        const { order_id, key_id, amount, currency } = orderData as { order_id: string; key_id: string; amount: number; currency: string };
        if (!order_id || !key_id || !Number.isSafeInteger(amount) || amount <= 0 || currency !== "INR") throw new Error("Invalid order response");

        await loadRazorpayScript();

        const rzp = new (window as any).Razorpay({
          key: key_id,
          amount,
          currency,
          order_id,
          name: "Lunor.AI",
          description: `${plan.name} Plan - ${selectedDomain?.name || "All domains"}`,
          prefill: { email: user.email || undefined },
          modal: { ondismiss: () => setSubmitting(false) },
          handler: async (res: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
                body: {
                  razorpay_payment_id: res.razorpay_payment_id,
                  razorpay_order_id: res.razorpay_order_id,
                  razorpay_signature: res.razorpay_signature,
                },
              });
              if (verifyError) throw verifyError;
              toast.success(
                plan.id === "topup"
                  ? "Top-up successful! 200 credits added."
                  : "Payment successful! Your subscription is now active."
              );
              refetch();
              refetchCredits();
            } catch (err: any) {
              console.error(err);
              toast.error(err.message || "Payment verification failed");
            } finally {
              setSubmitting(false);
            }
          },
        });

        rzp.on("payment.failed", () => {
          toast.error("Payment failed or was cancelled");
          setSubmitting(false);
        });

        rzp.open();
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to start payment");
        setSubmitting(false);
      }
    },
    [user, selectedDomainId, selectedDomain, refetch, refetchCredits, appliedCoupon]
  );

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

        <form
          className="max-w-xl mx-auto mb-12"
          onSubmit={(event) => {
            event.preventDefault();
            try {
              const code = normalizeCoupon(couponInput);
              if (code !== FESTIVAL_COUPON) throw new Error("Invalid coupon code");
              getPurchasePrice("pro", code);
              setAppliedCoupon(code);
              setCouponInput(code);
              setCouponError("");
            } catch {
              setCouponError("Invalid coupon code. Please check and try again.");
            }
          }}
        >
          <Label htmlFor="festival-coupon">Coupon code</Label>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Input id="festival-coupon" value={couponInput} maxLength={64} disabled={submitting || Boolean(appliedCoupon)}
              onChange={(event) => { setCouponInput(event.target.value); setCouponError(""); }}
              placeholder="Enter coupon code" autoComplete="off" aria-invalid={Boolean(couponError)} aria-describedby="coupon-status" />
            {appliedCoupon ? (
              <Button type="button" variant="outline" disabled={submitting} onClick={() => { setAppliedCoupon(""); setCouponInput(""); setCouponError(""); }}>Remove coupon</Button>
            ) : (
              <Button type="submit" disabled={submitting || !couponInput.trim()}>Apply coupon</Button>
            )}
          </div>
          <p id="coupon-status" role="status" className={`text-sm mt-2 min-h-5 ${couponError ? "text-destructive" : "text-primary"}`}>
            {couponError || (appliedCoupon ? `${appliedCoupon} applied — Dushera festival prices unlocked.` : "")}
          </p>
        </form>

        {/* Plan cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-16">
          {plans.map((p) => {
            const Icon = p.icon;
            const displayPrice = p.id === "free" ? 0 : getPurchasePrice(p.id, appliedCoupon).amount / 100;
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
                      {appliedCoupon && <span className="block text-sm text-muted-foreground line-through mb-1">₹{p.price}/month</span>}
                      <span className="text-4xl font-bold text-foreground">₹{displayPrice}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </>
                  )}
                </div>

                {/* Credits highlight */}
                <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-accent/50">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{p.credits.toLocaleString()} credits/month</span>
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
                    disabled={!user || submitting}
                    onClick={() => handleSubscribe(p)}
                  >
                    {submitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : !user ? (
                      "Sign in to subscribe"
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Subscribe ₹{displayPrice}/mo
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Credit top-up */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="rounded-2xl border border-primary/30 bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground">Need more credits?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Top up any time — <span className="text-primary font-semibold">₹50 for 200 credits</span>. Top-up credits never
                expire and are used after your monthly plan credits run out.
              </p>
              <CreditTracker className="mt-4" />
              <CreditHistoryPanel className="mt-4" />

            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={!user || submitting}
              onClick={() => handleSubscribe({ id: "topup", name: "Credit Top-up", amountPaise: 5000 })}
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : !user ? (
                "Sign in to top up"
              ) : (
                <><Coins className="mr-2 h-4 w-4" /> Buy 200 credits ₹50</>
              )}
            </Button>
          </div>
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

      <Footer />
    </div>
  );
};

export default Pricing;
