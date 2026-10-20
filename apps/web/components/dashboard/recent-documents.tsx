import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, File01Icon, Invoice01Icon } from "@hugeicons/core-free-icons"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { StatusSelect } from "@/components/dashboard/status-select"
import { formatDate, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

type RecentDocument = {
  id: string
  number: string
  type: string
  status: string
  client_name: string | null
  grand_total: number | string | null
  currency: string
  due_date: string | null
}

function isPastDue(doc: RecentDocument) {
  if (!doc.due_date || doc.status === "paid" || doc.status === "cancelled") return false
  return new Date(doc.due_date) < new Date(new Date().toDateString())
}

export function RecentDocuments({ documents }: { documents: RecentDocument[] }) {
  return (
    <Card className="gap-4">
      <CardHeader className="flex items-center gap-2.5 px-5 sm:px-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted ring-1 ring-border/60" aria-hidden>
          <HugeiconsIcon icon={File01Icon} size={16} />
        </span>
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-medium">Recent documents</CardTitle>
          <CardDescription className="text-xs">Your latest invoices and quotations</CardDescription>
        </div>
        {documents.length > 0 && (
          <CardAction className="ml-auto self-center">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/dashboard/invoices">
                View all
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-5 sm:px-6">
        {documents.length === 0 ? (
          <Empty className="rounded-xl border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Invoice01Icon} />
              </EmptyMedia>
              <EmptyTitle className="text-base">No documents yet</EmptyTitle>
              <EmptyDescription>Create your first invoice or quotation — it takes about a minute.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center">
              <Button asChild size="sm">
                <Link href="/dashboard/documents/new?type=invoice">Create invoice</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/documents/new?type=quotation">Create quotation</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            {/* Mobile: stacked list */}
            <ul className="divide-y rounded-xl border md:hidden">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 p-3">
                  <Link href={`/dashboard/documents/${doc.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {doc.number}
                      <span className="ml-2 text-xs font-normal capitalize text-muted-foreground">{doc.type}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{doc.client_name || "No client"}</p>
                  </Link>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-medium tabular-nums">
                      {formatMoney(Number(doc.grand_total) || 0, doc.currency)}
                    </span>
                    <StatusSelect documentId={doc.id} currentStatus={doc.status} documentNumber={doc.number} compact />
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/documents/${doc.id}`} className="font-medium hover:underline">
                            {doc.number}
                          </Link>
                          <Badge variant="outline" className="font-normal capitalize text-muted-foreground">
                            {doc.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-muted-foreground">
                        {doc.client_name || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusSelect documentId={doc.id} currentStatus={doc.status} documentNumber={doc.number} compact />
                      </TableCell>
                      <TableCell className={cn("tabular-nums", isPastDue(doc) ? "text-destructive" : "text-muted-foreground")}>
                        {formatDate(doc.due_date)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatMoney(Number(doc.grand_total) || 0, doc.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
