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
    [currency: string]: {
      month: ChartDataPoint[]
      quarter: ChartDataPoint[]
      year: ChartDataPoint[]
    }
  }
  currencies: string[]
  defaultCurrency: string
  stats?: {
    totalInvoices: number
    paidInvoices: number
    pendingInvoices: number
    overdueInvoices: number
  }
}

type TimePeriod = "month" | "quarter" | "year"

export function AnalyticsChart({ data, currencies, defaultCurrency, stats }: AnalyticsChartProps) {
  const [period, setPeriod] = useState<TimePeriod>("month")
  const [activeCurrency, setActiveCurrency] = useState(defaultCurrency)
  
  const currencyData = CURRENCIES.find((c) => c.value === activeCurrency)
  const symbol = currencyData?.symbol || ""

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "var(--chart-1)",
    },
    paid: {
      label: "Paid",
      color: "var(--chart-2)",
    },
    invoices: {
      label: "Invoices",
      color: "var(--chart-3)",
    },
  }

  const currentData = data[activeCurrency]?.[period] || []
  const hasData = currentData.length > 0

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg border bg-card p-3 shadow-md">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} className="text-sm flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">
              {entry.dataKey === "revenue" ? "Revenue" : entry.dataKey === "paid" ? "Paid" : "Invoices"}:
            </span>
            <span className="font-medium">
              {entry.dataKey === "invoices" ? entry.value : `${symbol}${Number(entry.value).toLocaleString()}`}
            </span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon icon={InvoiceIcon} size={20} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold">{stats?.totalInvoices || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-chart-1/10">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-semibold text-chart-1">{stats?.paidInvoices || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <HugeiconsIcon icon={Clock01Icon} size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-primary">{stats?.pendingInvoices || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <HugeiconsIcon icon={AlertCircleIcon} size={20} className="text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-semibold text-destructive">{stats?.overdueInvoices || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Area Chart */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="text-base font-medium">Revenue</CardTitle>
                <CardDescription>Total vs paid in {activeCurrency}</CardDescription>
              </div>
              
              {/* Currency Tabs */}
              {currencies.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Currency:</span>
                  <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
                    {currencies.map((curr) => {
                      const currencyInfo = CURRENCIES.find((c) => c.value === curr)
                      return (
                        <button
                          key={curr}
                          onClick={() => setActiveCurrency(curr)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            activeCurrency === curr
                              ? "bg-background shadow-sm text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{currencyInfo?.symbol}</span>
                          <span className="font-semibold ml-1">{curr}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Period Tabs */}
            <div className="flex justify-end">
              <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
                <TabsList className="h-8">
                  <TabsTrigger value="month" className="text-xs px-2">30D</TabsTrigger>
                  <TabsTrigger value="quarter" className="text-xs px-2">90D</TabsTrigger>
                  <TabsTrigger value="year" className="text-xs px-2">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
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
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="paid"
                      stroke="var(--chart-2)"
                      strokeWidth={2}
                      fill="url(#colorPaid)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                No data for this period
              </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-chart-1" />
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-chart-2" />
                <span className="text-xs text-muted-foreground">Paid</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Count Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Invoice Activity</CardTitle>
            <CardDescription>Invoices created over time</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
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
                      fill="var(--chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                No data for this period
              </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-chart-1" />
                <span className="text-xs text-muted-foreground">Invoices</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
