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

  // Calculate totals across all currencies
  const totalPaidCount = Object.values(financialStats.paidByCurrency).reduce((sum, data) => sum + data.count, 0)
  const totalInvoiceCount = Object.values(financialStats.totalByCurrency).reduce((sum, data) => sum + data.count, 0)
  const collectionRate = totalInvoiceCount > 0 ? Math.round((totalPaidCount / totalInvoiceCount) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Main Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {/* Total Invoices */}
        <Card className="border-border bg-card">
          <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 flex flex-col items-center justify-center">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Total
            </p>
            <p className="text-lg sm:text-2xl font-black text-foreground">{totalInvoiceCount}</p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground/80 mt-1 text-center">{financialStats.fyLabel}</p>
          </CardContent>
        </Card>

        {/* Paid Invoices */}
        <Card className="border-border bg-card">
          <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 flex flex-col items-center justify-center">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Paid
            </p>
            <p className="text-lg sm:text-2xl font-black text-emerald-600">{totalPaidCount}</p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground/80 mt-1">invoices</p>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card className="border-border bg-card col-span-2 sm:col-span-1">
          <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 flex flex-col items-center justify-center">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Rate
            </p>
            <p className="text-lg sm:text-2xl font-black text-foreground">{collectionRate}%</p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground/80 mt-1">overall</p>
          </CardContent>
        </Card>
      </div>

      {/* Currency Breakdown */}
      {allCurrencies.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Revenue by Currency
            </p>
            <div className="space-y-2">
              {allCurrencies.map((currency) => {
                const paidData = financialStats.paidByCurrency[currency] || { total: 0, count: 0 }
                const totalData = financialStats.totalByCurrency[currency] || { total: 0, count: 0 }
                const symbol = getCurrencySymbol(currency)
                const currencyRate = totalData.count > 0 ? Math.round((paidData.count / totalData.count) * 100) : 0

                return (
                  <div key={currency} className="flex items-center justify-between p-2 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground">{currency}</span>
                        <span className="text-xs text-muted-foreground">{symbol}{formatAmount(totalData.total)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {paidData.count} of {totalData.count} paid ({currencyRate}%)
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
