import "server-only"

import { cache } from "react"
import { and, clients, db, documents, eq, isNull } from "@infinity/db"
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

const COLUMNS = {
  id: documents.id,
  number: documents.number,
  type: documents.type,
  status: documents.status,
  grand_total: documents.grand_total,
  currency: documents.currency,
  issue_date: documents.issue_date,
  due_date: documents.due_date,
  include_tax: documents.include_tax,
}

/** Cached per request, so generateMetadata and the page share one load. */
export const getClientDetail = cache(async function getClientDetail(
  userId: string,
  clientId: string,
  fallbackCurrency = "INR"
): Promise<ClientDetail | null> {
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.user_id, userId)))
    .limit(1)
  if (!client) return null

  await syncOverdueStatuses(userId)

  // Documents linked by id, plus older ones that only carry the client's name.
  const [linked, byName] = await Promise.all([
    db.select(COLUMNS).from(documents).where(and(eq(documents.user_id, userId), eq(documents.client_id, clientId))),
    db
      .select(COLUMNS)
      .from(documents)
      .where(and(eq(documents.user_id, userId), isNull(documents.client_id), eq(documents.client_name, client.name))),
  ])

  const clientDocuments: ClientDocument[] = [...linked, ...byName].sort((a, b) => b.issue_date.localeCompare(a.issue_date))

  const invoices = clientDocuments.filter((d) => d.type === "invoice")
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
    documents: clientDocuments,
    currencies,
    primaryCurrency,
    byCurrency,
    openQuotes: clientDocuments.filter((d) => d.type === "quotation" && (d.status === "draft" || d.status === "sent")).length,
    lastInvoiceDate: invoices[0]?.issue_date ?? null,
  }
})
