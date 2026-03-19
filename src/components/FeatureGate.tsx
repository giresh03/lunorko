import { useNavigate } from "react-router-dom";
import { Lock, Crown, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureAccess, Feature } from "@/hooks/useFeatureAccess";

interface FeatureGateProps {
  feature: Feature;
  featureName: string;
  requiredPlan: string;
  children: React.ReactNode;
}

const PLAN_LABELS: Record<string, string> = {
  pro: "Pro (₹9/mo)",
  premium: "Premium (₹100/mo)",
  professional: "Professional (₹150/mo)",
};

const FeatureGate = ({ feature, featureName, requiredPlan, children }: FeatureGateProps) => {
  const { user } = useAuth();
  const { hasFeature, loading } = useFeatureAccess();
  const navigate = useNavigate();

  if (loading) return null;

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-yellow-500 text-yellow-950 shadow-md">
            <Crown className="h-3 w-3 mr-1" /> {requiredPlan.toUpperCase()}
          </Badge>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-3">
        {featureName} is a {requiredPlan} Feature
      </h2>
      <p className="text-muted-foreground max-w-md mb-2">
        Upgrade to the {PLAN_LABELS[requiredPlan] || requiredPlan} plan to unlock {featureName.toLowerCase()}.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {user ? (
          <Button size="lg" onClick={() => navigate("/pricing")} className="shadow-lg shadow-primary/20">
            <Zap className="mr-2 h-4 w-4" /> Upgrade to {requiredPlan}
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
    </div>
  );
};

export default FeatureGate;
