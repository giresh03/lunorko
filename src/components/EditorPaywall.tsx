import { useNavigate } from "react-router-dom";
import { Lock, Crown, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCredits, FREE_TRIAL_CREDITS } from "@/hooks/useCredits";

interface EditorPaywallProps {
  domainId?: string;
  domainName?: string;
}

const EditorPaywall = ({ domainName }: EditorPaywallProps) => {
  const { user } = useAuth();
  const { credits } = useCredits();
  const navigate = useNavigate();

  const trialUsedUp = !!user && credits?.planId === "free" && credits.balance <= 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          {trialUsedUp ? (
            <Lock className="h-10 w-10 text-primary" />
          ) : (
            <Sparkles className="h-10 w-10 text-primary" />
          )}
        </div>
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-primary text-primary-foreground shadow-md">
            <Crown className="h-3 w-3 mr-1" /> {trialUsedUp ? "PRO" : "FREE TRIAL"}
          </Badge>
        </div>
      </div>

      {trialUsedUp ? (
        <>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-3">
            Your {FREE_TRIAL_CREDITS} free workspace credits are used up
          </h2>
          <p className="text-muted-foreground max-w-md mb-2">
            You've seen what the Lunor AI engine can build — full multi-page apps with backend, database and APIs.
            Upgrade to keep building without limits.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Pro from <span className="text-primary font-semibold">₹150/month</span> with 1,500 credits · or top up
            200 credits for ₹50
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-3">
            Try the AI workspace free
          </h2>
          <p className="text-muted-foreground max-w-md mb-2">
            {domainName
              ? `Sign in to get ${FREE_TRIAL_CREDITS} free credits and build ${domainName} projects with the full AI engine.`
              : `Sign in to get ${FREE_TRIAL_CREDITS} free credits — full IDE, AI assistant, live preview and full-stack generation.`}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            No card needed. Upgrade later from <span className="text-primary font-semibold">₹150/month</span>.
          </p>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {user ? (
          <Button size="lg" onClick={() => navigate("/pricing")} className="shadow-lg shadow-primary/20">
            <Zap className="mr-2 h-4 w-4" /> {trialUsedUp ? "Upgrade to Pro" : "See plans"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg shadow-primary/20">
              Start free — {FREE_TRIAL_CREDITS} credits
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
              View Plans
            </Button>
          </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm text-left">
        {[
          "Full IDE experience",
          "Advanced AI engine",
          "Backend + database generation",
          "1,500 credits on Pro",
        ].map((f) => (
          <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorPaywall;
