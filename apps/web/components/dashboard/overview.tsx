"use client"

import { useState } from "react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowDownRight01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  ChartColumnIcon,
  CheckmarkCircle02Icon,
  MoneyReceive01Icon,
  PercentCircleIcon,
  TimeQuarterPassIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatMoney, formatMoneyCompact, currencySymbol } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Aging, ChartRange, OverviewData, SeriesPoint } from "@/lib/dashboard/overview"

type Icon = typeof Wallet01Icon

const RANGE_LABELS: Record<ChartRange, string> = { "30d": "Last 30 days", "90d": "Last 90 days", "1y": "Last 12 months" }

const chartConfig = {
  invoiced: { label: "Invoiced", color: "var(--muted-foreground)" },
  paid: { label: "Paid", color: "var(--primary)" },
  count: { label: "Invoices", color: "var(--primary)" },
} satisfies ChartConfig

function plural(n: number, word: string) {
  return n === 1 ? word : `${word}s`
}

/** Month-over-month change of the last two monthly buckets; null when there's no baseline. */
function monthOverMonth(points: SeriesPoint[], key: "paid" | "invoiced") {
  const current = points.at(-1)?.[key] ?? 0
  const previous = points.at(-2)?.[key] ?? 0
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export function DashboardOverview({ data }: { data: OverviewData }) {
  const [currency, setCurrency] = useState(data.primaryCurrency)
  const overview = data.byCurrency[currency] ?? data.byCurrency[data.primaryCurrency]
  const collectionRate = overview.fyInvoiced > 0 ? Math.round((overview.fyPaid / overview.fyInvoiced) * 100) : null
  const collectedChange = monthOverMonth(overview.series["1y"], "paid")

  return (
    <section aria-labelledby="overview-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 id="overview-heading" className="text-base font-semibold">
            Overview
          </h2>
          <Badge variant="outline" className="bg-card font-normal tabular-nums text-muted-foreground">
            {data.fyLabel}
          </Badge>
        </div>
        {data.currencies.length > 1 && (
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger
              size="sm"
              className="h-9 w-30 rounded-full border-0 bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-border dark:bg-card"
              aria-label="Currency"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {data.currencies.map((c) => (
                <SelectItem key={c} value={c} className="rounded-lg">
                  <span className="w-5 text-muted-foreground">{currencySymbol(c)}</span>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiTile
          href="/dashboard/invoices?status=sent"
          icon={Wallet01Icon}
          label="Outstanding"
          value={formatMoney(overview.outstanding, currency, 0)}
          footer={<MetaPill>{overview.outstandingCount} unpaid {plural(overview.outstandingCount, "invoice")}</MetaPill>}
        />
        <KpiTile
          href="/dashboard/invoices?status=overdue"
          icon={Alert02Icon}
          label="Overdue"
          value={formatMoney(overview.overdue, currency, 0)}
          footer={
            overview.overdueCount > 0 ? (
              <MetaPill tone="critical" icon={Alert02Icon}>
                {overview.overdueCount} past due
              </MetaPill>
            ) : (
              <MetaPill tone="good" icon={CheckmarkCircle02Icon}>
                All on time
              </MetaPill>
            )
          }
        />
        <KpiTile
          href="/dashboard/invoices?status=paid"
          icon={MoneyReceive01Icon}
          label="Collected"
          value={formatMoney(overview.fyPaid, currency, 0)}
          footer={
            collectedChange === null ? (
              <MetaPill>{overview.fyPaidCount} paid this FY</MetaPill>
            ) : (
              <DeltaPill value={collectedChange} suffix="vs last month" />
            )
          }
        />
        <KpiTile
          icon={PercentCircleIcon}
          label="Collection rate"
          shortLabel="Rate"
          value={collectionRate === null ? "—" : `${collectionRate}%`}
          footer={
            collectionRate === null ? (
              <MetaPill>No invoices sent this FY</MetaPill>
            ) : (
              <div className="flex w-full items-center gap-2">
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={collectionRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Collection rate"
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${collectionRate}%` }} />
                </div>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  of {formatMoneyCompact(overview.fyInvoiced, currency)}
                </span>
              </div>
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RevenueCard series={overview.series} currency={currency} className="lg:col-span-2" />
        <ReceivablesCard aging={overview.aging} currency={currency} />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

export function IconChip({ icon, className }: { icon: Icon; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground ring-1 ring-border/60",
        className
      )}
      aria-hidden
    >
      <HugeiconsIcon icon={icon} size={16} />
    </span>
  )
}

const PILL_TONES = {
  neutral: { pill: "bg-muted text-muted-foreground", dot: "bg-foreground/10 text-foreground" },
  good: { pill: "bg-success/10 text-success", dot: "bg-success text-white dark:text-black" },
  critical: { pill: "bg-destructive/10 text-destructive", dot: "bg-destructive text-white dark:text-black" },
} as const

export function MetaPill({
  children,
  tone = "neutral",
  icon,
}: {
  children: React.ReactNode
  tone?: keyof typeof PILL_TONES
  icon?: Icon
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 truncate rounded-full py-1 pr-2.5 text-xs font-medium",
        icon ? "pl-1" : "pl-2.5",
        PILL_TONES[tone].pill
      )}
    >
      {icon && (
        <span className={cn("grid size-4 shrink-0 place-items-center rounded-full", PILL_TONES[tone].dot)}>
          <HugeiconsIcon icon={icon} size={10} strokeWidth={2.5} />
        </span>
      )}
      <span className="truncate">{children}</span>
    </span>
  )
}

export function DeltaPill({ value, suffix }: { value: number; suffix: string }) {
  const up = value >= 0
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted py-1 pr-2.5 pl-1 text-xs">
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full text-white dark:text-black",
          up ? "bg-success" : "bg-destructive"
        )}
        aria-hidden
      >
        <HugeiconsIcon icon={up ? ArrowUpRight01Icon : ArrowDownRight01Icon} size={10} strokeWidth={2.5} />
      </span>
      <span className={cn("font-semibold tabular-nums", up ? "text-success" : "text-destructive")}>
        {up ? "+" : ""}
        {value.toFixed(1)}%
      </span>
      <span className="truncate text-muted-foreground">{suffix}</span>
    </span>
  )
}

export function KpiTile({
  href,
  icon,
  label,
  shortLabel,
  value,
  footer,
}: {
  href?: string
  icon: Icon
  label: string
  shortLabel?: string
  value: string
  footer: React.ReactNode
}) {
  const body = (
    <Card
      className={cn(
        "h-full gap-0 p-4 transition-[box-shadow,transform] duration-200 sm:p-5",
        href &&
          "group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.18)] group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50"
      )}
    >
      <CardContent className="flex h-full flex-col px-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <IconChip icon={icon} />
            <span className="truncate text-sm font-medium">
              {shortLabel ? (
                <>
                  <span className="sm:hidden">{shortLabel}</span>
                  <span className="hidden sm:inline">{label}</span>
                </>
              ) : (
                label
              )}
            </span>
          </div>
          {href && (
            <span className="hidden size-7 place-items-center rounded-full text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground sm:grid">
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} aria-hidden />
            </span>
          )}
        </div>
        <p className="mt-4 truncate text-2xl font-semibold tracking-tight tabular-nums sm:mt-5 sm:text-[28px]">{value}</p>
        <div className="mt-3 flex min-w-0">{footer}</div>
      </CardContent>
    </Card>
  )

  if (!href) return body
  return (
    <Link href={href} className="group rounded-2xl outline-none" aria-label={`${label}: ${value}`}>
      {body}
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Revenue                                                             */
/* ------------------------------------------------------------------ */

export function RevenueCard({
  series,
  currency,
  className,
}: {
  series: Record<ChartRange, SeriesPoint[]>
  currency: string
  className?: string
}) {
  const [range, setRange] = useState<ChartRange>("1y")
  const [metric, setMetric] = useState<"amount" | "count">("amount")
  const [hovered, setHovered] = useState<number | null>(null)
  const points = series[range]
  const totals = points.reduce(
    (acc, p) => ({ invoiced: acc.invoiced + p.invoiced, paid: acc.paid + p.paid, count: acc.count + p.count }),
    { invoiced: 0, paid: 0, count: 0 }
  )
  const hasData = totals.count > 0

  // Highlight the hovered bar, otherwise the most recent period with activity.
  const lastActive = points.reduce((last, p, i) => (p.count > 0 ? i : last), -1)
  const highlight = hovered ?? lastActive
  const isAmount = metric === "amount"

  return (
    <Card className={cn("gap-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <IconChip icon={ChartColumnIcon} />
          <div>
            <h3 className="text-sm font-medium">{isAmount ? "Earnings" : "Invoice activity"}</h3>
            <p className="text-xs text-muted-foreground">
              {RANGE_LABELS[range]} · {currency}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={metric} onValueChange={(v) => setMetric(v as "amount" | "count")}>
            <TabsList className="h-9">
              <TabsTrigger value="amount" className="text-xs">Amount</TabsTrigger>
              <TabsTrigger value="count" className="text-xs">Count</TabsTrigger>
            </TabsList>
          </Tabs>
          <ToggleGroup
            type="single"
            size="sm"
            value={range}
            onValueChange={(v) => {
              if (!v) return
              setRange(v as ChartRange)
              setHovered(null)
            }}
            aria-label="Date range"
            className="h-9"
          >
            <ToggleGroupItem value="30d" className="h-7 px-2.5 text-xs" aria-label="Last 30 days">30D</ToggleGroupItem>
            <ToggleGroupItem value="90d" className="h-7 px-2.5 text-xs" aria-label="Last 90 days">90D</ToggleGroupItem>
            <ToggleGroupItem value="1y" className="h-7 px-2.5 text-xs" aria-label="Last 12 months">1Y</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 px-5 sm:px-6">
        {hasData ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                  {isAmount ? formatMoney(totals.paid, currency, 0) : totals.count}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAmount
                    ? `collected of ${formatMoney(totals.invoiced, currency, 0)} invoiced`
                    : `${plural(totals.count, "invoice")} sent`}
                </p>
              </div>
              {isAmount && (
                <ul className="flex items-center gap-4 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-[3px] bg-muted-foreground/25" aria-hidden />
                    Invoiced
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-[3px] bg-primary" aria-hidden />
                    Paid
                  </li>
                </ul>
              )}
            </div>

            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-auto min-h-65 w-full flex-1"
              role="img"
              aria-label={`${isAmount ? "Paid within invoiced amount" : "Invoices sent"} per period, ${RANGE_LABELS[range].toLowerCase()}`}
            >
              <BarChart
                data={points}
                margin={{ top: 28, right: 4, left: 0, bottom: 0 }}
                barCategoryGap={range === "30d" ? "18%" : "22%"}
                onMouseMove={(s) => setHovered(typeof s?.activeTooltipIndex === "number" ? s.activeTooltipIndex : null)}
                onMouseLeave={() => setHovered(null)}
                accessibilityLayer
              >
                <defs>
                  <linearGradient id="bar-neutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity={0.06} />
                  </linearGradient>
                  <linearGradient id="bar-neutral-active" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.06} />
                  </linearGradient>
                  <linearGradient id="bar-brand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.55} />
                  </linearGradient>
                  <linearGradient id="bar-brand-dim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" strokeOpacity={0.6} />
                <XAxis xAxisId="back" dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} />
                <XAxis xAxisId="front" dataKey="label" hide />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={isAmount ? 52 : 28}
                  allowDecimals={false}
                  tickFormatter={(v: number) => (isAmount ? formatMoneyCompact(v, currency) : String(v))}
                />
                <ChartTooltip cursor={false} content={<RevenueTooltip currency={currency} countOnly={!isAmount} />} />

                {/* Back layer: invoiced (or count) as soft neutral columns */}
                <Bar xAxisId="back" dataKey={isAmount ? "invoiced" : "count"} radius={[8, 8, 4, 4]} maxBarSize={44}>
                  {points.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === highlight
                          ? isAmount
                            ? "url(#bar-neutral-active)"
                            : "url(#bar-brand)"
                          : "url(#bar-neutral)"
                      }
                    />
                  ))}
                  <LabelList
                    dataKey={isAmount ? "invoiced" : "count"}
                    content={(props) => (
                      <ValuePill
                        {...(props as ValuePillProps)}
                        highlight={highlight}
                        format={(v) => (isAmount ? formatMoneyCompact(v, currency) : String(v))}
                      />
                    )}
                  />
                </Bar>

                {/* Front layer: paid portion, drawn inside its invoiced column */}
                {isAmount && (
                  <Bar xAxisId="front" dataKey="paid" radius={[8, 8, 4, 4]} maxBarSize={44}>
                    {points.map((_, i) => (
                      <Cell key={i} fill={i === highlight ? "url(#bar-brand)" : "url(#bar-brand-dim)"} />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ChartContainer>
            <SeriesTable points={points} currency={currency} />
          </>
        ) : (
          <Empty className="min-h-75 rounded-xl border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="rounded-full">
                <HugeiconsIcon icon={ChartColumnIcon} />
              </EmptyMedia>
              <EmptyTitle className="text-base">No invoices in this period</EmptyTitle>
              <EmptyDescription>Earnings appear here once invoices in {currency} are sent or paid.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm">
                <Link href="/dashboard/documents/new?type=invoice">Create invoice</Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

type ValuePillProps = {
  x?: number | string
  y?: number | string
  width?: number | string
  value?: number | string
  index?: number
}

/** The floating value pill above the highlighted column. */
function ValuePill({
  x,
  y,
  width,
  value,
  index,
  highlight,
  format,
}: ValuePillProps & { highlight: number; format: (v: number) => string }) {
  if (index !== highlight || !value) return null
  const text = format(Number(value))
  const w = Math.max(36, text.length * 6.6 + 14)
  const cx = Number(x) + Number(width) / 2
  const top = Number(y) - 24
  return (
    <g pointerEvents="none">
      <rect x={cx - w / 2} y={top} width={w} height={18} rx={9} fill="var(--foreground)" />
      <text x={cx} y={top + 12.5} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--background)">
        {text}
      </text>
    </g>
  )
}

type TooltipPayload = { payload?: SeriesPoint }

function RevenueTooltip({
  active,
  payload,
  label,
  currency,
  countOnly,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
  currency: string
  countOnly?: boolean
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  if (!point) return null
  const rows = countOnly
    ? [{ key: "count", label: "Invoices", swatch: "bg-primary", value: String(point.count) }]
    : [
        { key: "invoiced", label: "Invoiced", swatch: "bg-muted-foreground/40", value: formatMoney(point.invoiced, currency) },
        { key: "paid", label: "Paid", swatch: "bg-primary", value: formatMoney(point.paid, currency) },
      ]
  return (
    <div className="min-w-44 rounded-xl border bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg">
      <p className="mb-2 font-medium">{label}</p>
      <div className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", row.swatch)} aria-hidden />
            <span className="text-muted-foreground">{row.label}</span>
            <span className="ml-auto font-medium tabular-nums">{row.value}</span>
          </div>
        ))}
        {!countOnly && point.count > 0 && (
          <p className="mt-1 border-t pt-1.5 text-muted-foreground">
            {point.count} {plural(point.count, "invoice")}
          </p>
        )}
      </div>
    </div>
  )
}

/** Screen-reader / no-hover fallback for the chart. */
function SeriesTable({ points, currency }: { points: SeriesPoint[]; currency: string }) {
  return (
    <details className="text-xs">
      <summary className="w-fit cursor-pointer select-none rounded-full px-1 text-muted-foreground hover:text-foreground">
        View as table
      </summary>
      <div className="mt-2 max-h-56 overflow-auto rounded-xl border">
        <table className="w-full text-left tabular-nums">
          <thead className="sticky top-0 bg-muted text-muted-foreground">
            <tr>
              <th className="px-3 py-1.5 font-medium">Period</th>
              <th className="px-3 py-1.5 text-right font-medium">Invoices</th>
              <th className="px-3 py-1.5 text-right font-medium">Invoiced</th>
              <th className="px-3 py-1.5 text-right font-medium">Paid</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label} className="border-t">
                <td className="px-3 py-1.5">{p.label}</td>
                <td className="px-3 py-1.5 text-right">{p.count}</td>
                <td className="px-3 py-1.5 text-right">{formatMoney(p.invoiced, currency)}</td>
                <td className="px-3 py-1.5 text-right">{formatMoney(p.paid, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

/* ------------------------------------------------------------------ */
/* Receivables (spotlight card)                                        */
/* ------------------------------------------------------------------ */

type TaxFilter = "all" | "taxed" | "noTax"

// Sequential severity ramp: neutral for "not yet due", then amber deepening to red as debt ages.
const AGING_BUCKETS: { key: keyof Aging; label: string; color: string }[] = [
  { key: "current", label: "Not yet due", color: "color-mix(in oklch, var(--spotlight-foreground) 55%, transparent)" },
  { key: "d1to15", label: "1–15 days late", color: "oklch(0.8 0.12 60)" },
  { key: "d16to30", label: "16–30 days late", color: "oklch(0.74 0.16 45)" },
  { key: "d31to45", label: "31–45 days late", color: "oklch(0.68 0.19 30)" },
  { key: "d45plus", label: "45+ days late", color: "oklch(0.63 0.22 25)" },
]

export function ReceivablesCard({
  aging,
  currency,
  chaseHref = "/dashboard/invoices?status=overdue",
  subtitle = "By days past due",
}: {
  aging: Record<TaxFilter, Aging>
  currency: string
  chaseHref?: string
  subtitle?: string
}) {
  const [filter, setFilter] = useState<TaxFilter>("all")
  const data = aging[filter]
  const hasData = data.total > 0

  return (
    <Card className="gap-5 border-0 bg-spotlight text-spotlight-foreground shadow-[0_12px_32px_-16px_rgb(0_0_0/0.45)] dark:border dark:border-white/10">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <IconChip icon={TimeQuarterPassIcon} className="bg-spotlight-muted text-spotlight-foreground ring-white/10" />
          <div>
            <h3 className="text-sm font-medium">Receivables</h3>
            <p className="text-xs text-spotlight-foreground/55">{subtitle}</p>
          </div>
        </div>
        <Link
          href={chaseHref}
          className="inline-flex h-8 items-center gap-1 rounded-full bg-spotlight-foreground px-3.5 text-xs font-medium text-spotlight transition-[opacity,transform] hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:outline-none active:scale-[0.97]"
        >
          Chase
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </Link>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 px-5 sm:px-6">
        <ToggleGroup
          type="single"
          size="sm"
          value={filter}
          onValueChange={(v) => v && setFilter(v as TaxFilter)}
          aria-label="Tax filter"
          className="w-full bg-spotlight-muted"
        >
          {(
            [
              ["all", "All"],
              ["taxed", "With tax"],
              ["noTax", "No tax"],
            ] as const
          ).map(([value, label]) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="h-7 text-xs text-spotlight-foreground/60 hover:text-spotlight-foreground data-[state=on]:bg-white/15 data-[state=on]:text-spotlight-foreground data-[state=on]:shadow-none"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {hasData ? (
          <>
            <div>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">{formatMoney(data.total, currency, 0)}</p>
              <p className="mt-1 text-xs text-spotlight-foreground/55">
                owed across {data.count} {plural(data.count, "invoice")}
              </p>
            </div>

            <ul className="flex flex-col gap-2">
              {AGING_BUCKETS.map((b) => {
                const value = data[b.key]
                const share = Math.round((value / data.total) * 100)
                return (
                  <li
                    key={b.key}
                    className={cn(
                      "grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-xl bg-spotlight-muted px-3 py-2.5",
                      value === 0 && "opacity-50"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate text-sm">
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: b.color }} aria-hidden />
                      {b.label}
                    </span>
                    <span className="text-sm font-medium tabular-nums">{formatMoney(value, currency, 0)}</span>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
                        <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: b.color }} />
                      </div>
                      <span className="w-8 text-right text-[11px] tabular-nums text-spotlight-foreground/55">{share}%</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-spotlight-muted px-4 py-10 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-success/20 text-success">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
            </span>
            <div>
              <p className="font-medium">All caught up</p>
              <p className="mt-1 text-sm text-spotlight-foreground/55">No unpaid {currency} invoices right now.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
