"use server"

import { and, db, eq, subscriptions, usageTracking } from "@infinity/db"
import { getCurrentUser } from "@/lib/auth/server"
import { revalidatePath } from "next/cache"

export async function refreshSubscription() {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get current subscription
  try {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.user_id, user.id)).limit(1)
    revalidatePath("/dashboard/plan")
    return { subscription: subscription ?? null, error: undefined }
  } catch (error) {
    revalidatePath("/dashboard/plan")
    return { subscription: null, error: error instanceof Error ? error.message : "Failed to load subscription" }
  }
}

/** The signed-in user's plan and this month's usage, for client components (hooks/use-subscription). */
export async function getSubscriptionData() {
  const user = await getCurrentUser()
  const empty = { invoices_created: 0, quotations_created: 0, emails_sent: 0 }

  if (!user) {
    return { subscription: { plan: "free", status: "active" }, usage: empty }
  }

  const monthYear = new Date().toISOString().slice(0, 7)
  const [[sub], [usage]] = await Promise.all([
    db
      .select({ plan: subscriptions.plan, status: subscriptions.status, current_period_end: subscriptions.current_period_end })
      .from(subscriptions)
      .where(eq(subscriptions.user_id, user.id))
      .limit(1),
    db
      .select({
        invoices_created: usageTracking.invoices_created,
        quotations_created: usageTracking.quotations_created,
        emails_sent: usageTracking.emails_sent,
      })
      .from(usageTracking)
      .where(and(eq(usageTracking.user_id, user.id), eq(usageTracking.month_year, monthYear)))
      .limit(1),
  ])

  return {
    subscription: sub ? { ...sub, current_period_end: sub.current_period_end ?? undefined } : { plan: "free", status: "active" },
    usage: usage ?? empty,
  }
}
