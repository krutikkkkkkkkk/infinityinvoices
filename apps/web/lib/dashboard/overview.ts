import "server-only"

import { cache } from "react"
import { and, asc, db, desc, documents, eq, gte, inArray, isNotNull, lt, lte, profiles } from "@infinity/db"
import type { Profile } from "@/lib/types"
import { getInvoiceBalance } from "@/lib/invoice-balance"
import { startOfToday, toISODate, type DashboardPeriod } from "@/lib/date-range"

export type ChartRange = "30d" | "90d" | "1y"

export interface SeriesPoint {
  label: string
  invoiced: number
  paid: number
  count: number
}

export interface Aging {
  current: number
  d1to15: number
  d16to30: number
  d31to45: number
  d45plus: number
  total: number
  count: number
  overdueCount: number
}

export interface CurrencyOverview {
  currency: string
  outstanding: number
  outstandingCount: number
  overdue: number
  overdueCount: number
  /** Sent, paid and overdue invoices issued within the selected period. */
  totals: PeriodTotals
  /** Paid in the comparison period; null when the period has none (e.g. all time). */
  previousPaid: number | null
  series: SeriesPoint[]
  aging: { all: Aging; taxed: Aging; noTax: Aging }
}

export interface PeriodTotals {
  invoiced: number
  paid: number
  invoicedCount: number
  paidCount: number
}

export interface OverviewData {
  primaryCurrency: string
  currencies: string[]
  byCurrency: Record<string, CurrencyOverview>
  period: DashboardPeriod
  fyStartMonth: number
}

const DAY = 24 * 60 * 60 * 1000

// Parse a YYYY-MM-DD column as a local calendar date (avoids UTC off-by-one).
function parseDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** Per-request user lookup, shared by every dashboard server component. */
export { getCurrentUser } from "@/lib/auth/server"

export const getProfile = cache(async (userId: string) => {
  const [data] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
  return (data ?? null) as Profile | null
})

/**
 * Flip past-due sent/draft invoices to overdue. Runs once per request and
 * before any reads so the dashboard never shows stale overdue counts.
 */
export const syncOverdueStatuses = cache(async (userId: string) => {
  await db
    .update(documents)
    .set({ status: "overdue" })
    .where(
      and(
        eq(documents.user_id, userId),
        isNotNull(documents.due_date),
        lt(documents.due_date, toISODate(startOfToday())),
        inArray(documents.status, ["sent", "draft"]),
      ),
    )
})

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Same day n months away, clamped to the month's last day (31 Mar - 1 month = 28/29 Feb). */
function addMonths(date: Date, months: number) {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + months + 1, 0).getDate()
  return new Date(date.getFullYear(), date.getMonth() + months, Math.min(date.getDate(), lastDay))
}

function isMonthEnd(date: Date) {
  return addDays(date, 1).getDate() === 1
}

function monthLabel(date: Date) {
  // "May '26" — a bare "May 26" reads like a calendar date
  return `${date.toLocaleDateString("en-IN", { month: "short" })} '${String(date.getFullYear()).slice(2)}`
}

