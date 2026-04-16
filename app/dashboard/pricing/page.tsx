"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PLANS } from "@/lib/plans"
import { createClient } from "@/lib/supabase/client"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Loading01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function PricingPage() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const [subscription, setSubscription] = useState<{ plan: string; status: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function loadSubscription() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserEmail(user.email || null)
        const { data } = await supabase
          .from("subscriptions")
          .select("plan, status")
          .eq("user_id", user.id)
          .single()
        
        if (data) {
          setSubscription(data)
        }
      }
      setLoading(false)
    }
    loadSubscription()
  }, [])

  const currentPlan = subscription?.plan || "free"
  const proProductId = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <HugeiconsIcon icon={Loading01Icon} size={24} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-8">
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4 mb-8 text-center">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} className="text-green-600 mx-auto mb-2" />
          <p className="font-medium text-green-800 dark:text-green-200">
            Welcome to Pro! Your subscription is now active.
          </p>
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Simple pricing to help you manage your invoices better
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id
          const isPro = plan.id === "pro"
          const isLifetime = plan.id === "lifetime"

          return (
            <Card
              key={plan.id}
              className={`relative ${isLifetime ? "border-amber-400 shadow-lg md:scale-105" : isPro ? "border-primary shadow-lg" : ""}`}
            >
              {isLifetime && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900">
                  Best Value
                </Badge>
              )}
              {isPro && !isLifetime && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Recommended
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {isCurrentPlan && (
                    <Badge variant="secondary">Current Plan</Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${plan.priceInCents / 100}
                  </span>
                  {plan.priceInCents > 0 && (
                    <span className="text-muted-foreground">
                      /{plan.priceBillingCycle || "month"}
                    </span>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={18}
                        className="text-green-600 mt-0.5 shrink-0"
                      />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentPlan ? (
                  (isPro || isLifetime) ? (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      asChild
                    >
                      <Link href="/api/portal">
                        Manage Billing
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      Current Plan
                    </Button>
                  )
                ) : (isPro || isLifetime) && process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID ? (
                  <Button className={`w-full ${isLifetime ? "bg-amber-400 text-amber-900 hover:bg-amber-500" : ""}`} asChild>
                    <Link 
                      href={`/api/checkout?products=${isLifetime ? process.env.NEXT_PUBLIC_POLAR_LIFETIME_PRODUCT_ID : process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID}${userEmail ? `&customerEmail=${encodeURIComponent(userEmail)}` : ""}`}
                    >
                      {isLifetime ? "Get Lifetime Access" : "Upgrade to Pro"}
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    Configure Product ID
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {subscription?.plan === "pro" && (
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Thank you for being a Pro subscriber!{" "}
            <Link href="/api/portal" className="text-primary hover:underline">
              Manage your billing
            </Link>
          </p>
        </div>
      )}

      {subscription?.plan === "lifetime" && (
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Thank you for choosing Lifetime access! You have unlimited access forever.
          </p>
        </div>
      )}
    </div>
  )
}
