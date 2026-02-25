import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.jpeg";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Failed to send reset email", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent you a password reset link." });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: displayName },
        },
      });

      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please verify your email to sign in.",
        });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/domains");
      }
    }

    setLoading(false);
  };


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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait…" : "Send Reset Link"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
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
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait…" : isSignUp ? "Sign Up" : "Sign In"}
                </Button>
              </form>



              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
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
