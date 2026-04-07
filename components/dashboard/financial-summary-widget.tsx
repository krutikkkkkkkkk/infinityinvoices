"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Profile, Document } from "@/lib/types"
import { CURRENCIES } from "@/lib/types"
import { cn } from "@/lib/utils"

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

    const totalPaidAmount = paidInvoices.reduce((sum, doc) => sum + Number(doc.grand_total || 0), 0)
    const totalOverallAmount = allInvoices.reduce((sum, doc) => sum + Number(doc.grand_total || 0), 0)
    const paidCount = paidInvoices.length
    const totalCount = allInvoices.length

    const fyLabel = getFinancialYearLabel(financialYearStart, startYear, endYear)

    return {
      totalPaidAmount,
      totalOverallAmount,
      paidCount,
      totalCount,
      fyLabel,
    }
  }, [documents, financialYearStart])

  const currencySymbol = CURRENCIES.find((c) => c.value === (profile?.currency || "INR"))?.symbol || "₹"

  // Format amount in Indian number system (lakhs)
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Paid */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-32">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            Total Receipts
          </p>
          <p className="text-2xl md:text-3xl font-black text-blue-900 dark:text-blue-100">
            {currencySymbol}{formatAmount(financialStats.totalPaidAmount)}
          </p>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2">
            {financialStats.paidCount} paid invoice{financialStats.paidCount !== 1 ? "s" : ""}
          </p>
          <p className="text-[10px] text-blue-500/60 dark:text-blue-400/50 mt-1">
            {financialStats.fyLabel}
          </p>
        </CardContent>
      </Card>

      {/* Total Sales */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200/50 dark:border-amber-800/50">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-32">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            Total Sales
          </p>
          <p className="text-2xl md:text-3xl font-black text-amber-900 dark:text-amber-100">
            {currencySymbol}{formatAmount(financialStats.totalOverallAmount)}
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-2">
            {financialStats.totalCount} invoice{financialStats.totalCount !== 1 ? "s" : ""}
          </p>
          <p className="text-[10px] text-amber-500/60 dark:text-amber-400/50 mt-1">
            {financialStats.fyLabel}
          </p>
        </CardContent>
      </Card>

      {/* Collection Rate */}
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/50">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-32">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            Collection Rate
          </p>
          <p className="text-2xl md:text-3xl font-black text-emerald-900 dark:text-emerald-100">
            {financialStats.totalCount > 0
              ? Math.round((financialStats.paidCount / financialStats.totalCount) * 100)
              : 0}%
          </p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-2">
            {financialStats.paidCount} of {financialStats.totalCount} paid
          </p>
          <p className="text-[10px] text-emerald-500/60 dark:text-emerald-400/50 mt-1">
            {financialStats.fyLabel}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
