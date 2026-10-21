import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

/**
 * Gates a route behind sign-in. Unauthenticated visitors are sent to /auth
 * with a redirect back to where they were headed.
 */
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    const target = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?redirect=${encodeURIComponent(target)}`} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
