"use server"

import { createClient } from "@/lib/supabase/server"

export async function upgradeUserToPro(userId: string) {
  try {
    // Use admin client to bypass RLS for admin operations
    const supabase = await createClient()
    
    // Verify that the current user is an admin
    const { data: adminRecord } = await supabase
      .from("super_admins")
      .select("id")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .maybeSingle()

    if (!adminRecord) {
      return { success: false, message: "Unauthorized: Admin access required" }
    }

    // Check if user has an existing subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (existingSubscription) {
      // Update existing subscription to Pro
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan: "pro",
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) throw error
      return { success: true, message: "User upgraded to Pro" }
    } else {
      // Create new Pro subscription
      const { error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan: "pro",
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })

      if (error) throw error
      return { success: true, message: "User upgraded to Pro" }
    }
  } catch (error) {
    console.error("[v0] Error upgrading user:", error)
    return { success: false, message: "Failed to upgrade user" }
  }
}

export async function downgradeUserToFree(userId: string) {
  try {
    const supabase = await createClient()
    
    // Verify that the current user is an admin
    const { data: adminRecord } = await supabase
      .from("super_admins")
      .select("id")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .maybeSingle()

    if (!adminRecord) {
      return { success: false, message: "Unauthorized: Admin access required" }
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({
        plan: "free",
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) throw error
    return { success: true, message: "User downgraded to Free" }
  } catch (error) {
    console.error("[v0] Error downgrading user:", error)
    return { success: false, message: "Failed to downgrade user" }
  }
}
