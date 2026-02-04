import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import { Files01Icon, InvoiceIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Document, CURRENCIES } from "@/lib/types"

function formatCurrency(amount: number, currency: string) {
  const currencyData = CURRENCIES.find((c) => c.value === currency)
  return `${currencyData?.symbol || ""}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    sent: "default",
    paid: "default",
    overdue: "destructive",
    cancelled: "outline",
  }
  return (
    <Badge variant={variants[status] || "secondary"} className="capitalize">
      {status}
    </Badge>
  )
}

export default async function QuotationsPage() {
  const supabase = await createClient()

  const { data: quotations } = await supabase
    .from("documents")
    .select("*")
    .eq("type", "quotation")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            Manage your quotations and proposals
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/documents/new?type=quotation">
            <HugeiconsIcon icon={Files01Icon} size={16} className="mr-2" />
            New Quotation
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          {quotations && quotations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(quotations as Document[]).map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/documents/${quotation.id}`}
                        className="hover:underline"
                      >
                        {quotation.number}
                      </Link>
                    </TableCell>
                    <TableCell>{quotation.client_name || "-"}</TableCell>
                    <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                    <TableCell>
                      {new Date(quotation.issue_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {quotation.due_date
                        ? new Date(quotation.due_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(quotation.grand_total), quotation.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HugeiconsIcon icon={InvoiceIcon} size={48} className="text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No quotations yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Create your first quotation to get started
              </p>
              <Button asChild>
                <Link href="/dashboard/documents/new?type=quotation">
                  Create Quotation
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
