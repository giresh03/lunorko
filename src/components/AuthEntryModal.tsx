import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, LogIn, X } from "lucide-react";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle } from "@/lib/auth";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpeg";

const SKIP_PATHS = new Set(["/auth", "/reset-password"]);

/**
 * First experience when opening the site: login / sign-up dialog (when not authenticated).
 * z-index above PopAd (z-100). Re-opens after full page reload until the user signs in.
 */
export default function AuthEntryModal() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) {
      setOpen(false);
      return;
    }
    if (SKIP_PATHS.has(location.pathname)) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [user, loading, location.pathname]);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (!error) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[320] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[330] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-0 border border-border bg-card p-0 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "sm:rounded-lg overflow-hidden"
          )}
          onPointerDownOutside={() => setOpen(false)}
          onEscapeKeyDown={() => setOpen(false)}
        >
          <DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-sm p-1.5 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <div className="bg-gradient-to-br from-primary/15 via-background to-background px-6 pt-10 pb-6 text-center border-b border-border">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="" className="h-14 w-14 rounded-xl object-cover ring-2 ring-primary/30 shadow-lg" />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold tracking-tight">Welcome to Lunor.AI</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Sign in or create an account to track progress, join the community, and unlock the full learning platform.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-3">
            <Button
              className="w-full h-11 text-base"
              size="lg"
              disabled={googleLoading}
              onClick={handleGoogle}
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button variant="secondary" className="w-full h-11" size="lg" asChild>
              <Link to="/auth" onClick={() => setOpen(false)}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign in or sign up with email
              </Link>
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-1">
              <button
                type="button"
                className="underline underline-offset-2 hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Continue without an account
              </button>
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
