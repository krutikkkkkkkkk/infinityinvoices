// URL of the invoicing app (apps/web). Override with NEXT_PUBLIC_APP_URL.
const DEFAULT_APP_URL =
  process.env.NODE_ENV === "production" ? "https://app.infinityinvoices.com" : "http://localhost:3000"

export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL).replace(/\/$/, "")

// Shown on the legal pages. Override with NEXT_PUBLIC_SUPPORT_EMAIL.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@infinityinvoices.com"

// Bump whenever the Privacy Policy or Terms change.
export const LEGAL_UPDATED = "21 October 2026"
