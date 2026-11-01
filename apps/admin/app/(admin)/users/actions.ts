"use server"

import { db, eq, subscriptions } from "@infinity/db"
import { getAdminUser } from "@/lib/admin"

export async function upgradeUserToPro(userId: string) {
  try {
    // Verify that the current user is an admin
    if (!(await getAdminUser())) {
      return { success: false, message: "Unauthorized: Admin access required" }
    }

    // Create the subscription, or switch the existing one to a year of Pro
    const values = {
      plan: "pro",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }
    await db
      .insert(subscriptions)
      .values({ user_id: userId, ...values })
      .onConflictDoUpdate({ target: subscriptions.user_id, set: values })

    return { success: true, message: "User upgraded to Pro" }
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

    await db
      .update(subscriptions)
      .set({ plan: "free", status: "active" })
      .where(eq(subscriptions.user_id, userId))

    return { success: true, message: "User downgraded to Free" }
  } catch (error) {
    console.error("[v0] Error downgrading user:", error)
    return { success: false, message: "Failed to downgrade user" }
  }
}
