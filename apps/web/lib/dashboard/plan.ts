import "server-only"

import { createClient } from "@/lib/supabase/server"
import { getPlanForSubscription, hasPaidPlan, type Plan } from "@/lib/plans"
import { getProductIdForPlan, type BillingInterval } from "@/lib/dodo"
import { getLifetimePlanAvailability } from "@/app/actions/lifetime"

export type PlanId = "free" | "pro" | "lifetime"

export interface PlanOverview {
  planId: PlanId
  plan: Plan
  isPaid: boolean
  /** A Pro/Lifetime subscription exists but isn't active (payment on hold, failed, paused...). */
  inactivePaidPlan: "pro" | "lifetime" | null
  /** How Pro is billed; null for Free, Lifetime, and Pro granted without a Dodo subscription. */
  billingInterval: BillingInterval | null
  status: string
  renewsAt: string | null
  cancelsAtPeriodEnd: boolean
  canManageBilling: boolean
  checkout: { pro: boolean; proYearly: boolean; lifetime: boolean }
  lifetime: { available: boolean; remaining: number; limit: number }
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
  const supabase = await createClient()
  // Usage rows are keyed by UTC month (see lib/usage.ts), so reset maths uses UTC too.
  const now = new Date()
  const monthYear = now.toISOString().slice(0, 7)
  const resets = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const [subRes, usageRes, clientsRes, lifetime] = await Promise.all([
    supabase
      .from("subscriptions")
      // "*" rather than named columns: dodo_customer_id only exists once scripts/013_add_dodo_payments.sql has run
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("usage_tracking")
      .select("invoices_created, quotations_created, emails_sent")
      .eq("user_id", userId)
      .eq("month_year", monthYear)
      .maybeSingle(),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", userId),
    getLifetimePlanAvailability(),
  ])
  if (subRes.error) throw new Error(`Failed to load subscription: ${subRes.error.message}`)
  if (usageRes.error) throw new Error(`Failed to load usage: ${usageRes.error.message}`)
  if (clientsRes.error) throw new Error(`Failed to count clients: ${clientsRes.error.message}`)

  const sub = subRes.data
  const isPaid = hasPaidPlan(sub)
  const plan = getPlanForSubscription(sub)
  const planId: PlanId = isPaid ? (sub?.plan === "lifetime" ? "lifetime" : "pro") : "free"
  const usage = usageRes.data

  return {
    planId,
    plan,
    isPaid,
    inactivePaidPlan:
      !isPaid && (sub?.plan === "pro" || sub?.plan === "lifetime") && sub.status !== "expired" ? sub.plan : null,
    billingInterval:
      planId === "pro" && (sub?.billing_interval === "month" || sub?.billing_interval === "year") ? sub.billing_interval : null,
    status: sub?.status ?? "active",
    renewsAt: sub?.current_period_end ?? null,
    cancelsAtPeriodEnd: Boolean(sub?.cancel_at_period_end),
    canManageBilling: Boolean(sub?.dodo_customer_id),
    checkout: {
      pro: Boolean(getProductIdForPlan("pro")),
      proYearly: Boolean(getProductIdForPlan("pro_yearly")),
      lifetime: Boolean(getProductIdForPlan("lifetime")),
    },
    lifetime: { available: lifetime.available, remaining: lifetime.remaining, limit: lifetime.limit },
    usage: {
      invoices: { used: usage?.invoices_created ?? 0, limit: plan.limits.invoicesPerMonth },
      quotations: { used: usage?.quotations_created ?? 0, limit: plan.limits.quotationsPerMonth },
      emails: { used: usage?.emails_sent ?? 0, limit: plan.limits.emailsPerMonth },
      clients: { used: clientsRes.count ?? 0, limit: plan.limits.clients },
    },
    resetsAt: resets.toISOString().slice(0, 10),
    daysUntilReset: Math.max(1, Math.ceil((resets.getTime() - now.getTime()) / 864e5)),
  }
}
