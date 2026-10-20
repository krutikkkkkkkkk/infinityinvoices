import { createClient } from "@/lib/supabase/server"

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  const { data: adminRecord } = await supabase
    .from("super_admins")
    .select("id")
    .eq("user_id", user.id)
    .single()
  
  return !!adminRecord
}
