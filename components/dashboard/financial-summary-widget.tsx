"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Profile, Document } from "@/lib/types"
import { CURRENCIES } from "@/lib/types"

interface FinancialSummaryWidgetProps {
  profile: Profile | null
  documents: (Document & { line_items?: any[] })[]
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function getFinancialYearDates(financialYearStartMonth: number) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // 1-12

  // If current month >= FY start month, FY started this calendar year
  // Otherwise, FY started last calendar year
  const fyStartYear = currentMonth >= financialYearStartMonth ? currentYear : currentYear - 1
  const fyEndYear = fyStartYear + 1

  const startDate = new Date(fyStartYear, financialYearStartMonth - 1, 1) // Month is 0-indexed
  const endDate = new Date(fyEndYear, financialYearStartMonth - 1, 0) // Last day of previous month

  return { startDate, endDate, startYear: fyStartYear, endYear: fyEndYear }
}

function getFinancialYearLabel(startMonth: number, startYear: number, endYear: number) {
  const startMonthName = MONTHS[startMonth - 1]
  return `FY ${startYear}-${String(endYear).slice(2)}`
}

export function FinancialSummaryWidget({ profile, documents }: FinancialSummaryWidgetProps) {
  const financialYearStart = profile?.financial_year_start || 4 // Default April

  const financialStats = useMemo(() => {
    const { startDate, endDate, startYear, endYear } = getFinancialYearDates(financialYearStart)

    // Filter documents in current financial year that are "paid"
    const paidInvoices = documents.filter((doc) => {
      const issueDate = new Date(doc.issue_date)
      return (
        doc.type === "invoice" &&
        doc.status === "paid" &&
        issueDate >= startDate &&
        issueDate <= endDate
      )
    })

    // All invoices (sent, paid, overdue) in current financial year
    const allInvoices = documents.filter((doc) => {
      const issueDate = new Date(doc.issue_date)
      return (
        doc.type === "invoice" &&
        ["sent", "paid", "overdue"].includes(doc.status) &&
        issueDate >= startDate &&
        issueDate <= endDate
      )
    })

    // Group by currency
    const paidByCurrency: Record<string, { total: number; count: number }> = {}
    const totalByCurrency: Record<string, { total: number; count: number }> = {}

    paidInvoices.forEach((doc) => {
      const currency = doc.currency || "INR"
      if (!paidByCurrency[currency]) {
        paidByCurrency[currency] = { total: 0, count: 0 }
      }
      paidByCurrency[currency].total += Number(doc.grand_total || 0)
      paidByCurrency[currency].count += 1
    })

    allInvoices.forEach((doc) => {
      const currency = doc.currency || "INR"
      if (!totalByCurrency[currency]) {
        totalByCurrency[currency] = { total: 0, count: 0 }
      }
      totalByCurrency[currency].total += Number(doc.grand_total || 0)
      totalByCurrency[currency].count += 1
    })

    const fyLabel = getFinancialYearLabel(financialYearStart, startYear, endYear)

    return {
      paidByCurrency,
      totalByCurrency,
      fyLabel,
    }
  }, [documents, financialYearStart])

  // Format amount in Indian number system (lakhs)
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const getCurrencySymbol = (currency: string) => {
    return CURRENCIES.find((c) => c.value === currency)?.symbol || "₹"
  }

  const allCurrencies = Array.from(
    new Set([...Object.keys(financialStats.paidByCurrency), ...Object.keys(financialStats.totalByCurrency)])
  ).sort()

  if (allCurrencies.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-32">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Total Receipts
            </p>
            <p className="text-2xl md:text-3xl font-black text-foreground">₹0.00</p>
            <p className="text-xs text-muted-foreground mt-2">0 paid invoices</p>
            <p className="text-[10px] text-muted-foreground/80 mt-1">{financialStats.fyLabel}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-32">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Total Sales
            </p>
            <p className="text-2xl md:text-3xl font-black text-foreground">₹0.00</p>
            <p className="text-xs text-muted-foreground mt-2">0 invoices</p>
            <p className="text-[10px] text-muted-foreground/80 mt-1">{financialStats.fyLabel}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {allCurrencies.map((currency) => {
        const paidData = financialStats.paidByCurrency[currency] || { total: 0, count: 0 }
        const totalData = financialStats.totalByCurrency[currency] || { total: 0, count: 0 }
        const symbol = getCurrencySymbol(currency)

        return (
          <div key={currency} className="space-y-2">
            {/* Total Paid */}
            <Card className="border-border bg-card">
              <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-32">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Total Receipts ({currency})
                </p>
                <p className="text-2xl md:text-3xl font-black text-foreground">
                  {symbol}{formatAmount(paidData.total)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {paidData.count} paid invoice{paidData.count !== 1 ? "s" : ""}
                </p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">
                  {financialStats.fyLabel}
                </p>
              </CardContent>
            </Card>

            {/* Total Sales */}
            <Card className="border-border bg-card">
              <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-32">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Total Sales ({currency})
                </p>
                <p className="text-2xl md:text-3xl font-black text-foreground">
                  {symbol}{formatAmount(totalData.total)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {totalData.count} invoice{totalData.count !== 1 ? "s" : ""}
                </p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">
                  {financialStats.fyLabel}
                </p>
              </CardContent>
            </Card>
          </div>
        )
      })}

      {/* Collection Rate - All Currencies */}
      <Card className="border-border bg-card md:col-span-1">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-32">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Collection Rate
          </p>
          <p className="text-2xl md:text-3xl font-black text-foreground">
            {(() => {
              const totalPaid = Object.values(financialStats.paidByCurrency).reduce((sum, data) => sum + data.count, 0)
              const totalInvoices = Object.values(financialStats.totalByCurrency).reduce((sum, data) => sum + data.count, 0)
              return totalInvoices > 0 ? Math.round((totalPaid / totalInvoices) * 100) : 0
            })}%
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {(() => {
              const totalPaid = Object.values(financialStats.paidByCurrency).reduce((sum, data) => sum + data.count, 0)
              const totalInvoices = Object.values(financialStats.totalByCurrency).reduce((sum, data) => sum + data.count, 0)
              return `${totalPaid} of ${totalInvoices} paid`
            })}
          </p>
          <p className="text-[10px] text-muted-foreground/80 mt-1">
            {financialStats.fyLabel}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
