"use server"

import { getAdminUser } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"

export async function upgradeUserToPro(userId: string) {
  try {
    // Verify that the current user is an admin
    if (!(await getAdminUser())) {
      return { success: false, message: "Unauthorized: Admin access required" }
    }

    // Users can't write subscriptions under RLS, so admin changes go through the service role
    const supabase = createAdminClient()

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
    // Verify that the current user is an admin
    if (!(await getAdminUser())) {
      return { success: false, message: "Unauthorized: Admin access required" }
    }

    // Users can't write subscriptions under RLS, so admin changes go through the service role
    const supabase = createAdminClient()

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
