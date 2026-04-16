"use server"

import { createClient } from "@/lib/supabase/server"

const LIFETIME_PLAN_LIMIT = 200

export async function getLifetimePlanAvailability() {
  try {
    const supabase = await createClient()
    
    const { count, error } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("plan", "lifetime")
      .eq("status", "active")
    
    if (error) {
      console.error("[v0] Error counting lifetime subscriptions:", error)
      return { available: true, count: 0, limit: LIFETIME_PLAN_LIMIT }
    }
    
    const soldCount = count || 0
    const remainingCount = Math.max(0, LIFETIME_PLAN_LIMIT - soldCount)
    
    return {
      available: remainingCount > 0,
      count: soldCount,
      limit: LIFETIME_PLAN_LIMIT,
      remaining: remainingCount,
    }
  } catch (error) {
    console.error("[v0] Error in getLifetimePlanAvailability:", error)
    return { available: true, count: 0, limit: LIFETIME_PLAN_LIMIT }
  }
}
