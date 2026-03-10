import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Crown, Zap, Rocket, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { domains } from "@/lib/domains";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    amountPaise: 0,
    icon: Zap,
    color: "from-muted to-muted/50",
    features: ["Full code editor access", "All domains unlocked", "AI code assistant", "Community support", "Unlimited projects"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 1,
    amountPaise: 100,
    icon: Star,
    color: "from-primary/20 to-primary/5",
    popular: true,
    features: ["Everything in Free", "Priority support", "Advanced AI features", "Custom themes"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 100,
    amountPaise: 10000,
    icon: Crown,
    color: "from-yellow-500/20 to-yellow-500/5",
    features: ["Everything in Pro", "1-on-1 mentorship sessions", "Project code reviews", "Career guidance", "Certificate of completion"],
  },
  {
    id: "professional",
    name: "Professional",
    price: 150,
    amountPaise: 15000,
    icon: Rocket,
    color: "from-purple-500/20 to-purple-500/5",
    features: ["Everything in Premium", "Unlimited mentorship", "Resume building & review", "Job referrals", "Custom learning path", "Priority booking"],
  },
];

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const selectedDomainId = searchParams.get("domain") || "web-development";
  const selectedDomain = domains.find((d) => d.id === selectedDomainId);
  const { user } = useAuth();
  const { getPlanForDomain, loading: subLoading } = useSubscription();
  const [payingPlan, setPayingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    if (plan.id === "free") return;

    setPayingPlan(plan.id);
    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { plan_id: plan.id, amount: plan.amountPaise, domain_id: selectedDomainId },
      });

      if (orderError || !orderData?.order_id) {
        throw new Error(orderError?.message || "Failed to create order");
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay");

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Lunor",
        description: `${plan.name} Plan - ${selectedDomain?.name || selectedDomainId}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: plan.id,
                amount: plan.amountPaise,
                domain_id: selectedDomainId,
              },
            });

            if (verifyError || !verifyData?.success) {
              throw new Error("Payment verification failed");
            }

            toast.success(`🎉 Subscribed to ${plan.name} plan!`);
            window.location.reload();
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        prefill: { email: user.email },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => setPayingPlan(null),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        toast.error("Payment failed: " + resp.error.description);
        setPayingPlan(null);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Something went wrong");
      setPayingPlan(null);
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
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
                <div className="mt-2 mb-6">
                  {p.id === "free" ? (
                    <span className="text-4xl font-bold text-foreground">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-foreground">₹{p.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
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
                    disabled={payingPlan === p.id || !user}
                    onClick={() => handleSubscribe(p)}
                  >
                    {payingPlan === p.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : !user ? (
                      "Sign in to subscribe"
                    ) : (
                      `Subscribe ₹${p.price}/mo`
                    )}
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
