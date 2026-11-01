import "server-only"

import { and, db, eq, sql, subscriptions, usageTracking } from "@infinity/db"
import { getCurrentUser } from "@/lib/auth/server"
import { getPlanForSubscription, type Plan } from "@/lib/plans"

type UsageType = "invoice" | "quotation" | "email"
type UsageResult = { allowed: boolean; remaining: number; limit: number }

const COUNTERS = {
  invoice: { key: "invoices_created", limit: (plan: Plan) => plan.limits.invoicesPerMonth },
  quotation: { key: "quotations_created", limit: (plan: Plan) => plan.limits.quotationsPerMonth },
  email: { key: "emails_sent", limit: (plan: Plan) => plan.limits.emailsPerMonth },
} as const

const currentMonth = () => new Date().toISOString().slice(0, 7)

async function getPlan(userId: string): Promise<{ plan: Plan; planId: string }> {
  const [subscription] = await db
    .select({ plan: subscriptions.plan, status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.user_id, userId))
    .limit(1)
  return { plan: getPlanForSubscription(subscription), planId: subscription?.plan || "free" }
}

async function getUsageRow(userId: string, monthYear: string) {
  const [usage] = await db
    .select()
    .from(usageTracking)
    .where(and(eq(usageTracking.user_id, userId), eq(usageTracking.month_year, monthYear)))
    .limit(1)
  return usage
}

export async function checkAndIncrementUsage(type: UsageType): Promise<UsageResult> {
  const user = await getCurrentUser()

  if (!user) {
    return { allowed: false, remaining: 0, limit: 0 }
  }

  return consumeUsage(user.id, type)
}

/**
 * Checks the user's monthly limit and records one use if allowed.
 * Callers must have authorised `userId` (signed-in user, or a job such as the cron).
 *
 * The increment is a single conditional UPDATE, so concurrent requests can't push the
 * counter past the limit.
 */
export async function consumeUsage(userId: string, type: UsageType): Promise<UsageResult> {
  const { plan } = await getPlan(userId)
  const monthYear = currentMonth()
  const { key, limit: limitFor } = COUNTERS[type]
  const column = usageTracking[key]
  const limit = limitFor(plan)

  await db.insert(usageTracking).values({ user_id: userId, month_year: monthYear }).onConflictDoNothing()

  const scope = and(eq(usageTracking.user_id, userId), eq(usageTracking.month_year, monthYear))
  const [updated] = await db
    .update(usageTracking)
    .set({ [key]: sql`${column} + 1` } as Partial<typeof usageTracking.$inferInsert>)
    // -1 means unlimited: still count, for tracking
    .where(limit === -1 ? scope : and(scope, sql`${column} < ${limit}`))
    .returning({ count: column })

  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1 }
  }

  if (!updated) {
    return { allowed: false, remaining: 0, limit }
  }

  return { allowed: true, remaining: limit - updated.count, limit }
}

export async function getUsageStatus(
  type: "invoice" | "quotation" | "email"
): Promise<{ canCreate: boolean; current: number; limit: number }> {
  const user = await getCurrentUser()

  if (!user) {
    return { canCreate: false, current: 0, limit: 0 }
  }

  const { plan } = await getPlan(user.id)
  const usage = await getUsageRow(user.id, currentMonth())

  const { key, limit: limitFor } = COUNTERS[type]
  const currentCount = usage?.[key] || 0
  const limit = limitFor(plan)

  // -1 means unlimited
  if (limit === -1) {
    return { canCreate: true, current: currentCount, limit: -1 }
  }

  return { canCreate: currentCount < limit, current: currentCount, limit }
}

export async function getUsageStats() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { plan, planId } = await getPlan(user.id)
  const usage = await getUsageRow(user.id, currentMonth())

  return {
    plan: planId,
    invoices: {
      used: usage?.invoices_created || 0,
      limit: plan.limits.invoicesPerMonth,
    },
    quotations: {
      used: usage?.quotations_created || 0,
      limit: plan.limits.quotationsPerMonth,
    },
    emails: {
      used: usage?.emails_sent || 0,
      limit: plan.limits.emailsPerMonth,
    },
  }
}
