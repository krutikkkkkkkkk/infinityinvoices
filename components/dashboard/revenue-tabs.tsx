"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CURRENCIES } from "@/lib/types"

interface RevenueData {
  currency: string
  total: number
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
  // Filter out currencies with zero revenue
  const activeCurrencies = revenueByCategory.filter((r) => r.total > 0)
  
  // Default to first currency with revenue, or INR
  const defaultCurrency = activeCurrencies[0]?.currency || "INR"

  if (activeCurrencies.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹0.00</div>
          <p className="text-xs text-muted-foreground mt-1">No paid invoices yet</p>
        </CardContent>
      </Card>
    )
  }

  if (activeCurrencies.length === 1) {
    const revenue = activeCurrencies[0]
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(revenue.total, revenue.currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">From paid invoices</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1 sm:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Revenue
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue={defaultCurrency} className="w-full">
          <div className="overflow-x-auto -mx-1 px-1">
            <TabsList className="inline-flex h-9 w-max min-w-full justify-start gap-1 p-1">
              {activeCurrencies.map((revenue) => (
                <TabsTrigger 
                  key={revenue.currency} 
                  value={revenue.currency} 
                  className="text-xs px-3 whitespace-nowrap"
                >
                  {revenue.currency}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {activeCurrencies.map((revenue) => (
            <TabsContent key={revenue.currency} value={revenue.currency} className="mt-2">
              <div className="text-2xl font-bold">
                {formatCurrency(revenue.total, revenue.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Paid invoices in {revenue.currency}
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
