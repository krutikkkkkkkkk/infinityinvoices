import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminRecord } = await supabase
    .from("super_admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  return adminRecord as AdminUser | null
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
