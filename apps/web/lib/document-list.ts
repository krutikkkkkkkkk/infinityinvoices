import "server-only"

import { and, asc, count, db, desc, documents, eq, gte, ilike, lte, or, type SQL } from "@infinity/db"
import type { Document } from "@/lib/types"

/** Columns the list pages can sort by (the filter bar offers these; anything else falls back). */
const SORT_COLUMNS = {
  created_at: documents.created_at,
  issue_date: documents.issue_date,
  grand_total: documents.grand_total,
} as const

export interface DocumentListFilters {
  userId: string
  type: "invoice" | "quotation"
  status: string
  search: string
  from?: string | null
  to?: string | null
  sort: string
  order: string
  tax?: string
  page: number
  pageSize: number
}

/** One page of the user's invoices or quotations plus the total count for the same filters. */
export async function listDocuments(filters: DocumentListFilters): Promise<{ rows: Document[]; total: number }> {
  const conditions: SQL[] = [eq(documents.type, filters.type), eq(documents.user_id, filters.userId)]

  if (filters.status !== "all") {
    conditions.push(eq(documents.status, filters.status as Document["status"]))
  }

  if (filters.tax === "taxed") {
    conditions.push(eq(documents.include_tax, true))
  } else if (filters.tax === "no-tax") {
    conditions.push(eq(documents.include_tax, false))
  }

  if (filters.search) {
    const pattern = `%${filters.search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
    conditions.push(or(ilike(documents.number, pattern), ilike(documents.client_name, pattern))!)
  }

  if (filters.from) {
    conditions.push(gte(documents.issue_date, filters.from))
  }

  if (filters.to) {
    conditions.push(lte(documents.issue_date, filters.to))
  }

  const where = and(...conditions)
  const column = SORT_COLUMNS[filters.sort as keyof typeof SORT_COLUMNS] ?? documents.created_at
  const direction = filters.order === "asc" ? asc : desc

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(documents)
      .where(where)
      .orderBy(direction(column), desc(documents.id))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize),
    db.select({ total: count() }).from(documents).where(where),
  ])

  return { rows: rows as Document[], total }
}
