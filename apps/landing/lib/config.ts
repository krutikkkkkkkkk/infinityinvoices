// URL of the invoicing app (apps/web). Override with NEXT_PUBLIC_APP_URL.
const DEFAULT_APP_URL =
  process.env.NODE_ENV === "production" ? "https://app.infinityinvoices.com" : "http://localhost:3000"

export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL).replace(/\/$/, "")
