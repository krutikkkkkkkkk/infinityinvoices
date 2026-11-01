import { db, eq, superAdmins } from "@infinity/db"
import { getCurrentUser } from "@/lib/auth/server"

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) return false

  const [adminRecord] = await db
    .select({ id: superAdmins.id })
    .from(superAdmins)
    .where(eq(superAdmins.user_id, user.id))
    .limit(1)

  return !!adminRecord
}
