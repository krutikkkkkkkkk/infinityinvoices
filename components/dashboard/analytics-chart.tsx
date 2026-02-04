"use client"

import { useState } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  Area,
  AreaChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CURRENCIES } from "@/lib/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { InvoiceIcon, CheckmarkCircle02Icon, Clock01Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"

interface ChartDataPoint {
  period: string
  invoices: number
  revenue: number
  paid: number
}

interface AnalyticsChartProps {
  data: {
    month: ChartDataPoint[]
    quarter: ChartDataPoint[]
    year: ChartDataPoint[]
  }
  currency: string
  stats?: {
    totalInvoices: number
    paidInvoices: number
    pendingInvoices: number
    overdueInvoices: number
  }
}

type TimePeriod = "month" | "quarter" | "year"

export function AnalyticsChart({ data, currency, stats }: AnalyticsChartProps) {
  const [period, setPeriod] = useState<TimePeriod>("month")
  
  const currencyData = CURRENCIES.find((c) => c.value === currency)
  const symbol = currencyData?.symbol || ""

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#3b82f6",
    },
    paid: {
      label: "Paid",
      color: "#22c55e",
    },
    invoices: {
      label: "Invoices",
      color: "#8b5cf6",
    },
  }

  const currentData = data[period] || []
  const hasData = currentData.length > 0

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="text-sm font-semibold mb-2">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.dataKey === "revenue" ? "Revenue" : entry.dataKey === "paid" ? "Paid" : "Invoices"}: 
            {entry.dataKey === "invoices" ? ` ${entry.value}` : ` ${symbol}${Number(entry.value).toLocaleString()}`}
          </p>
        ))}
      </div>
    )
  }

  const FileText = InvoiceIcon
  const CheckCircle = CheckmarkCircle02Icon
  const Clock = Clock01Icon
  const AlertCircle = AlertCircleIcon

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <CardContent className="p-4">
            <div className="relative z-10">
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <p className="text-3xl font-bold mt-1">{stats?.totalInvoices || 0}</p>
            </div>
            <div className="absolute -right-3 -bottom-3">
              <HugeiconsIcon icon={InvoiceIcon} size={80} color="#cbd5e1" className="dark:text-slate-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 relative overflow-hidden">
          <CardContent className="p-4">
            <div className="relative z-10">
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-3xl font-bold mt-1 text-emerald-700 dark:text-emerald-400">{stats?.paidInvoices || 0}</p>
            </div>
            <div className="absolute -right-3 -bottom-3">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={80} color="#a7f3d0" className="dark:text-emerald-900" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 relative overflow-hidden">
          <CardContent className="p-4">
            <div className="relative z-10">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold mt-1 text-amber-700 dark:text-amber-400">{stats?.pendingInvoices || 0}</p>
            </div>
            <div className="absolute -right-3 -bottom-3">
              <HugeiconsIcon icon={Clock01Icon} size={80} color="#fde68a" className="dark:text-amber-900" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 relative overflow-hidden">
          <CardContent className="p-4">
            <div className="relative z-10">
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-3xl font-bold mt-1 text-rose-700 dark:text-rose-400">{stats?.overdueInvoices || 0}</p>
            </div>
            <div className="absolute -right-3 -bottom-3">
              <HugeiconsIcon icon={AlertCircleIcon} size={80} color="#fecdd3" className="dark:text-rose-900" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Selector */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
        <TabsList>
          <TabsTrigger value="month">30 Days</TabsTrigger>
          <TabsTrigger value="quarter">90 Days</TabsTrigger>
          <TabsTrigger value="year">1 Year</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Area Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue Overview</CardTitle>
            <CardDescription>Total vs Paid revenue in {currency}</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                      tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    />
                    <Tooltip content={customTooltip} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="paid"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="url(#colorPaid)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data available for this period
              </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">Total Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Paid</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Count Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Invoice Activity</CardTitle>
            <CardDescription>Number of invoices created</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                      allowDecimals={false}
                    />
                    <Tooltip content={customTooltip} />
                    <Bar
                      dataKey="invoices"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data available for this period
              </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-muted-foreground">Invoices</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