function dayLabel(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

/**
 * The stretch just before [start, end] to compare against. Periods starting on the 1st shift
 * by whole months (last month vs the month before), so a period still in progress compares
 * to the same elapsed stretch of the previous one (this FY to date vs last FY to date).
 */
function previousWindow(start: Date, end: Date, nominalEnd: Date) {
  if (start.getDate() === 1) {
    const months =
      (nominalEnd.getFullYear() - start.getFullYear()) * 12 + nominalEnd.getMonth() - start.getMonth() + 1
    // A month-end stays a month-end (30 Sep → 31 Aug), otherwise keep the day of month
    const prevEnd = isMonthEnd(end) ? new Date(end.getFullYear(), end.getMonth() - months + 1, 0) : addMonths(end, -months)
    return { start: addMonths(start, -months), end: prevEnd }
  }
  const days = Math.round((end.getTime() - start.getTime()) / DAY) + 1
  return { start: addDays(start, -days), end: addDays(start, -1) }
}

/** Chart buckets sized to the period: daily up to a month, weekly up to ~4 months, monthly up to 3 years, then yearly. */
function buildPeriodBuckets(start: Date, end: Date): Bucket[] {
  const endExclusive = addDays(end, 1)
  const days = Math.round((endExclusive.getTime() - start.getTime()) / DAY)
  const clamp = (from: Date, to: Date) => ({ start: from < start ? start : from, end: to > endExclusive ? endExclusive : to })

  if (days <= 31) {
    return Array.from({ length: days }, (_, i) => {
      const day = addDays(start, i)
      return { start: day, end: addDays(day, 1), label: dayLabel(day) }
    })
  }
  if (days <= 120) {
    return Array.from({ length: Math.ceil(days / 7) }, (_, i) => {
      const week = addDays(start, i * 7)
      return { ...clamp(week, addDays(week, 7)), label: dayLabel(week) }
    })
  }
  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1
  if (months <= 36) {
    return Array.from({ length: months }, (_, i) => {
      const month = new Date(start.getFullYear(), start.getMonth() + i, 1)
      return { ...clamp(month, new Date(month.getFullYear(), month.getMonth() + 1, 1)), label: monthLabel(month) }
    })
  }
  return Array.from({ length: end.getFullYear() - start.getFullYear() + 1 }, (_, i) => {
    const year = start.getFullYear() + i
    return { ...clamp(new Date(year, 0, 1), new Date(year + 1, 0, 1)), label: String(year) }
  })
}

function emptyAging(): Aging {
  return { current: 0, d1to15: 0, d16to30: 0, d31to45: 0, d45plus: 0, total: 0, count: 0, overdueCount: 0 }
}

type Bucket = { start: Date; end: Date; label: string }

function buildBuckets(range: ChartRange, today: Date): Bucket[] {
  if (range === "1y") {
    return Array.from({ length: 12 }, (_, i) => {
      const start = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1)
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1)
      return { start, end, label: monthLabel(start) }
    })
  }
  const days = range === "30d" ? 30 : 91
  const step = range === "30d" ? 1 : 7
  const first = new Date(today.getTime() - (days - 1) * DAY)
  return Array.from({ length: days / step }, (_, i) => {
    const start = new Date(first.getTime() + i * step * DAY)
    const end = new Date(start.getTime() + step * DAY)
    return { start, end, label: dayLabel(start) }
  })
}

export type SeriesInvoice = { grand_total: number | string | null; status: string; issue_date: string }
export type AgingInvoice = {
  grand_total: number | string | null
  amount_paid?: number | string | null
  credit_total?: number | string | null
  due_date: string | null
  include_tax: boolean | null
}
export function buildAllBuckets(today = startOfToday()): Record<ChartRange, Bucket[]> {
  return { "30d": buildBuckets("30d", today), "90d": buildBuckets("90d", today), "1y": buildBuckets("1y", today) }
}

/** Invoiced / paid / count per bucket (sent, paid and overdue invoices). */
function seriesFor(invoices: SeriesInvoice[], buckets: Bucket[]): SeriesPoint[] {
  const points = buckets.map((b) => ({ label: b.label, invoiced: 0, paid: 0, count: 0 }))
  for (const inv of invoices) {
    const date = parseDate(inv.issue_date)
    const index = buckets.findIndex((b) => date >= b.start && date < b.end)
    if (index === -1) continue
    const amount = Number(inv.grand_total) || 0
    points[index].invoiced += amount
    points[index].count += 1
    if (inv.status === "paid") points[index].paid += amount
  }
  return points
}

/** Series for each fixed chart range. */
export function buildSeries(invoices: SeriesInvoice[], bucketsByRange = buildAllBuckets()) {
  const series = {} as Record<ChartRange, SeriesPoint[]>
  for (const range of Object.keys(bucketsByRange) as ChartRange[]) {
    series[range] = seriesFor(invoices, bucketsByRange[range])
  }
  return series
}

function sumTotals(invoices: SeriesInvoice[]): PeriodTotals {
  const totals = { invoiced: 0, paid: 0, invoicedCount: 0, paidCount: 0 }
  for (const inv of invoices) {
    const amount = Number(inv.grand_total) || 0
    totals.invoiced += amount
    totals.invoicedCount += 1
    if (inv.status === "paid") {
      totals.paid += amount
      totals.paidCount += 1
    }
  }
  return totals
}

/** Bucket unpaid invoices by days past due, overall and split by tax. */
export function buildAging(receivables: AgingInvoice[], today = startOfToday()) {
  const aging = { all: emptyAging(), taxed: emptyAging(), noTax: emptyAging() }
  for (const row of receivables) {
    // Partially paid or credited invoices only count for what is still owed
    const amount = getInvoiceBalance(row).remaining
    if (amount <= 0) continue
    const daysLate = row.due_date ? Math.floor((today.getTime() - parseDate(row.due_date).getTime()) / DAY) : 0
    const targets = [aging.all, row.include_tax === false ? aging.noTax : aging.taxed]
    for (const a of targets) {
      a.total += amount
      a.count += 1
      if (daysLate <= 0) a.current += amount
      else {
        a.overdueCount += 1
        if (daysLate <= 15) a.d1to15 += amount
        else if (daysLate <= 30) a.d16to30 += amount
        else if (daysLate <= 45) a.d31to45 += amount
        else a.d45plus += amount
      }
    }
  }
  return aging
}

