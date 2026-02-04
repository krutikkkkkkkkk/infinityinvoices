import { createClient } from "@/lib/supabase/server"
import { getPlan, getFreePlan } from "@/lib/plans"

export async function checkAndIncrementUsage(
  type: "invoice" | "quotation" | "email"
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { allowed: false, remaining: 0, limit: 0 }
  }

  // Get subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .single()

  const plan = getPlan(subscription?.plan || "free") || getFreePlan()
  const monthYear = new Date().toISOString().slice(0, 7)

  // Get or create usage record
  let { data: usage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", user.id)
    .eq("month_year", monthYear)
    .single()

  if (!usage) {
    const { data: newUsage } = await supabase
      .from("usage_tracking")
      .insert({
        user_id: user.id,
        month_year: monthYear,
        invoices_created: 0,
        quotations_created: 0,
        emails_sent: 0,
      })
      .select()
      .single()
    usage = newUsage
  }

  let currentCount = 0
  let limit = 0
  let field = ""

  switch (type) {
    case "invoice":
      currentCount = usage?.invoices_created || 0
      limit = plan.limits.invoicesPerMonth
      field = "invoices_created"
      break
    case "quotation":
      currentCount = usage?.quotations_created || 0
      limit = plan.limits.quotationsPerMonth
      field = "quotations_created"
      break
    case "email":
      currentCount = usage?.emails_sent || 0
      limit = plan.limits.emailsPerMonth
      field = "emails_sent"
      break
  }

  // -1 means unlimited
  if (limit === -1) {
    // Increment usage for tracking
    await supabase
      .from("usage_tracking")
      .update({ [field]: currentCount + 1 })
      .eq("user_id", user.id)
      .eq("month_year", monthYear)

    return { allowed: true, remaining: -1, limit: -1 }
  }

  if (currentCount >= limit) {
    return { allowed: false, remaining: 0, limit }
  }

  // Increment usage
  await supabase
    .from("usage_tracking")
    .update({ [field]: currentCount + 1 })
    .eq("user_id", user.id)
    .eq("month_year", monthYear)

  return { allowed: true, remaining: limit - currentCount - 1, limit }
}

export async function getUsageStats() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .single()

  const plan = getPlan(subscription?.plan || "free") || getFreePlan()
  const monthYear = new Date().toISOString().slice(0, 7)

  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", user.id)
    .eq("month_year", monthYear)
    .single()

  return {
    plan: subscription?.plan || "free",
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
