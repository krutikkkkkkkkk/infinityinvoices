// Date helpers shared by server data loaders and client filters (no server-only imports).

import { formatDate } from "@/lib/format"

export function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function toISODate(date: Date) {
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

export const DATE_PRESETS = [
  "this-month",
  "last-month",
  "last-3-months",
  "past-year",
  "this-fy",
  "last-fy",
  "last-calendar-year",
] as const

export type DatePreset = (typeof DATE_PRESETS)[number]

export interface DateRange {
  from: string
  to: string
  label: string
}

/** Inclusive YYYY-MM-DD ranges for each quick filter, relative to today. */
export function getDatePresets(fyStartMonth = 4, today = startOfToday()): Record<DatePreset, DateRange> {
  const y = today.getFullYear()
  const m = today.getMonth()
  const fy = getFinancialYear(fyStartMonth, today)
  const lastFy = getFinancialYear(fyStartMonth, new Date(fy.start.getFullYear(), fy.start.getMonth() - 1, 1))
  // 12 calendar months including the current one, so charts show 12 whole-month bars
  const yearAgo = new Date(y, m - 11, 1)

  return {
    "this-month": { from: toISODate(new Date(y, m, 1)), to: toISODate(new Date(y, m + 1, 0)), label: "This month" },
    "last-month": { from: toISODate(new Date(y, m - 1, 1)), to: toISODate(new Date(y, m, 0)), label: "Last month" },
    "last-3-months": { from: toISODate(new Date(y, m - 2, 1)), to: toISODate(today), label: "Last 3 months" },
    "past-year": { from: toISODate(yearAgo), to: toISODate(today), label: "Past 12 months" },
    "this-fy": { from: toISODate(fy.start), to: toISODate(fy.end), label: `This FY (${fy.label.slice(3)})` },
    "last-fy": { from: toISODate(lastFy.start), to: toISODate(lastFy.end), label: `Last FY (${lastFy.label.slice(3)})` },
    "last-calendar-year": {
      from: toISODate(new Date(y - 1, 0, 1)),
      to: toISODate(new Date(y - 1, 11, 31)),
      label: `Last year (${y - 1})`,
    },
  }
}

export function isDatePreset(value: string | undefined): value is DatePreset {
  return (DATE_PRESETS as readonly string[]).includes(value ?? "")
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** A preset in the URL wins over raw from/to; otherwise valid explicit dates are used, earliest first. */
export function resolveDateFilter(
  params: { range?: string; from?: string; to?: string },
  fyStartMonth = 4
): { range: DatePreset | ""; from: string; to: string } {
  if (isDatePreset(params.range)) {
    const { from, to } = getDatePresets(fyStartMonth)[params.range]
    return { range: params.range, from, to }
  }
  const from = params.from && ISO_DATE.test(params.from) ? params.from : ""
  const to = params.to && ISO_DATE.test(params.to) ? params.to : ""
  if (from && to && from > to) return { range: "", from: to, to: from }
  return { range: "", from, to }
}

export interface DashboardPeriod {
  /** Preset key, "all", or "" for a custom from/to range. */
  range: DatePreset | "all" | ""
  from: string
  to: string
  label: string
  /** Suffix for the change vs the previous period; null when there's nothing to compare against. */
  compareLabel: string | null
}

const COMPARE_LABELS: Record<DatePreset, string> = {
  "this-month": "vs last month",
  "last-month": "vs month before",
  "last-3-months": "vs prior period",
  "past-year": "vs year before",
  "this-fy": "vs last FY",
  "last-fy": "vs FY before",
  "last-calendar-year": "vs year before",
}

/** Dashboard analytics period from the URL; defaults to the current financial year. */
export function resolveDashboardPeriod(
  params: { range?: string; from?: string; to?: string },
  fyStartMonth = 4
): DashboardPeriod {
  if (params.range === "all") return { range: "all", from: "", to: "", label: "All time", compareLabel: null }

  const presets = getDatePresets(fyStartMonth)
  const { range, from, to } = resolveDateFilter(params, fyStartMonth)
  if (range) return { range, from, to, label: presets[range].label, compareLabel: COMPARE_LABELS[range] }
  if (from || to) {
    const label = from && to ? `${formatDate(from)} – ${formatDate(to)}` : from ? `Since ${formatDate(from)}` : `Until ${formatDate(to)}`
    return { range: "", from, to, label, compareLabel: from ? "vs prior period" : null }
  }

  const fy = presets["this-fy"]
  return { range: "this-fy", from: fy.from, to: fy.to, label: fy.label, compareLabel: COMPARE_LABELS["this-fy"] }
}

/** Query string that reproduces a period on the invoice list (which has no "all" preset). */
export function periodSearchParams(period: DashboardPeriod) {
  const sp = new URLSearchParams()
  if (period.range && period.range !== "all") sp.set("range", period.range)
  else if (!period.range) {
    if (period.from) sp.set("from", period.from)
    if (period.to) sp.set("to", period.to)
  }
  return sp
}
