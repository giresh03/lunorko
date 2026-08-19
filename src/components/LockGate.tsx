import { ReactNode } from "react";
import { Lock, ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFeatureLocks } from "@/hooks/useFeatureLocks";
import { useAdmin } from "@/hooks/useAdmin";

interface LockGateProps {
  lockKey: string;
  name?: string;
  /** Render nothing instead of the full lock panel (useful inside tabs/sections) */
  compact?: boolean;
  children: ReactNode;
}

/**
 * Hides any part of the site when an admin locks it from the Admin panel's System tab.
 * Admins always see through locks so they can verify content.
 */
const LockGate = ({ lockKey, name, compact, children }: LockGateProps) => {
  const { isLocked, lockMessage, lockLabel, loading } = useFeatureLocks();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  if (loading) return null;
  if (!isLocked(lockKey)) return <>{children}</>;

  const title = name || lockLabel(lockKey);
  const message =
    lockMessage(lockKey) || "This section is temporarily locked by the Lunor team. Please check back soon.";

  if (isAdmin) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <p className="text-xs text-foreground">
            <span className="font-semibold">{title}</span> is locked for users — you see it as admin.
          </p>
        </div>
        {children}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-card/60 px-6 py-14 text-center backdrop-blur">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title} is locked</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-glow">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <Badge className="absolute -right-3 -top-2 bg-primary text-primary-foreground">LOCKED</Badge>
      </div>
      <h2 className="mb-3 font-serif text-2xl font-bold text-foreground md:text-3xl">{title} is locked</h2>
      <p className="mb-6 max-w-md text-muted-foreground">{message}</p>
      <Button variant="outline" size="lg" onClick={() => navigate("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
      </Button>
    </div>
  );
};

export default LockGate;
