"use client"

import useSWR from "swr"
import { getSubscriptionData } from "@/app/actions/subscription"
import { getPlanForSubscription, hasPaidPlan, type Plan } from "@/lib/plans"

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

const fetchSubscriptionData = (): Promise<SubscriptionData> => getSubscriptionData()

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
  const plan: Plan = getPlanForSubscription(subscription)

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

  const isPro = hasPaidPlan(subscription)
  const isLifetime = isPro && subscription?.plan === "lifetime"

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
