import "server-only"

import { cache } from "react"
import { createNeonAuth } from "@neon/auth/next/server"

// Vercel's Neon integration prefixes its variables (STORAGE_NEON_AUTH_BASE_URL); local .env.local
// uses the unprefixed names.
export const auth = createNeonAuth({
  baseUrl: (process.env.NEON_AUTH_BASE_URL ?? process.env.STORAGE_NEON_AUTH_BASE_URL)!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
})

export interface AuthUser {
  id: string
  email: string
  name: string | null
}

/** Per-request lookup of the signed-in user. */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const { data } = await auth.getSession()
  const user = data?.user
  if (!user) return null
  return { id: user.id, email: user.email, name: user.name || null }
})
