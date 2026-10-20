import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Client } from "@/lib/types"
import {
  buildAging,
  buildAllBuckets,
  buildSeries,
  syncOverdueStatuses,
  type Aging,
  type ChartRange,
  type SeriesPoint,
} from "@/lib/dashboard/overview"

export type ClientDocument = {
  id: string
  number: string
  type: "invoice" | "quotation"
  status: string
  grand_total: number | string | null
  currency: string | null
  issue_date: string
  due_date: string | null
  include_tax: boolean | null
}

export interface ClientCurrencyStats {
  currency: string
  billed: number
  billedCount: number
  paid: number
  paidCount: number
  outstanding: number
  outstandingCount: number
  overdue: number
  overdueCount: number
  series: Record<ChartRange, SeriesPoint[]>
  aging: { all: Aging; taxed: Aging; noTax: Aging }
}

export interface ClientDetail {
  client: Client
  documents: ClientDocument[]
  currencies: string[]
  primaryCurrency: string
  byCurrency: Record<string, ClientCurrencyStats>
  openQuotes: number
  lastInvoiceDate: string | null
}

const COLUMNS = "id, number, type, status, grand_total, currency, issue_date, due_date, include_tax"

/** Cached per request, so generateMetadata and the page share one load. */
export const getClientDetail = cache(async function getClientDetail(
  userId: string,
  clientId: string,
  fallbackCurrency = "INR"
): Promise<ClientDetail | null> {
  const supabase = await createClient()

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("user_id", userId)
    .maybeSingle()
  if (error) throw new Error(`Failed to load client: ${error.message}`)
  if (!client) return null

  await syncOverdueStatuses(userId)

  // Documents linked by id, plus older ones that only carry the client's name.
  const [linked, byName] = await Promise.all([
    supabase.from("documents").select(COLUMNS).eq("user_id", userId).eq("client_id", clientId),
    supabase.from("documents").select(COLUMNS).eq("user_id", userId).is("client_id", null).eq("client_name", client.name),
  ])
  if (linked.error) throw new Error(`Failed to load documents: ${linked.error.message}`)
  if (byName.error) throw new Error(`Failed to load documents: ${byName.error.message}`)

  const documents = [...(linked.data ?? []), ...(byName.data ?? [])].sort((a, b) =>
    b.issue_date.localeCompare(a.issue_date)
  ) as ClientDocument[]

  const invoices = documents.filter((d) => d.type === "invoice")
  const currencyOf = (d: ClientDocument) => d.currency || "INR"

  // Primary currency = the one this client is billed in most.
  const billedBy = new Map<string, number>()
  for (const d of invoices) billedBy.set(currencyOf(d), (billedBy.get(currencyOf(d)) ?? 0) + (Number(d.grand_total) || 0))
  const currencies = billedBy.size
    ? Array.from(billedBy.entries()).sort((a, b) => b[1] - a[1]).map(([c]) => c)
    : [fallbackCurrency]
  const primaryCurrency = currencies[0]

  const buckets = buildAllBuckets()
  const byCurrency: Record<string, ClientCurrencyStats> = {}
  for (const currency of currencies) {
    const own = invoices.filter((d) => currencyOf(d) === currency)
    const billable = own.filter((d) => ["sent", "paid", "overdue"].includes(d.status))
    const unpaid = own.filter((d) => d.status === "sent" || d.status === "overdue")
    const sum = (rows: ClientDocument[]) => rows.reduce((s, d) => s + (Number(d.grand_total) || 0), 0)
    const aging = buildAging(unpaid)
    const paid = billable.filter((d) => d.status === "paid")

    byCurrency[currency] = {
      currency,
      billed: sum(billable),
      billedCount: billable.length,
      paid: sum(paid),
      paidCount: paid.length,
      outstanding: aging.all.total,
      outstandingCount: aging.all.count,
      overdue: aging.all.total - aging.all.current,
      overdueCount: aging.all.overdueCount,
      series: buildSeries(billable, buckets),
      aging,
    }
  }

  return {
    client: client as Client,
    documents,
    currencies,
    primaryCurrency,
    byCurrency,
    openQuotes: documents.filter((d) => d.type === "quotation" && (d.status === "draft" || d.status === "sent")).length,
    lastInvoiceDate: invoices[0]?.issue_date ?? null,
  }
})
