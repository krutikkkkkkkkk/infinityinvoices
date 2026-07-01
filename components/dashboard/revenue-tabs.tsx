"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CURRENCIES } from "@/lib/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoneyBag02Icon } from "@hugeicons/core-free-icons"

interface RevenueData {
  currency: string
  total: number
  paid: number
}

interface RevenueTabsProps {
  revenueByCategory: RevenueData[]
}

function formatCurrency(amount: number, currency: string) {
  const currencyData = CURRENCIES.find((c) => c.value === currency)
  return `${currencyData?.symbol || ""}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function RevenueTabs({ revenueByCategory }: RevenueTabsProps) {
  const activeCurrencies = revenueByCategory.filter((r) => r.total > 0)
  const defaultCurrency = activeCurrencies[0]?.currency || "INR"

  if (activeCurrencies.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-chart-1/10">
              <HugeiconsIcon icon={MoneyBag02Icon} size={20} className="text-chart-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-semibold">₹0.00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activeCurrencies.length === 1) {
    const revenue = activeCurrencies[0]
    return (
      <Card className="col-span-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-chart-1/10">
                <HugeiconsIcon icon={MoneyBag02Icon} size={20} className="text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-semibold">{formatCurrency(revenue.total, revenue.currency)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(revenue.paid, revenue.currency)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-chart-1/10">
            <HugeiconsIcon icon={MoneyBag02Icon} size={20} className="text-chart-1" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
            <Tabs defaultValue={defaultCurrency}>
              <TabsList className="h-8 mb-2">
                {activeCurrencies.map((revenue) => (
                  <TabsTrigger 
                    key={revenue.currency} 
                    value={revenue.currency} 
                    className="text-xs px-3"
                  >
                    {revenue.currency}
                  </TabsTrigger>
                ))}
              </TabsList>
              {activeCurrencies.map((revenue) => (
                <TabsContent key={revenue.currency} value={revenue.currency} className="mt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Invoices:</span>
                      <p className="text-2xl font-semibold">{formatCurrency(revenue.total, revenue.currency)}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Paid:</span>
                      <p className="text-xl font-semibold text-emerald-600">{formatCurrency(revenue.paid, revenue.currency)}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Outstanding:</span>
                      <p className="text-xl font-semibold text-orange-600">{formatCurrency(revenue.total - revenue.paid, revenue.currency)}</p>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
