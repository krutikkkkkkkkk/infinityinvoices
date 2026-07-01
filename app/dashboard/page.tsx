import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, ArrowRight01Icon, Invoice01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Document, CURRENCIES } from "@/lib/types"
import { StatusSelect } from "@/components/dashboard/status-select"

import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { ReceivablesWidget } from "@/components/dashboard/receivables-widget"
import { ProfileCompletionCard, ProfileCompletionBanner } from "@/components/dashboard/profile-completion-card"
import { FinancialSummaryWidget } from "@/components/dashboard/financial-summary-widget"

function formatCurrency(amount: number, currency: string) {
  const currencyData = CURRENCIES.find((c) => c.value === currency)
  return `${currencyData?.symbol || ""}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Fetch user profile for completion card
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch stats
  const { data: paidInvoices } = await supabase
    .from("documents")
    .select("grand_total, currency")
    .eq("type", "invoice")
    .eq("status", "paid")
    .eq("user_id", user.id)

  const { data: allInvoices } = await supabase
    .from("documents")
    .select("grand_total, currency, status")
    .eq("type", "invoice")
    .in("status", ["sent", "paid", "overdue"])
    .eq("user_id", user.id)

  // Group revenue by currency (paid only)
  const revenueByCategory = paidInvoices?.reduce((acc, inv) => {
    const currency = inv.currency || "INR"
    const existing = acc.find((r) => r.currency === currency)
    if (existing) {
      existing.paid += Number(inv.grand_total)
    } else {
      acc.push({ currency, total: 0, paid: Number(inv.grand_total) })
    }
    return acc
  }, [] as { currency: string; total: number; paid: number }[]) || []

  // Add total invoices to revenue data
  allInvoices?.forEach((inv) => {
    const currency = inv.currency || "INR"
    const existing = revenueByCategory.find((r) => r.currency === currency)
    if (existing) {
      existing.total += Number(inv.grand_total)
    } else {
      revenueByCategory.push({ currency, total: Number(inv.grand_total), paid: 0 })
    }
  })

  // Fetch analytics data (last year)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  const { data: analyticsData } = await supabase
    .from("documents")
    .select("grand_total, status, issue_date, currency")
    .eq("type", "invoice")
    .eq("user_id", user.id)
    .gte("issue_date", oneYearAgo.toISOString().split("T")[0])
    .order("issue_date", { ascending: true })

  // Get primary currency for chart (most used)
  // Use user's default currency from profile, fallback to INR
  const primaryCurrency = profile?.default_currency || "INR"

  // Helper to process data by period
  const processDataByPeriod = (
    data: typeof analyticsData, 
    periodFn: (date: Date) => string,
    filterDays?: number
  ) => {
    const cutoffDate = filterDays ? new Date(Date.now() - filterDays * 24 * 60 * 60 * 1000) : null
    
    return data?.filter(doc => {
      if (!cutoffDate) return true
      return new Date(doc.issue_date) >= cutoffDate
    }).reduce((acc, doc) => {
      const date = new Date(doc.issue_date)
      const periodKey = periodFn(date)
      const amount = Number(doc.grand_total)
      
      const existing = acc.find((m) => m.period === periodKey)
      if (existing) {
        existing.revenue += amount
        existing.invoices += 1
        if (doc.status === "paid") existing.paid += amount
      } else {
        acc.push({
          period: periodKey,
          revenue: amount,
          invoices: 1,
          paid: doc.status === "paid" ? amount : 0,
        })
      }
      return acc
    }, [] as { period: string; revenue: number; invoices: number; paid: number }[]) || []
  }

  // Process data for different time periods
  const chartData = {
    month: processDataByPeriod(
      analyticsData, 
      (d) => d.toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
      30
    ),
    quarter: processDataByPeriod(
      analyticsData, 
      (d) => d.toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
      90
    ),
    year: processDataByPeriod(
      analyticsData, 
      (d) => d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    ),
  }

  // Calculate stats based on invoice counts
  const analyticsStats = {
    totalInvoices: analyticsData?.length || 0,
    paidInvoices: analyticsData?.filter(d => d.status === "paid").length || 0,
    pendingInvoices: analyticsData?.filter(d => d.status === "sent" || d.status === "draft").length || 0,
    overdueInvoices: analyticsData?.filter(d => d.status === "overdue").length || 0,
  }

  // Fetch receivables (unpaid/overdue invoices with due dates)
  const today = new Date()
  const { data: receivableInvoices } = await supabase
    .from("documents")
    .select("grand_total, currency, due_date, status, include_tax")
    .eq("type", "invoice")
    .eq("user_id", user.id)
    .in("status", ["draft", "sent", "overdue"])
    .not("due_date", "is", null)

  function calcReceivables(invoices: typeof receivableInvoices) {
    const result = { current: 0, overdue1to15: 0, overdue16to30: 0, overdue31to45: 0, overdueAbove45: 0, total: 0 }
    if (!invoices) return result
    for (const inv of invoices) {
      const amount = Number(inv.grand_total)
      const due = new Date(inv.due_date!)
      const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
      result.total += amount
      if (diffDays <= 0) result.current += amount
      else if (diffDays <= 15) result.overdue1to15 += amount
      else if (diffDays <= 30) result.overdue16to30 += amount
      else if (diffDays <= 45) result.overdue31to45 += amount
      else result.overdueAbove45 += amount
    }
    return result
  }

  const receivables = {
    all: calcReceivables(receivableInvoices),
    taxed: calcReceivables(receivableInvoices?.filter((i) => i.include_tax !== false)),
    noTax: calcReceivables(receivableInvoices?.filter((i) => i.include_tax === false)),
  }

  // Group receivables by currency
  const receivablesByCurrency: Record<string, { all: any; taxed: any; noTax: any }> = {}
  if (receivableInvoices && receivableInvoices.length > 0) {
    for (const currency of new Set(receivableInvoices.map(inv => inv.currency || "INR"))) {
      const invoicesForCurrency = receivableInvoices.filter(inv => (inv.currency || "INR") === currency)
      receivablesByCurrency[currency] = {
        all: calcReceivables(invoicesForCurrency),
        taxed: calcReceivables(invoicesForCurrency.filter((i) => i.include_tax !== false)),
        noTax: calcReceivables(invoicesForCurrency.filter((i) => i.include_tax === false)),
      }
    }
  }

  const receivablesCurrency = receivableInvoices?.[0]?.currency || primaryCurrency

  // Auto-update overdue documents
  const todayStr = today.toISOString().split("T")[0]
  await supabase
    .from("documents")
    .update({ status: "overdue" })
    .eq("user_id", user.id)
    .lt("due_date", todayStr)
    .in("status", ["sent", "draft"])
    .not("due_date", "is", null)

  // Fetch recent documents
  const { data: recentDocuments } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch all documents for financial summary
  const { data: allDocuments } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("issue_date", { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your invoicing activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/documents/new?type=invoice">
              <HugeiconsIcon icon={Add01Icon} size={16} data-icon="inline-start" />
              New Invoice
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard/documents/new?type=quotation">
              <HugeiconsIcon icon={Add01Icon} size={16} data-icon="inline-start" />
              New Quotation
            </Link>
          </Button>
        </div>
      </div>

      {/* Unlimited Access Banner */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 border border-purple-200">
        <Zap className="h-4 w-4 text-purple-600 flex-shrink-0" />
        <span className="text-sm text-purple-900"><span className="font-semibold">Unlimited access</span> till limited time</span>
      </div>

      {/* Profile Completion Banner */}
      <ProfileCompletionBanner profile={profile} />

      {/* Profile Completion Card */}
      <ProfileCompletionCard profile={profile} />

      {/* Financial Summary Widget */}
      <FinancialSummaryWidget profile={profile} documents={allDocuments || []} />

      {/* Receivables Widget */}
      <ReceivablesWidget
        all={receivables.all}
        taxed={receivables.taxed}
        noTax={receivables.noTax}
        currency={receivablesCurrency}
        receivablesByCurrency={receivablesByCurrency}
      />

      {/* Chart */}
      <AnalyticsChart data={chartData} currency={primaryCurrency} stats={analyticsStats} />

      {/* Recent Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-medium">Recent Documents</CardTitle>
            <CardDescription>Your latest invoices and quotations</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/invoices" className="gap-1">
              View all
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentDocuments && recentDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentDocuments as Document[]).map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/documents/${doc.id}`}
                        className="hover:underline"
                      >
                        {doc.number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.client_name || "-"}
                    </TableCell>
                    <TableCell>
                      <StatusSelect 
                        documentId={doc.id} 
                        currentStatus={doc.status} 
                        compact 
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(doc.grand_total), doc.currency)}
                    </TableCell>
                    <TableCell>
                      {doc.due_date ? (
                        <span className={
                          new Date(doc.due_date) < new Date() && doc.status !== "paid" 
                            ? "text-destructive" 
                            : "text-muted-foreground"
                        }>
                          {new Date(doc.due_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
                <HugeiconsIcon icon={Invoice01Icon} size={24} className="text-muted-foreground" />
              </div>
              <h3 className="font-medium">No documents yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Create your first invoice to get started
              </p>
              <Button asChild>
                <Link href="/dashboard/documents/new?type=invoice">
                  Create Invoice
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
