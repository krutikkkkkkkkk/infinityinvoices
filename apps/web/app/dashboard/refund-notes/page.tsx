import Link from "next/link"
import { and, db, desc, documents, eq, refundNotes } from "@infinity/db"
import { requireUserOrRedirect } from "@/lib/auth/server"
import { getPlanForUser } from "@/lib/plan-server"
import { refundMethodLabel } from "@/lib/refund-methods"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CURRENCIES } from "@/lib/types"
import { formatDate } from "@/lib/format"

function money(amount: number, currency: string) {
  const symbol = CURRENCIES.find((item) => item.value === currency)?.symbol || currency
  return `${symbol}${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function RefundNotesPage() {
  const user = await requireUserOrRedirect()

  const [notes, plan] = await Promise.all([
    db
      .select({
        id: refundNotes.id,
        number: refundNotes.number,
        amount: refundNotes.amount,
        reason: refundNotes.reason,
        method: refundNotes.method,
        refunded_at: refundNotes.refunded_at,
        emailed_at: refundNotes.emailed_at,
        document_id: refundNotes.document_id,
        documents: { number: documents.number, client_name: documents.client_name, currency: documents.currency },
      })
      .from(refundNotes)
      .leftJoin(documents, and(eq(documents.id, refundNotes.document_id), eq(documents.user_id, user.id)))
      .where(eq(refundNotes.user_id, user.id))
      .orderBy(desc(refundNotes.refunded_at))
      .limit(200),
    getPlanForUser(user.id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Refund notes</h1>
        <p className="text-muted-foreground">
          Money returned to clients against paid invoices. Issue, download or void one from the invoice itself.
          {plan.refundEmails ? " You can also email it to the client from there." : (
            <> Emailing refund notes to clients is part of <Link href="/dashboard/plan" className="underline underline-offset-2">Pro</Link>.</>
          )}
        </p>
      </div>
      {notes.length ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Refunded</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.number}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/documents/${note.document_id}`} className="hover:underline">{note.documents?.number || "Invoice"}</Link>
                    </TableCell>
                    <TableCell>{note.documents?.client_name || "-"}</TableCell>
                    <TableCell>{formatDate(note.refunded_at)}</TableCell>
                    <TableCell>{refundMethodLabel(note.method) || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground" title={note.reason}>{note.reason}</TableCell>
                    <TableCell>
                      {note.emailed_at ? <Badge variant="outline">Sent {formatDate(note.emailed_at)}</Badge> : <span className="text-muted-foreground">Not sent</span>}
                    </TableCell>
                    <TableCell className="text-right">{money(note.amount, note.documents?.currency || "INR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="font-medium">No refund notes yet</p>
            <p className="max-w-md text-sm text-muted-foreground">Open a paid invoice and choose “Issue refund” to record money returned to the client.</p>
            <Button asChild><Link href="/dashboard/invoices">Go to invoices</Link></Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
