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
