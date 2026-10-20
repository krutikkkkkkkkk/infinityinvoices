import { createClient } from "@/lib/supabase/server"

export interface AdminUser {
  id: string
  user_id: string
  email: string
  role: "admin" | "super_admin"
  created_at: string
}

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

/**
 * Get admin user details
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: adminRecord } = await supabase
    .from("super_admins")
    .select("*")
    .eq("user_id", user.id)
    .single()
  
  return adminRecord as AdminUser | null
}

/**
 * Require admin access - redirects to dashboard if not admin
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser()
  
  if (!admin) {
    throw new Error("UNAUTHORIZED")
  }
  
  return admin
}

// Admin stats types
export interface AdminStats {
  totalUsers: number
  proUsers: number
  freeUsers: number
  totalDocuments: number
  totalInvoices: number
  totalQuotations: number
  totalRevenue: number
  newUsersThisMonth: number
}

export interface UserWithDetails {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  plan: "free" | "pro"
  created_at: string
  documents_count: number
  total_revenue: number
}
