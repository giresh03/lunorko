/**
 * Base site URL for lunor.online production and local dev.
 * Used for email confirmation, password reset, and OAuth redirects.
 */
export function getSiteUrl(): string {
  const host = window.location.hostname;
  if (host === "lunor.online" || host === "www.lunor.online") {
    return "https://lunor.online";
  }
  // In dev, always use current origin so any localhost port works (8080, 5173, etc.)
  if (import.meta.env.DEV && (host === "localhost" || host === "127.0.0.1")) {
    return window.location.origin;
  }
  return window.location.origin;
}

/**
 * OAuth redirect URL for Supabase auth.
 */
export function getAuthRedirectUrl(): string {
  return `${getSiteUrl()}/auth`;
}

/**
 * Sign in with Google using Lovable Cloud managed OAuth.
 */
export async function signInWithGoogle(): Promise<{ error?: Error }> {
  const redirectUrl = getAuthRedirectUrl();
  if (import.meta.env.DEV) {
    console.log("[Auth] Google sign-in redirect URL:", redirectUrl);
  }
  const { lovable } = await import("@/integrations/lovable");
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: redirectUrl,
  });
  if (result.error) {
    return { error: result.error instanceof Error ? result.error : new Error(String(result.error)) };
  }
  return {};
}
