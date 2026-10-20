"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { getPlan, getFreePlan, type Plan } from "@/lib/plans"

interface Subscription {
  plan: string
  status: string
  current_period_end?: string
}

interface Usage {
  invoices_created: number
  quotations_created: number
  emails_sent: number
}

interface SubscriptionData {
  subscription: Subscription
  usage: Usage
}

const fetchSubscriptionData = async (): Promise<SubscriptionData> => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      subscription: { plan: "free", status: "active" },
      usage: { invoices_created: 0, quotations_created: 0, emails_sent: 0 }
    }
  }

  // Fetch subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Fetch usage for current month
  const monthYear = new Date().toISOString().slice(0, 7)
  const { data: usageData } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", user.id)
    .eq("month_year", monthYear)
    .single()

  return {
    subscription: sub || { plan: "free", status: "active" },
    usage: usageData || { invoices_created: 0, quotations_created: 0, emails_sent: 0 }
  }
}

export function useSubscription() {
  const { data, error, isLoading, mutate } = useSWR<SubscriptionData>(
    "subscription-data",
    fetchSubscriptionData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute deduplication
    }
  )

  const subscription = data?.subscription || null
  const usage = data?.usage || null
  const plan: Plan = getPlan(subscription?.plan || "free") || getFreePlan()

  const canCreateInvoice = () => {
    if (plan.limits.invoicesPerMonth === -1) return true
    return (usage?.invoices_created || 0) < plan.limits.invoicesPerMonth
  }

  const canCreateQuotation = () => {
    if (plan.limits.quotationsPerMonth === -1) return true
    return (usage?.quotations_created || 0) < plan.limits.quotationsPerMonth
  }

  const canSendEmail = () => {
    if (plan.limits.emailsPerMonth === -1) return true
    return (usage?.emails_sent || 0) < plan.limits.emailsPerMonth
  }

  // Everyone has pro features now
  const isPro = true
  const isLifetime = true

  return {
    subscription,
    usage,
    plan,
    loading: isLoading,
    isLoading,
    isPro,
    isLifetime,
    canCreateInvoice,
    canCreateQuotation,
    canSendEmail,
    refresh: mutate,
  }
}
