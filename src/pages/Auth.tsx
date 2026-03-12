import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getAuthRedirectUrl, getSiteUrl } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.jpeg";
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

const signUpSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name must be under 50 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password must be under 72 characters"),
});

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(1, "Password is required"),
});

const forgotSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
});

type FieldErrors = Record<string, string>;

const friendlyError = (msg: string): string => {
  if (msg.includes("Invalid login credentials")) return "Incorrect email or password. Please try again or reset your password.";
  if (msg.includes("Email not confirmed")) return "Please check your inbox and confirm your email before signing in.";
  if (msg.includes("User already registered")) return "An account with this email already exists. Try signing in instead.";
  if (msg.includes("rate limit") || msg.includes("too many")) return "Too many attempts. Please wait a moment and try again.";
  if (
    msg.includes("Email signups are disabled") ||
    msg.includes("Email logins are disabled") ||
    msg.includes("Signups not allowed") ||
    (msg.toLowerCase().includes("signup") && msg.toLowerCase().includes("disabled"))
  ) {
    return "Email auth is disabled in Supabase. Enable it: Project Settings → Authentication → turn ON 'Allow new users to sign up'. Also check Auth → Providers → Email is enabled.";
  }
  return msg;
};

const Auth = () => {
  const { user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle OAuth callback: check for errors in URL, clear hash to prevent 404s and clean URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const error = params.get("error") || hashParams.get("error");
    const errorDesc = params.get("error_description") || hashParams.get("error_description");

    if (error) {
      setFormError(friendlyError(errorDesc || error));
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    // Clear OAuth hash after Supabase processes it (prevents 404s from hash-based requests)
    const hash = window.location.hash;
    if (hash && (hash.includes("access_token") || hash.includes("refresh_token"))) {
      // Delay so Supabase client can read the hash first
      const id = setTimeout(() => {
        window.history.replaceState(null, "", window.location.pathname);
      }, 100);
      return () => clearTimeout(id);
    }
  }, []);

  // Redirect to domains when user is already logged in (e.g. after OAuth callback)
  useEffect(() => {
    if (user) {
      navigate("/domains", { replace: true });
    }
  }, [user, navigate]);

  const clearMessages = () => {
    setFieldErrors({});
    setFormError("");
    setFormSuccess("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const result = forgotSchema.safeParse({ email });
    if (!result.success) {
      const errs: FieldErrors = {};
      result.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/reset-password`,
    });
    if (error) {
      if (import.meta.env.DEV) console.error("[Auth] Reset password error:", error.message, error);
      setFormError(friendlyError(error.message));
    } else {
      setFormSuccess("Check your email — we've sent you a password reset link.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const schema = isSignUp ? signUpSchema : signInSchema;
    const data = isSignUp ? { displayName, email, password } : { email, password };
    const result = schema.safeParse(data);

    if (!result.success) {
      const errs: FieldErrors = {};
      result.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${getSiteUrl()}/auth`,
            data: { display_name: displayName },
          },
        });
        if (error) {
          if (import.meta.env.DEV) console.error("[Auth] Sign up error:", error.message, error);
          setFormError(friendlyError(error.message));
        } else {
          setFormSuccess("Account created! Check your email for a confirmation link to get started.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (import.meta.env.DEV) console.error("[Auth] Sign in error:", error.message, error);
          setFormError(friendlyError(error.message));
        } else {
          navigate("/domains");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFormError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    clearMessages();
  };

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <p className="text-sm text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
          <div className="mb-6 flex flex-col items-center gap-3">
            <img src={logo} alt="Lunor.AI" className="h-12 w-12 rounded-md" />
            <h1 className="text-2xl font-bold text-foreground">
              {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isForgotPassword
                ? "Enter your email to receive a reset link"
                : isSignUp
                ? "Sign up to start learning"
                : "Sign in to continue learning"}
            </p>
          </div>

          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {formSuccess && (
            <Alert className="mb-4 border-primary/30 bg-primary/5 text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{formSuccess}</AlertDescription>
            </Alert>
          )}

          {isForgotPassword ? (
            <>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                    className={fieldErrors.email ? "border-destructive" : ""}
                    required
                  />
                  <FieldError field="email" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : "Send Reset Link"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => { setIsForgotPassword(false); clearMessages(); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Back to Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => { setDisplayName(e.target.value); setFieldErrors((p) => ({ ...p, displayName: "" })); }}
                      className={fieldErrors.displayName ? "border-destructive" : ""}
                    />
                    <FieldError field="displayName" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                    className={fieldErrors.email ? "border-destructive" : ""}
                  />
                  <FieldError field="email" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <button type="button" onClick={() => { setIsForgotPassword(true); clearMessages(); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                      className={fieldErrors.password ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError field="password" />
                  {isSignUp && !fieldErrors.password && (
                    <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait…</> : isSignUp ? "Sign Up" : "Sign In"}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  clearMessages();
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: getAuthRedirectUrl() },
                  });
                  if (error) {
                    if (import.meta.env.DEV) console.error("[Auth] Google OAuth error:", error.message, error);
                    setFormError(friendlyError(error.message));
                    setLoading(false);
                  } else if (data?.url) {
                    window.location.href = data.url;
                  } else {
                    setLoading(false);
                  }
                }}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>

              <div className="mt-6 text-center">
                <button onClick={switchMode} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
