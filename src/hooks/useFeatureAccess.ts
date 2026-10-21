import { useSubscription } from "@/hooks/useSubscription";

export type Feature =
  | "videos"
  | "code-editor"
  | "notes"
  | "community"
  | "projects"
  | "skill-radar"
  | "resume-builder"
  | "interview-prep"
  | "hackathons"
  | "domains"
  | "live-backend";

const PLAN_FEATURES: Record<string, Feature[]> = {
  // Free users get a credit-metered trial of the AI workspace + domains.
  free: ["code-editor", "domains", "live-backend"],
  pro: ["videos", "code-editor", "notes", "community", "domains", "live-backend"],
  premium: ["videos", "code-editor", "notes", "community", "domains", "projects", "skill-radar", "interview-prep", "live-backend"],
  professional: [
    "videos", "code-editor", "notes", "community", "domains",
    "projects", "skill-radar", "resume-builder", "interview-prep", "hackathons", "live-backend",
  ],
};

const PLAN_CREDITS: Record<string, number> = {
  free: 10,
  pro: 1500,
  premium: 4000,
  professional: 10000,
};


export const useFeatureAccess = () => {
  const { plan, loading } = useSubscription();

  const hasFeature = (feature: Feature): boolean => {
    const features = PLAN_FEATURES[plan] || [];
    return features.includes(feature);
  };

  const monthlyCredits = PLAN_CREDITS[plan] || PLAN_CREDITS.free;
  const isTrial = plan === "free";

  return { plan, loading, hasFeature, monthlyCredits, isTrial };
};

