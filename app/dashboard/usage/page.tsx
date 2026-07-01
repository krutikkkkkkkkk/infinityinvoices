"use client"

import { useSubscription } from "@/hooks/use-subscription"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState } from "react"

export default function UsagePage() {
  const { usage, isLoading, refresh } = useSubscription()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Usage</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Track your activity - everything is unlimited</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan: Free</CardTitle>
          <CardDescription>You have unlimited access to all features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Invoices */}
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Invoices Created</p>
              <p className="text-lg sm:text-xl font-bold">{usage?.invoices_created || 0}</p>
            </div>

            {/* Quotations */}
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Quotations Created</p>
              <p className="text-lg sm:text-xl font-bold">{usage?.quotations_created || 0}</p>
            </div>

            {/* Emails */}
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Emails Sent</p>
              <p className="text-lg sm:text-xl font-bold">{usage?.emails_sent || 0}</p>
            </div>

            {/* Downloads */}
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">PDFs Downloaded</p>
              <p className="text-lg sm:text-xl font-bold">{usage?.pdfs_downloaded || 0}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center justify-between text-sm">
              <span>Invoices</span>
              <Badge variant="secondary">Unlimited</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Quotations</span>
              <Badge variant="secondary">Unlimited</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Emails</span>
              <Badge variant="secondary">Unlimited</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Downloads</span>
              <Badge variant="secondary">Unlimited</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
