"use client"

import { useSubscription } from "@/hooks/use-subscription"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function UsagePage() {
  const { subscription, usage, plan, isLoading } = useSubscription()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    router.refresh()
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const invoicePercent = plan?.limits.invoicesPerMonth === -1 
    ? 0 
    : Math.min(100, ((usage?.invoices_created || 0) / (plan?.limits.invoicesPerMonth || 1)) * 100)
  
  const quotationPercent = plan?.limits.quotationsPerMonth === -1 
    ? 0 
    : Math.min(100, ((usage?.quotations_created || 0) / (plan?.limits.quotationsPerMonth || 1)) * 100)

  const emailPercent = plan?.limits.emailsPerMonth === -1 
    ? 0 
    : Math.min(100, ((usage?.emails_sent || 0) / (plan?.limits.emailsPerMonth || 1)) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usage</h1>
          <p className="text-muted-foreground">Monitor your monthly usage and limits</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {subscription?.plan === "free" && (
            <Button asChild>
              <Link href="/dashboard/pricing">Upgrade to Pro</Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan: {subscription?.plan === "pro" ? "Pro" : "Free"}</CardTitle>
          <CardDescription>
            {subscription?.plan === "pro" 
              ? "You have unlimited access to all features" 
              : "Upgrade to Pro for unlimited usage"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoices */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Invoices this month</span>
              <span className="font-medium">
                {usage?.invoices_created || 0} / {plan?.limits.invoicesPerMonth === -1 ? "Unlimited" : plan?.limits.invoicesPerMonth}
              </span>
            </div>
            {plan?.limits.invoicesPerMonth !== -1 && (
              <Progress value={invoicePercent} className="h-2" />
            )}
            {plan?.limits.invoicesPerMonth === -1 && (
              <div className="h-2 bg-primary/20 rounded-full">
                <div className="h-full bg-primary rounded-full w-full" />
              </div>
            )}
          </div>

          {/* Quotations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Quotations this month</span>
              <span className="font-medium">
                {usage?.quotations_created || 0} / {plan?.limits.quotationsPerMonth === -1 ? "Unlimited" : plan?.limits.quotationsPerMonth}
              </span>
            </div>
            {plan?.limits.quotationsPerMonth !== -1 && (
              <Progress value={quotationPercent} className="h-2" />
            )}
            {plan?.limits.quotationsPerMonth === -1 && (
              <div className="h-2 bg-primary/20 rounded-full">
                <div className="h-full bg-primary rounded-full w-full" />
              </div>
            )}
          </div>

          {/* Emails */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Emails sent this month</span>
              <span className="font-medium">
                {usage?.emails_sent || 0} / {plan?.limits.emailsPerMonth === -1 ? "Unlimited" : plan?.limits.emailsPerMonth}
              </span>
            </div>
            {plan?.limits.emailsPerMonth !== -1 && (
              <Progress value={emailPercent} className="h-2" />
            )}
            {plan?.limits.emailsPerMonth === -1 && (
              <div className="h-2 bg-primary/20 rounded-full">
                <div className="h-full bg-primary rounded-full w-full" />
              </div>
            )}
          </div>

          {/* Clients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Clients</span>
              <span className="font-medium">
                {plan?.limits.clients === -1 ? "Unlimited" : `Up to ${plan?.limits.clients}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {subscription?.plan === "free" && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>Get unlimited invoices, quotations, emails, and more</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/pricing">View Pricing</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
