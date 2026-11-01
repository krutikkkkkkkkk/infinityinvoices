import "server-only"

import { and, clients, db, eq, subscriptions, usageTracking } from "@infinity/db"
import { getPlanForSubscription, hasPaidPlan, type Plan } from "@/lib/plans"
import { getProductIdForPlan } from "@/lib/dodo"

export type PlanId = "free" | "pro" | "lifetime"

export interface PlanOverview {
  planId: PlanId
  plan: Plan
  isPaid: boolean
  /** A Pro/Lifetime subscription exists but isn't active (payment on hold, failed, paused...). */
  inactivePaidPlan: "pro" | "lifetime" | null
  status: string
  renewsAt: string | null
  cancelsAtPeriodEnd: boolean
  canManageBilling: boolean
  checkout: { pro: boolean; lifetime: boolean }
  usage: {
    invoices: { used: number; limit: number }
    quotations: { used: number; limit: number }
    emails: { used: number; limit: number }
    /** Total clients (not monthly): the Free plan caps how many you can have. */
    clients: { used: number; limit: number }
  }
  /** First day of next month (UTC) — when monthly limits reset. */
  resetsAt: string
  daysUntilReset: number
}

export async function getPlanOverview(userId: string): Promise<PlanOverview> {
  // Usage rows are keyed by UTC month (see lib/usage.ts), so reset maths uses UTC too.
  const now = new Date()
  const monthYear = now.toISOString().slice(0, 7)
  const resets = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const [[sub], [usage], clientCount] = await Promise.all([
    db.select().from(subscriptions).where(eq(subscriptions.user_id, userId)).limit(1),
    db
      .select({
        invoices_created: usageTracking.invoices_created,
        quotations_created: usageTracking.quotations_created,
        emails_sent: usageTracking.emails_sent,
      })
      .from(usageTracking)
      .where(and(eq(usageTracking.user_id, userId), eq(usageTracking.month_year, monthYear)))
      .limit(1),
    db.$count(clients, eq(clients.user_id, userId)),
  ])

  const isPaid = hasPaidPlan(sub)
  const plan = getPlanForSubscription(sub)
  const planId: PlanId = isPaid ? (sub?.plan === "lifetime" ? "lifetime" : "pro") : "free"

  return {
    planId,
    plan,
    isPaid,
    inactivePaidPlan:
      !isPaid && (sub?.plan === "pro" || sub?.plan === "lifetime") && sub.status !== "expired" ? sub.plan : null,
    status: sub?.status ?? "active",
    renewsAt: sub?.current_period_end ?? null,
    cancelsAtPeriodEnd: Boolean(sub?.cancel_at_period_end),
    canManageBilling: Boolean(sub?.dodo_customer_id),
    checkout: {
      pro: Boolean(getProductIdForPlan("pro")),
      lifetime: Boolean(getProductIdForPlan("lifetime")),
    },
    usage: {
      invoices: { used: usage?.invoices_created ?? 0, limit: plan.limits.invoicesPerMonth },
      quotations: { used: usage?.quotations_created ?? 0, limit: plan.limits.quotationsPerMonth },
      emails: { used: usage?.emails_sent ?? 0, limit: plan.limits.emailsPerMonth },
      clients: { used: clientCount, limit: plan.limits.clients },
    },
    resetsAt: resets.toISOString().slice(0, 10),
    daysUntilReset: Math.max(1, Math.ceil((resets.getTime() - now.getTime()) / 864e5)),
  }
}
