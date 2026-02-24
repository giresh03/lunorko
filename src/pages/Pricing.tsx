import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Zap, Rocket, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    icon: Zap,
    color: "from-muted to-muted/50",
    features: ["Read-only code preview", "Basic domain access", "Community support", "Limited resources"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    amount: 4900,
    icon: Star,
    color: "from-primary/20 to-primary/5",
    popular: true,
    features: ["Full code editor access", "All domains unlocked", "AI code assistant", "Priority support", "Unlimited projects"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 99,
    amount: 9900,
    icon: Crown,
    color: "from-yellow-500/20 to-yellow-500/5",
    features: ["Everything in Pro", "1-on-1 mentorship sessions", "Project code reviews", "Career guidance", "Certificate of completion"],
  },
  {
    id: "professional",
    name: "Professional",
    price: 149,
    amount: 14900,
    icon: Rocket,
    color: "from-purple-500/20 to-purple-500/5",
    features: ["Everything in Premium", "Unlimited mentorship", "Resume building & review", "Job referrals", "Custom learning path", "Priority booking"],
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const { plan: currentPlan } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planId: string, amount: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setProcessingPlan(planId);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: "Error", description: "Failed to load payment gateway", variant: "destructive" });
        setProcessingPlan(null);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ plan_id: planId, amount }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Failed to create order");

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Lunor.AI",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - Monthly`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-razorpay-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: planId,
                amount,
              }),
            });

            const result = await verifyRes.json();
            if (result.success) {
              toast({ title: "🎉 Subscription Activated!", description: `Welcome to the ${planId} plan!` });
              setTimeout(() => window.location.reload(), 1500);
            } else {
              toast({ title: "Verification Failed", description: result.error, variant: "destructive" });
            }
          } catch {
            toast({ title: "Error", description: "Payment verification failed", variant: "destructive" });
          }
          setProcessingPlan(null);
        },
        modal: { ondismiss: () => setProcessingPlan(null) },
        prefill: { email: user.email },
        theme: { color: "#7c3aed" },
        config: {
          display: {
            blocks: {
              utib: { name: "Pay using UPI", instruments: [{ method: "upi", flows: ["qr", "collect", "intent"] }] },
              other: { name: "Other Methods", instruments: [{ method: "card" }, { method: "netbanking" }, { method: "wallet" }] },
            },
            sequence: ["block.utib", "block.other"],
            preferences: { show_default_blocks: false },
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
            Choose Your Learning Path
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of Lunor.AI's code editor, AI assistant, and mentorship with a plan that fits your goals.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {plans.map((p) => {
            const Icon = p.icon;
            const isCurrent = currentPlan === p.id;
            const isProcessing = processingPlan === p.id;

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
                  <span className="text-4xl font-bold text-foreground">₹{p.price}</span>
                  {p.price > 0 && <span className="text-muted-foreground">/month</span>}
                </div>

                <ul className="space-y-3 flex-1 mb-6">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : p.id === "free" ? (
                  <Button variant="outline" disabled className="w-full">
                    Free Forever
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={p.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(p.id, p.amount!)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      `Subscribe for ₹${p.price}/mo`
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
