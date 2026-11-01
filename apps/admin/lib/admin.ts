import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"
import { db, eq, superAdmins } from "@infinity/db"
import { getCurrentUser } from "@/lib/auth/server"

export interface AdminUser {
  id: string
  user_id: string
  email: string
  role: "admin" | "super_admin"
  created_at: string
}

/**
 * Get the signed-in user's super_admins record, or null if they aren't an admin.
 * Cached per request so the layout, pages and actions share one lookup.
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const user = await getCurrentUser()
  if (!user) return null

  const [adminRecord] = await db.select().from(superAdmins).where(eq(superAdmins.user_id, user.id)).limit(1)
  return adminRecord ?? null
})

/**
 * Require admin access for pages - sends anyone else back to the login screen.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser()

  if (!admin) {
    redirect("/login?error=forbidden")
  }

  return admin
}
