// Delegates to Supabase auth (not Lovable Cloud) so Google sign-in uses your Supabase project.
import { supabase } from "../supabase/client";
import { getAuthRedirectUrl } from "@/lib/auth";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: SignInOptions) => {
      const redirectTo = opts?.redirect_uri ?? getAuthRedirectUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as "google" | "apple",
        options: { redirectTo },
      });
      if (error) return { error };
      if (data?.url) {
        window.location.href = data.url;
        return { redirected: true };
      }
      return { error: new Error("No redirect URL") };
    },
  },
};
