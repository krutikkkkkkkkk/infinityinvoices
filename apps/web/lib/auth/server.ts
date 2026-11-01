import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"
import { createNeonAuth } from "@neon/auth/next/server"
import { db, profiles } from "@infinity/db"

// Vercel's Neon integration prefixes its variables (STORAGE_NEON_AUTH_BASE_URL); `neon deploy`
// writes them unprefixed for local development.
export const auth = createNeonAuth({
  baseUrl: (process.env.NEON_AUTH_BASE_URL ?? process.env.STORAGE_NEON_AUTH_BASE_URL)!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
})

export interface AuthUser {
  id: string
  email: string
  name: string | null
}

/** Per-request lookup of the signed-in user, shared by every server component and action. */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const { data } = await auth.getSession()
  const user = data?.user
  if (!user) return null
  return { id: user.id, email: user.email, name: user.name || null }
})

/** For server actions and route handlers: throws when nobody is signed in. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Not authenticated")
  return user
}

/** For pages: sends signed-out visitors to the login screen. */
export async function requireUserOrRedirect(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")
  return user
}

/**
 * Creates the user's profile row on first visit (Supabase did this with a trigger on auth.users;
 * Neon Auth's tables are managed by Neon, so the app does it).
 */
export async function ensureProfile(user: AuthUser) {
  await db
    .insert(profiles)
    .values({ id: user.id, email: user.email, full_name: user.name })
    .onConflictDoNothing({ target: profiles.id })
}
