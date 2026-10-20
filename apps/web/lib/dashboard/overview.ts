import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"

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
  fyInvoiced: number
  fyPaid: number
  fyInvoicedCount: number
  fyPaidCount: number
  series: Record<ChartRange, SeriesPoint[]>
  aging: { all: Aging; taxed: Aging; noTax: Aging }
}

export interface OverviewData {
  primaryCurrency: string
  currencies: string[]
  byCurrency: Record<string, CurrencyOverview>
  fyLabel: string
}

const DAY = 24 * 60 * 60 * 1000

// Parse a YYYY-MM-DD column as a local calendar date (avoids UTC off-by-one).
function parseDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number)
  return new Date(y, m - 1, d)
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function toISODate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function getFinancialYear(startMonth: number, today = startOfToday()) {
  const startYear = today.getMonth() + 1 >= startMonth ? today.getFullYear() : today.getFullYear() - 1
  const start = new Date(startYear, startMonth - 1, 1)
  const end = new Date(startYear + 1, startMonth - 1, 0)
  const label = `FY ${startYear}-${String(startYear + 1).slice(2)}`
  return { start, end, label }
}

/** Per-request user lookup, shared by every dashboard server component. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
  if (error && error.code !== "PGRST116") throw new Error(`Failed to load profile: ${error.message}`)
  return data as Profile | null
})

/**
 * Flip past-due sent/draft invoices to overdue. Runs once per request and
 * before any reads so the dashboard never shows stale overdue counts.
 */
export const syncOverdueStatuses = cache(async (userId: string) => {
  const supabase = await createClient()
  await supabase
    .from("documents")
    .update({ status: "overdue" })
    .eq("user_id", userId)
    .lt("due_date", toISODate(startOfToday()))
    .in("status", ["sent", "draft"])
    .not("due_date", "is", null)
})

function emptyAging(): Aging {
  return { current: 0, d1to15: 0, d16to30: 0, d31to45: 0, d45plus: 0, total: 0, count: 0, overdueCount: 0 }
}

function buildBuckets(range: ChartRange, today: Date) {
  if (range === "1y") {
    return Array.from({ length: 12 }, (_, i) => {
      const start = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1)
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1)
      // "May '26" — a bare "May 26" reads like a calendar date
      const label = `${start.toLocaleDateString("en-IN", { month: "short" })} '${String(start.getFullYear()).slice(2)}`
      return { start, end, label }
    })
  }
  const days = range === "30d" ? 30 : 91
  const step = range === "30d" ? 1 : 7
  const first = new Date(today.getTime() - (days - 1) * DAY)
  return Array.from({ length: days / step }, (_, i) => {
    const start = new Date(first.getTime() + i * step * DAY)
    const end = new Date(start.getTime() + step * DAY)
    const label = start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    return { start, end, label }
  })
}

export type SeriesInvoice = { grand_total: number | string | null; status: string; issue_date: string }
export type AgingInvoice = { grand_total: number | string | null; due_date: string | null; include_tax: boolean | null }
type Buckets = ReturnType<typeof buildBuckets>

export function buildAllBuckets(today = startOfToday()): Record<ChartRange, Buckets> {
  return { "30d": buildBuckets("30d", today), "90d": buildBuckets("90d", today), "1y": buildBuckets("1y", today) }
}

/** Invoiced / paid / count per period for each chart range (sent, paid and overdue invoices). */
export function buildSeries(invoices: SeriesInvoice[], bucketsByRange = buildAllBuckets()) {
  const series = {} as Record<ChartRange, SeriesPoint[]>
  for (const range of Object.keys(bucketsByRange) as ChartRange[]) {
    const buckets = bucketsByRange[range]
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
    series[range] = points
  }
  return series
}

/** Bucket unpaid invoices by days past due, overall and split by tax. */
export function buildAging(receivables: AgingInvoice[], today = startOfToday()) {
  const aging = { all: emptyAging(), taxed: emptyAging(), noTax: emptyAging() }
  for (const row of receivables) {
    const amount = Number(row.grand_total) || 0
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
  due_date: string | null
  currency: string | null
  include_tax: boolean | null
}

export async function getOverviewData(userId: string, profile: Profile | null): Promise<OverviewData> {
  await syncOverdueStatuses(userId)

  const supabase = await createClient()
  const today = startOfToday()
  const primaryCurrency = profile?.default_currency || "INR"
  const fy = getFinancialYear(profile?.financial_year_start || 4, today)
  const yearAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1)
  const windowStart = fy.start < yearAgo ? fy.start : yearAgo

  const [invoicesRes, receivablesRes] = await Promise.all([
    supabase
      .from("documents")
      .select("grand_total, status, issue_date, currency")
      .eq("user_id", userId)
      .eq("type", "invoice")
      .in("status", ["sent", "paid", "overdue"])
      .gte("issue_date", toISODate(windowStart)),
    supabase
      .from("documents")
      .select("grand_total, due_date, currency, include_tax")
      .eq("user_id", userId)
      .eq("type", "invoice")
      .in("status", ["sent", "overdue"]),
  ])

  if (invoicesRes.error) throw new Error(`Failed to load invoices: ${invoicesRes.error.message}`)
  if (receivablesRes.error) throw new Error(`Failed to load receivables: ${receivablesRes.error.message}`)

  const invoices = (invoicesRes.data ?? []) as InvoiceRow[]
  const receivables = (receivablesRes.data ?? []) as ReceivableRow[]

  const currencies = Array.from(
    new Set([primaryCurrency, ...invoices.map((i) => i.currency || "INR"), ...receivables.map((r) => r.currency || "INR")])
  )

  const bucketsByRange = buildAllBuckets(today)

  const byCurrency: Record<string, CurrencyOverview> = {}

  for (const currency of currencies) {
    const ownInvoices = invoices.filter((i) => (i.currency || "INR") === currency)
    const ownReceivables = receivables.filter((r) => (r.currency || "INR") === currency)

    const series = buildSeries(ownInvoices, bucketsByRange)

    let fyInvoiced = 0
    let fyPaid = 0
    let fyInvoicedCount = 0
    let fyPaidCount = 0
    for (const inv of ownInvoices) {
      const date = parseDate(inv.issue_date)
      if (date < fy.start || date > fy.end) continue
      const amount = Number(inv.grand_total) || 0
      fyInvoiced += amount
      fyInvoicedCount += 1
      if (inv.status === "paid") {
        fyPaid += amount
        fyPaidCount += 1
      }
    }

    const aging = buildAging(ownReceivables, today)

    byCurrency[currency] = {
      currency,
      outstanding: aging.all.total,
      outstandingCount: aging.all.count,
      overdue: aging.all.total - aging.all.current,
      overdueCount: aging.all.overdueCount,
      fyInvoiced,
      fyPaid,
      fyInvoicedCount,
      fyPaidCount,
      series,
      aging,
    }
  }

  return { primaryCurrency, currencies, byCurrency, fyLabel: fy.label }
}

export async function getRecentDocuments(userId: string) {
  await syncOverdueStatuses(userId)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("documents")
    .select("id, number, type, status, client_name, grand_total, currency, due_date, issue_date")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6)
  if (error) throw new Error(`Failed to load recent documents: ${error.message}`)
  return data ?? []
}
