"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

interface UsageWidgetProps {
  plan: string
  invoicesUsed: number
  invoicesLimit: number
}

export function UsageWidget({ plan, invoicesUsed, invoicesLimit }: UsageWidgetProps) {
  const isFreePlan = plan === "free"
  const isLimitReached = invoicesUsed >= invoicesLimit
  const percentageUsed = invoicesLimit === -1 ? 0 : Math.round((invoicesUsed / invoicesLimit) * 100)

  // Only show for free plan or when limit is reached
  if (!isFreePlan && !isLimitReached) {
    return null
  }

  return (
    <Card className={isLimitReached ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {isLimitReached && <AlertCircle className="h-4 w-4 text-orange-600" />}
          {isLimitReached ? "Invoice Limit Reached" : "Invoice Usage"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invoicesLimit === -1 ? (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Unlimited Invoices</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invoices used this month</span>
                <span className="font-medium">
                  {invoicesUsed} / {invoicesLimit}
                </span>
              </div>
              <Progress
                value={percentageUsed}
                className="h-2"
              />
            </div>

            {isLimitReached && (
              <div className="space-y-3 pt-2">
                <p className="text-sm text-orange-900">
                  You've reached your monthly invoice limit. Upgrade to Pro to create unlimited invoices.
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
              </div>
            )}

            {!isLimitReached && invoicesUsed >= invoicesLimit - 1 && (
              <div className="space-y-3 pt-2">
                <p className="text-sm text-blue-900">
                  You're close to your monthly limit. Upgrade to Pro for unlimited invoices.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/pricing">View Plans</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
