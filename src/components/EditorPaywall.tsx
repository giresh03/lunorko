import { useNavigate } from "react-router-dom";
import { Lock, Crown, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

interface EditorPaywallProps {
  domainId?: string;
  domainName?: string;
}

const EditorPaywall = ({ domainId, domainName }: EditorPaywallProps) => {
  const { user } = useAuth();
  const { hasFeature } = useFeatureAccess();
  const navigate = useNavigate();

  // If user has code-editor access, don't show paywall
  if (hasFeature("code-editor")) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-yellow-500 text-yellow-950 shadow-md">
            <Crown className="h-3 w-3 mr-1" /> PRO
          </Badge>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-3">
        Code Editor is a Pro Feature
      </h2>
      <p className="text-muted-foreground max-w-md mb-2">
        {domainName
          ? `Subscribe to the Pro plan or above to unlock the code editor for ${domainName}.`
          : "Unlock the full-featured code editor with AI assistant, multi-file projects, live preview, and more."}
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Starting at just <span className="text-primary font-semibold">₹150/month</span> with 60 credits
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {user ? (
          <Button size="lg" onClick={() => navigate("/pricing")} className="shadow-lg shadow-primary/20">
            <Zap className="mr-2 h-4 w-4" /> Upgrade to Pro
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg shadow-primary/20">
              Sign In to Subscribe
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
              View Plans
            </Button>
          </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm text-left">
        {["Full IDE experience", "AI code assistant", "Live preview", "60+ monthly credits"].map((f) => (
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
