/**
 * Canonical public origin of the web app (https://app.infinityinvoices.com in
 * production). Auth emails must link back here, not to whatever hostname the
 * user happens to be browsing on, so that one Supabase redirect allow-list
 * entry covers every deployment alias.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, "")

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL?.trim()
  if (vercelUrl) return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`

  if (typeof window !== "undefined") return window.location.origin
  return "http://localhost:3000"
}

/** Where password reset emails should send the user. */
export function getPasswordResetRedirectUrl(): string {
  return `${getSiteUrl()}/auth/callback?next=/auth/reset-password`
}
