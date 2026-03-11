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
  free: [],
  pro: ["videos", "code-editor", "notes", "community", "domains"],
  premium: ["videos", "code-editor", "notes", "community", "domains", "projects", "skill-radar"],
  professional: [
    "videos", "code-editor", "notes", "community", "domains",
    "projects", "skill-radar", "resume-builder", "interview-prep", "hackathons",
  ],
};

const PLAN_CREDITS: Record<string, number> = {
  free: 4,
  pro: 60,
  premium: 100,
  professional: 150,
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
