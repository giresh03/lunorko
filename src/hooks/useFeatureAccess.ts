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
  | "domains";

const PLAN_FEATURES: Record<string, Feature[]> = {
  // Free users get a credit-metered trial of the AI workspace + domains.
  free: ["code-editor", "domains"],
  pro: ["videos", "code-editor", "notes", "community", "domains"],
  premium: ["videos", "code-editor", "notes", "community", "domains", "projects", "skill-radar", "interview-prep"],
  professional: [
    "videos", "code-editor", "notes", "community", "domains",
    "projects", "skill-radar", "resume-builder", "interview-prep", "hackathons",
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

  const monthlyCredits = PLAN_CREDITS[plan] || 4;

  return { plan, loading, hasFeature, monthlyCredits };
};
