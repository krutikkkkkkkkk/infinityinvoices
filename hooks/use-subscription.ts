"use client"

import { useEffect, useState } from "react"
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

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // Fetch subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single()

      setSubscription(sub || { plan: "free", status: "active" })

      // Fetch usage for current month
      const monthYear = new Date().toISOString().slice(0, 7)
      const { data: usageData } = await supabase
        .from("usage_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("month_year", monthYear)
        .single()

      setUsage(usageData || { invoices_created: 0, quotations_created: 0, emails_sent: 0 })
      setLoading(false)
    }

    fetchData()
  }, [])

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

  const isPro = subscription?.plan === "pro" && subscription?.status === "active"

  return {
    subscription,
    usage,
    plan,
    loading,
    isLoading: loading,
    isPro,
    canCreateInvoice,
    canCreateQuotation,
    canSendEmail,
  }
}
