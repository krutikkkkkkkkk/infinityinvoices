"use server"

import { and, db, eq, subscriptions } from "@infinity/db"

const LIFETIME_PLAN_LIMIT = 200

export async function getLifetimePlanAvailability() {
  try {
    const soldCount = await db.$count(
      subscriptions,
      and(eq(subscriptions.plan, "lifetime"), eq(subscriptions.status, "active")),
    )
    const remainingCount = Math.max(0, LIFETIME_PLAN_LIMIT - soldCount)

    return {
      available: remainingCount > 0,
      count: soldCount,
      limit: LIFETIME_PLAN_LIMIT,
      remaining: remainingCount,
    }
  } catch {
    // Return available as fallback to not block purchases due to errors
    return { available: true, count: 0, limit: LIFETIME_PLAN_LIMIT, remaining: LIFETIME_PLAN_LIMIT }
  }
}
