import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, CreditCard, Globe2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GERMANY_PROGRAM_AMOUNT, GERMANY_PROGRAM_ID } from "../../supabase/functions/_shared/subscriptionPricing";
import { germanyProgram } from "@/content/germanyProgram";

type PaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type Checkout = { open: () => void; on: (event: string, handler: () => void) => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => Checkout;

async function loadCheckout(): Promise<RazorpayConstructor> {
  const getCheckout = () => (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
  const existing = getCheckout();
  if (existing) return existing;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); reject(new Error("Could not load Razorpay. Please try again.")); };
    document.body.appendChild(script);
  });
  const checkout = getCheckout();
  if (!checkout) throw new Error("Razorpay is unavailable. Please try again.");
  return checkout;
}

export default function GermanyProgram({ checkoutSection = false }: { checkoutSection?: boolean }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PaymentResponse | null>(null);
  const [paymentReference, setPaymentReference] = useState("");

  const refreshPurchase = useCallback(async () => {
    if (!user) { setPurchased(false); return; }
    setChecking(true);
    const { data, error } = await supabase.from("internship_program_purchases")
      .select("razorpay_payment_id").eq("user_id", user.id).eq("program_id", GERMANY_PROGRAM_ID).limit(1);
    setLoadError(Boolean(error));
    setPurchased(Boolean(data?.length));
    setPaymentReference(data?.[0]?.razorpay_payment_id ?? "");
    setChecking(false);
  }, [user]);

  useEffect(() => { void refreshPurchase(); }, [refreshPurchase]);

  const verifyPayment = async (response: PaymentResponse) => {
    setBusy(true);
    setPendingPayment(response);
    try {
      const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", { body: response });
      if (error || !data?.success || data.program_id !== GERMANY_PROGRAM_ID) {
        throw new Error(data?.error || "Payment confirmation is pending. Retry verification; do not pay again.");
      }
      await refreshPurchase();
      setPendingPayment(null);
      toast({ title: "Program payment confirmed", description: "Your Germany program purchase has been saved." });
    } catch (error) {
      toast({ title: "Payment verification pending", description: error instanceof Error ? error.message : "Retry verification; do not pay again.", variant: "destructive" });
    } finally { setBusy(false); }
  };

  const buy = async () => {
    if (!user || busy || purchased || pendingPayment) return;
    setBusy(true);
    try {
      const Checkout = await loadCheckout();
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { purchase_type: "internship_program", program_id: GERMANY_PROGRAM_ID },
      });
      if (error || data?.error) throw new Error(data?.error || "Unable to start checkout. Please try again.");
      if (!data?.order_id || !data.key_id || data.amount !== GERMANY_PROGRAM_AMOUNT || data.currency !== "INR") {
        throw new Error("The checkout amount could not be confirmed. No payment was started.");
      }
      const checkout = new Checkout({
        key: data.key_id, order_id: data.order_id, amount: data.amount, currency: data.currency,
        name: "Lunorsoft", description: "Germany Program · Parul University collaboration",
        prefill: { email: user.email ?? "" },
        handler: (response: PaymentResponse) => { void verifyPayment(response); },
        modal: { ondismiss: () => setBusy(false) },
      });
      checkout.on("payment.failed", () => {
        setBusy(false);
        toast({ title: "Payment unsuccessful", description: "Your purchase has not been confirmed.", variant: "destructive" });
      });
      checkout.open();
    } catch (error) {
      setBusy(false);
      toast({ title: "Could not open checkout", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  };

  return (
    <section id={checkoutSection ? "program-purchase" : "germany-program"} className="scroll-mt-24 border-y border-border bg-secondary/20">
      <div className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-6">
        <div className="max-w-2xl">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase text-primary"><Globe2 className="h-4 w-4" /> International program · Germany</span>
          <h2 className="mt-4 font-serif text-3xl text-foreground sm:text-4xl">{checkoutSection ? "Ready to purchase?" : "Germany Program"}</h2>
          <p className="mt-3 text-lg font-medium text-foreground">Lunorsoft × Parul University</p>
          <p className="mt-3 text-muted-foreground">Explore the Germany program offered by Lunorsoft in collaboration with Parul University.</p>
          <p className="mt-4 text-sm text-muted-foreground">Confirm dates, eligibility, fee inclusions and refund terms with the Lunorsoft team before purchasing. Payment alone does not guarantee a visa or admission.</p>
        </div>
        <div className="min-w-0 lg:w-80 lg:border-l lg:border-border lg:pl-8">
          <p className="text-sm text-muted-foreground">Program fee · One-time payment</p>
          <p className="mt-2 text-4xl font-semibold text-foreground">₹3,35,000</p>
          <p className="mt-3 text-sm font-medium text-foreground">Last payment date: <time dateTime={germanyProgram.paymentDeadline}>{germanyProgram.paymentDeadlineLabel}</time></p>
          {checkoutSection ? (
            <Button className="mt-5 w-full gap-2" size="lg" onClick={() => setOpen(true)}>
              {purchased ? "View purchase" : "Buy program"}<ArrowUpRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild className="mt-5 w-full gap-2" size="lg"><Link to={germanyProgram.basePath}>Explore program<ArrowUpRight className="h-4 w-4" /></Link></Button>
          )}
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Secure payment through Razorpay</p>
        </div>
      </div>
      <Dialog open={open} onOpenChange={(value) => { if (!busy) setOpen(value); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{purchased ? "Germany program purchase" : "Germany Program"}</DialogTitle>
            <DialogDescription>Lunorsoft in collaboration with Parul University</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between border-y border-border py-5"><span className="text-muted-foreground">One-time program fee</span><strong className="text-2xl text-foreground">₹3,35,000</strong></div>
          <p className="text-sm text-muted-foreground">Last payment date: <time dateTime={germanyProgram.paymentDeadline}>{germanyProgram.paymentDeadlineLabel}</time></p>
          {purchased ? (
            <div className="space-y-4">
              <p className="flex items-center gap-2 font-medium text-primary"><CheckCircle2 className="h-5 w-5" /> Payment confirmed</p>
              <p className="break-all text-sm text-muted-foreground">Payment reference: {paymentReference}</p>
              <Button className="w-full" onClick={() => setOpen(false)}>Done</Button>
            </div>
          ) : !user ? (
            <Button asChild className="w-full"><Link to="/auth">Sign in to purchase</Link></Button>
          ) : pendingPayment ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Confirmation is pending. Do not pay again.</p>
              <p className="break-all text-xs text-muted-foreground">Payment reference: {pendingPayment.razorpay_payment_id}</p>
              <Button className="w-full" disabled={busy} onClick={() => void verifyPayment(pendingPayment)}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Retry verification</Button>
            </div>
          ) : loadError ? (
            <div className="space-y-3"><p className="text-sm text-destructive">Unable to check previous purchases. Please retry before paying.</p><Button className="w-full" disabled={checking} onClick={() => void refreshPurchase()}>Retry purchase check</Button></div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Please confirm the program dates, eligibility, inclusions and refund terms with Lunorsoft before continuing. Subscription coupons do not apply.</p>
              <Button className="w-full gap-2" disabled={busy || checking} onClick={() => void buy()}>{busy || checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} {busy ? "Processing…" : "Pay ₹3,35,000 with Razorpay"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}