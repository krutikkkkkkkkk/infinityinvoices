// URL of the invoicing app (apps/web). Set NEXT_PUBLIC_APP_URL in production.
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "")
