"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { CURRENCIES } from "@/lib/types"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface ReceivablesData {
  current: number
  overdue1to15: number
  overdue16to30: number
  overdue31to45: number
  overdueAbove45: number
  total: number
}

interface ReceivablesByCurrency {
  [currency: string]: {
    all: ReceivablesData
    taxed: ReceivablesData
    noTax: ReceivablesData
  }
}

interface ReceivablesWidgetProps {
  all: ReceivablesData
  taxed: ReceivablesData
  noTax: ReceivablesData
  currency: string
  receivablesByCurrency?: ReceivablesByCurrency
}

type Tab = "all" | "taxed" | "no-tax"

function formatCurrency(amount: number, currency: string) {
  const currencyData = CURRENCIES.find((c) => c.value === currency)
  return `${currencyData?.symbol || ""}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function ReceivablesWidget({ all, taxed, noTax, currency, receivablesByCurrency }: ReceivablesWidgetProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [activeCurrency, setActiveCurrency] = useState<string>(currency)

  console.log("[v0] ReceivablesWidget props:", { 
    all, 
    currency, 
    receivablesByCurrency,
    currenciesToDisplay: receivablesByCurrency ? Object.keys(receivablesByCurrency) : [currency]
  })

  // If multi-currency data is available, use it; otherwise fall back to single currency
  const currenciesToDisplay = receivablesByCurrency ? Object.keys(receivablesByCurrency) : [currency]
  const isMultiCurrency = currenciesToDisplay.length > 1

  const getReceivablesData = (curr: string, tab: Tab) => {
    if (receivablesByCurrency && receivablesByCurrency[curr]) {
      return tab === "all" ? receivablesByCurrency[curr].all : tab === "taxed" ? receivablesByCurrency[curr].taxed : receivablesByCurrency[curr].noTax
    }
    return tab === "all" ? all : tab === "taxed" ? taxed : noTax
  }

  const data = getReceivablesData(activeCurrency, activeTab)

  const segments = [
    { value: data.current, color: "bg-foreground/20", label: "Current" },
    { value: data.overdue1to15, color: "bg-foreground/35", label: "1-15 Days" },
    { value: data.overdue16to30, color: "bg-foreground/50", label: "16-30 Days" },
    { value: data.overdue31to45, color: "bg-foreground/65", label: "31-45 Days" },
    { value: data.overdueAbove45, color: "bg-foreground/80", label: "Above 45" },
  ]

  const total = data.total || 1

  return (
    <Card>
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-row items-center justify-between">
          <h3 className="font-semibold text-base">Total Receivables</h3>
          <Button asChild size="sm" variant="outline" className="gap-1 h-7 text-xs">
            <Link href="/dashboard/documents/new?type=invoice">
              <HugeiconsIcon icon={Add01Icon} size={12} />
              New
            </Link>
          </Button>
        </div>

        {/* Currency and Type Tabs */}
        <div className="flex flex-col sm:flex-row gap-2">
          {isMultiCurrency && (
            <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
              {currenciesToDisplay.map((curr) => (
                <button
                  key={curr}
                  onClick={() => setActiveCurrency(curr)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeCurrency === curr
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          )}

          {/* Type Tabs */}
          <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
            {(["all", "taxed", "no-tax"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "all" ? "All" : tab === "taxed" ? "With Tax" : "No Tax"}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total amount */}
        <p className="text-sm font-medium text-foreground">
          Total Receivables {formatCurrency(data.total, activeCurrency)}
        </p>

        {/* Progress bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {segments.map((seg, i) => {
            const pct = total > 0 ? (seg.value / total) * 100 : 0
            if (pct <= 0) return null
            return (
              <div
                key={i}
                className={`${seg.color} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${seg.label}: ${formatCurrency(seg.value, activeCurrency)}`}
              />
            )
          })}
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">CURRENT</p>
            <p className="text-base font-semibold">{formatCurrency(data.current, activeCurrency)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">OVERDUE</p>
            <p className="text-base font-semibold">{formatCurrency(data.overdue1to15, activeCurrency)}</p>
            <p className="text-xs text-muted-foreground">1-15 Days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">&nbsp;</p>
            <p className="text-base font-semibold">{formatCurrency(data.overdue16to30, activeCurrency)}</p>
            <p className="text-xs text-muted-foreground">16-30 Days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">&nbsp;</p>
            <p className="text-base font-semibold">{formatCurrency(data.overdue31to45, activeCurrency)}</p>
            <p className="text-xs text-muted-foreground">31-45 Days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">&nbsp;</p>
            <p className="text-base font-semibold">{formatCurrency(data.overdueAbove45, activeCurrency)}</p>
            <p className="text-xs text-muted-foreground">Above 45 days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
