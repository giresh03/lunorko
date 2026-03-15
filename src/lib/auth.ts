/**
 * Base site URL for lunor.online production.
 * Used for email confirmation, password reset, and OAuth redirects.
 */
export function getSiteUrl(): string {
  const host = window.location.hostname;
  if (host === "lunor.online" || host === "www.lunor.online") {
    return "https://lunor.online";
  }
  const origin = window.location.origin;
  if (import.meta.env.DEV && (origin === "http://localhost" || origin === "http://localhost:80")) {
    return "http://localhost:8080";
  }
  return origin;
}

/**
 * OAuth redirect URL for Supabase auth.
 */
export function getAuthRedirectUrl(): string {
  return `${getSiteUrl()}/auth`;
}

/**
 * Sign in with Google using Supabase OAuth.
 * Add this redirect URL in Supabase: Authentication → URL Configuration → Redirect URLs
 * e.g. http://localhost:8081/auth, https://lunor.online/auth
 */
export async function signInWithGoogle(): Promise<{ error?: Error }> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: getAuthRedirectUrl() },
  });
  return error ? { error } : {};
}
