import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import { Files01Icon, InvoiceIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import type { Document } from "@/lib/types"
import { InvoiceFilters } from "@/components/dashboard/invoice-filters"
import { InvoiceTableRow } from "@/components/dashboard/invoice-table-row"

const PAGE_SIZE = 20

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    status?: string
    search?: string
    from?: string
    to?: string
    sort?: string
    order?: string
    tax?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const status = params.status || "all"
  const search = params.search || ""
  const from = params.from || ""
  const to = params.to || ""
  const sort = params.sort || "created_at"
  const order = params.order || "desc"
  const tax = params.tax || "all"

  const supabase = await createClient()
  const offset = (page - 1) * PAGE_SIZE

  // Build query
  let query = supabase
    .from("documents")
    .select("*", { count: "exact" })
    .eq("type", "invoice")

  if (status !== "all") {
    query = query.eq("status", status)
  }

  if (tax === "taxed") {
    query = query.eq("include_tax", true)
  } else if (tax === "no-tax") {
    query = query.eq("include_tax", false)
  }

  if (search) {
    query = query.or(`number.ilike.%${search}%,client_name.ilike.%${search}%`)
  }

  if (from) {
    query = query.gte("issue_date", from)
  }

  if (to) {
    query = query.lte("issue_date", to)
  }

  query = query.order(sort, { ascending: order === "asc" })
  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: invoices, count } = await query

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            {totalCount} invoice{totalCount !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/documents/new?type=invoice">
            <HugeiconsIcon icon={Files01Icon} size={16} className="mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      <InvoiceFilters
        status={status}
        search={search}
        from={from}
        to={to}
        sort={sort}
        order={order}
        tax={tax}
      />

      <Card>
        <CardContent className="p-0">
          {invoices && invoices.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(invoices as Document[]).map((invoice) => (
                    <InvoiceTableRow key={invoice.id} invoice={invoice} />
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {offset + 1}-{Math.min(offset + PAGE_SIZE, totalCount)} of {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      disabled={page <= 1}
                    >
                      <Link
                        href={buildPageUrl(params, page - 1)}
                        aria-disabled={page <= 1}
                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                      >
                        Previous
                      </Link>
                    </Button>
                    <div className="flex items-center gap-1">
                      {generatePageNumbers(page, totalPages).map((p, i) =>
                        p === "..." ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">...</span>
                        ) : (
                          <Button
                            key={p}
                            variant={p === page ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                          >
                            <Link href={buildPageUrl(params, p as number)}>{p}</Link>
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      disabled={page >= totalPages}
                    >
                      <Link
                        href={buildPageUrl(params, page + 1)}
                        aria-disabled={page >= totalPages}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                      >
                        Next
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HugeiconsIcon icon={InvoiceIcon} size={48} className="text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">
                {search || status !== "all" || from || to ? "No invoices match your filters" : "No invoices yet"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                {search || status !== "all" || from || to
                  ? "Try adjusting your filters"
                  : "Create your first invoice to get started"}
              </p>
              {!(search || status !== "all" || from || to) && (
                <Button asChild>
                  <Link href="/dashboard/documents/new?type=invoice">
                    Create Invoice
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function buildPageUrl(
  params: Record<string, string | undefined>,
  page: number
): string {
  const sp = new URLSearchParams()
  if (page > 1) sp.set("page", String(page))
  if (params.status && params.status !== "all") sp.set("status", params.status)
  if (params.search) sp.set("search", params.search)
  if (params.from) sp.set("from", params.from)
  if (params.to) sp.set("to", params.to)
  if (params.sort && params.sort !== "created_at") sp.set("sort", params.sort)
  if (params.order && params.order !== "desc") sp.set("order", params.order)
  if (params.tax && params.tax !== "all") sp.set("tax", params.tax)
  const qs = sp.toString()
  return `/dashboard/invoices${qs ? `?${qs}` : ""}`
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | string)[] = [1]

  if (current > 3) pages.push("...")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push("...")

  pages.push(total)
  return pages
}
