import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import { InvoiceIcon, Files01Icon, UserGroupIcon, Clock01Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Document, CURRENCIES } from "@/lib/types"
import { StatusSelect } from "@/components/dashboard/status-select"
import { RevenueTabs } from "@/components/dashboard/revenue-tabs"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"

function formatCurrency(amount: number, currency: string) {
  const currencyData = CURRENCIES.find((c) => c.value === currency)
  return `${currencyData?.symbol || ""}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    sent: "default",
    paid: "default",
    overdue: "destructive",
    cancelled: "outline",
  }
  const labels: Record<string, string> = {
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    overdue: "Overdue",
    cancelled: "Cancelled",
  }
  return (
    <Badge variant={variants[status] || "secondary"}>
      {labels[status] || status}
    </Badge>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Fetch stats
  const { count: totalInvoices } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("type", "invoice")

  const { count: totalQuotations } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("type", "quotation")

  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })

  const { data: paidInvoices } = await supabase
    .from("documents")
    .select("grand_total, currency")
    .eq("type", "invoice")
    .eq("status", "paid")

  // Group revenue by currency
  const revenueByCategory = paidInvoices?.reduce((acc, inv) => {
    const currency = inv.currency || "INR"
    const existing = acc.find((r) => r.currency === currency)
    if (existing) {
      existing.total += Number(inv.grand_total)
    } else {
      acc.push({ currency, total: Number(inv.grand_total) })
    }
    return acc
  }, [] as { currency: string; total: number }[]) || []

  const { count: pendingCount } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("type", "invoice")
    .in("status", ["sent", "draft"])

  // Fetch analytics data (last year)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  const { data: analyticsData } = await supabase
    .from("documents")
    .select("grand_total, status, issue_date, currency")
    .eq("type", "invoice")
    .gte("issue_date", oneYearAgo.toISOString().split("T")[0])
    .order("issue_date", { ascending: true })

  // Get primary currency for chart (most used)
  const primaryCurrency = revenueByCategory.length > 0 
    ? revenueByCategory.reduce((a, b) => a.total > b.total ? a : b).currency 
    : "INR"

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

  

  // Calculate stats based on invoice counts (not amounts, since currencies differ)
  const analyticsStats = {
    totalInvoices: analyticsData?.length || 0,
    paidInvoices: analyticsData?.filter(d => d.status === "paid").length || 0,
    pendingInvoices: analyticsData?.filter(d => d.status === "sent" || d.status === "draft").length || 0,
    overdueInvoices: analyticsData?.filter(d => d.status === "overdue").length || 0,
  }

  // Auto-update overdue documents BEFORE fetching
  const today = new Date().toISOString().split("T")[0]
  if (user) {
    await supabase
      .from("documents")
      .update({ status: "overdue" })
      .eq("user_id", user.id)
      .lt("due_date", today)
      .in("status", ["sent", "draft"])
      .not("due_date", "is", null)
  }

  // Fetch recent documents (after status update)
  const { data: recentDocuments } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your business.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/documents/new?type=invoice">
              <HugeiconsIcon icon={Files01Icon} size={16} className="mr-2" />
              New Invoice
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/documents/new?type=quotation">
              <HugeiconsIcon icon={Files01Icon} size={16} className="mr-2" />
              New Quotation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RevenueTabs revenueByCategory={revenueByCategory} />
      </div>

      {/* Analytics Chart */}
      <div className="grid gap-4">
        <AnalyticsChart data={chartData} currency={primaryCurrency} stats={analyticsStats} />
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Documents</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/invoices">
              View all <HugeiconsIcon icon={ArrowRight02Icon} size={16} className="ml-1" />
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
                  <TableHead>Issue Date</TableHead>
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
                    <TableCell className="capitalize">{doc.type}</TableCell>
                    <TableCell>{doc.client_name || "-"}</TableCell>
                    <TableCell>
                      <StatusSelect 
                        documentId={doc.id} 
                        currentStatus={doc.status} 
                        compact 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(doc.grand_total), doc.currency)}
                    </TableCell>
                    <TableCell>
                      {new Date(doc.issue_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {doc.due_date ? (
                        <span className={
                          new Date(doc.due_date) < new Date() && doc.status !== "paid" 
                            ? "text-destructive font-medium" 
                            : ""
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
              <HugeiconsIcon icon={InvoiceIcon} size={48} className="text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No documents yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Create your first invoice or quotation to get started.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/dashboard/documents/new?type=invoice">
                    Create Invoice
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/documents/new?type=quotation">
                    Create Quotation
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
