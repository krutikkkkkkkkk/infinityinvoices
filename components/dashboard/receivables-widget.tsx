"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

interface ReceivablesWidgetProps {
  all: ReceivablesData
  taxed: ReceivablesData
  noTax: ReceivablesData
  currency: string
}

type Tab = "all" | "taxed" | "no-tax"

function formatCurrency(amount: number, currency: string) {
  const currencyData = CURRENCIES.find((c) => c.value === currency)
  return `${currencyData?.symbol || ""}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function ReceivablesWidget({ all, taxed, noTax, currency }: ReceivablesWidgetProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all")

  const data = activeTab === "all" ? all : activeTab === "taxed" ? taxed : noTax

  const segments = [
    { value: data.current, color: "bg-foreground/25", label: "Current" },
    { value: data.overdue1to15, color: "bg-foreground/35", label: "1-15 Days" },
    { value: data.overdue16to30, color: "bg-foreground/45", label: "16-30 Days" },
    { value: data.overdue31to45, color: "bg-foreground/55", label: "31-45 Days" },
    { value: data.overdueAbove45, color: "bg-foreground/70", label: "Above 45" },
  ]

  const total = data.total || 1

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-base">Total Receivables</h3>
          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-md bg-muted p-0.5 text-sm">
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
        <Button asChild size="sm" variant="outline" className="gap-1 h-7 text-xs">
          <Link href="/dashboard/documents/new?type=invoice">
            <HugeiconsIcon icon={Add01Icon} size={12} />
            New
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total amount */}
        <p className="text-sm font-medium text-foreground">
          Total Receivables {formatCurrency(data.total, currency)}
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
                title={`${seg.label}: ${formatCurrency(seg.value, currency)}`}
              />
            )
          })}
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">CURRENT</p>
            <p className="text-base font-semibold">{formatCurrency(data.current, currency)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">OVERDUE</p>
            <p className="text-base font-semibold">{formatCurrency(data.overdue1to15, currency)}</p>
            <p className="text-xs text-muted-foreground">1-15 Days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">&nbsp;</p>
            <p className="text-base font-semibold">{formatCurrency(data.overdue16to30, currency)}</p>
            <p className="text-xs text-muted-foreground">16-30 Days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">&nbsp;</p>
            <p className="text-base font-semibold">{formatCurrency(data.overdue31to45, currency)}</p>
            <p className="text-xs text-muted-foreground">31-45 Days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">&nbsp;</p>
            <p className="text-base font-semibold">{formatCurrency(data.overdueAbove45, currency)}</p>
            <p className="text-xs text-muted-foreground">Above 45 days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