type InvoiceRow = {
  grand_total: number | string | null
  status: string
  issue_date: string
  currency: string | null
}

type ReceivableRow = {
  grand_total: number | string | null
  amount_paid: number | string | null
  credit_total: number | string | null
  due_date: string | null
  currency: string | null
  include_tax: boolean | null
}

export async function getOverviewData(
  userId: string,
  profile: Profile | null,
  period: DashboardPeriod
): Promise<OverviewData> {
  await syncOverdueStatuses(userId)

  const today = startOfToday()
  const primaryCurrency = profile?.default_currency || "INR"
  const nominalStart = period.from ? parseDate(period.from) : null
  const nominalEnd = period.to ? parseDate(period.to) : null
  // Don't chart the empty future of a period still in progress (e.g. the rest of this FY)
  const endToDate = nominalEnd && nominalEnd < today ? nominalEnd : today
  const previous = nominalStart && nominalEnd ? previousWindow(nominalStart, endToDate, nominalEnd) : null
  const fetchStart = previous?.start ?? nominalStart

  const [invoices, receivables]: [InvoiceRow[], ReceivableRow[]] = await Promise.all([
    db
      .select({
        grand_total: documents.grand_total,
        status: documents.status,
        issue_date: documents.issue_date,
        currency: documents.currency,
      })
      .from(documents)
      .where(
        and(
          eq(documents.user_id, userId),
          eq(documents.type, "invoice"),
          inArray(documents.status, ["sent", "paid", "overdue"]),
          fetchStart ? gte(documents.issue_date, toISODate(fetchStart)) : undefined,
          nominalEnd ? lte(documents.issue_date, toISODate(nominalEnd)) : undefined,
        ),
      )
      .orderBy(asc(documents.issue_date), asc(documents.id)),
    db
      .select({
        grand_total: documents.grand_total,
        amount_paid: documents.amount_paid,
        credit_total: documents.credit_total,
        due_date: documents.due_date,
        currency: documents.currency,
        include_tax: documents.include_tax,
      })
      .from(documents)
      .where(and(eq(documents.user_id, userId), eq(documents.type, "invoice"), inArray(documents.status, ["sent", "overdue"]))),
  ])

  // Rows are sorted by issue date, so the ends of the list bound an open-ended period.
  // The chart runs to today, extending further only for invoices actually dated in the future.
  const first = invoices.length ? parseDate(invoices[0].issue_date) : today
  const latest = invoices.length ? parseDate(invoices[invoices.length - 1].issue_date) : today
  const start = nominalStart ?? (first < today ? first : today)
  const end = latest > endToDate ? latest : endToDate < start ? start : endToDate
  const inPeriod = (date: Date) => date >= start && date <= end
  const inPrevious = (date: Date) => !!previous && date >= previous.start && date <= previous.end

  const buckets = buildPeriodBuckets(start, end)

  const currencies = Array.from(
    new Set([primaryCurrency, ...invoices.map((i) => i.currency || "INR"), ...receivables.map((r) => r.currency || "INR")])
  )

  const byCurrency: Record<string, CurrencyOverview> = {}

  for (const currency of currencies) {
    const ownInvoices = invoices.filter((i) => (i.currency || "INR") === currency)
    const ownReceivables = receivables.filter((r) => (r.currency || "INR") === currency)
    const current = ownInvoices.filter((i) => inPeriod(parseDate(i.issue_date)))
    const aging = buildAging(ownReceivables, today)

    byCurrency[currency] = {
      currency,
      outstanding: aging.all.total,
      outstandingCount: aging.all.count,
      overdue: aging.all.total - aging.all.current,
      overdueCount: aging.all.overdueCount,
      totals: sumTotals(current),
      previousPaid: previous ? sumTotals(ownInvoices.filter((i) => inPrevious(parseDate(i.issue_date)))).paid : null,
      series: seriesFor(current, buckets),
      aging,
    }
  }

  return { primaryCurrency, currencies, byCurrency, period, fyStartMonth: profile?.financial_year_start || 4 }
}

export async function getRecentDocuments(userId: string) {
  await syncOverdueStatuses(userId)
  return db
    .select({
      id: documents.id,
      number: documents.number,
      type: documents.type,
      status: documents.status,
      client_name: documents.client_name,
      grand_total: documents.grand_total,
      currency: documents.currency,
      due_date: documents.due_date,
      issue_date: documents.issue_date,
    })
    .from(documents)
    .where(eq(documents.user_id, userId))
    .orderBy(desc(documents.created_at))
    .limit(6)
}
