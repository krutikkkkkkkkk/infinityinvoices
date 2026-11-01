import Link from "next/link"
import { creditNotes, db, desc, documents, eq } from "@infinity/db"
import { requireUserOrRedirect } from "@/lib/auth/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CURRENCIES } from "@/lib/types"
import { formatDate } from "@/lib/format"

type CreditNoteRow = {
  id: string
  number: string
  amount: number
  reason: string
  issued_at: string
  document_id: string
  documents: { number: string; client_name: string | null; currency: string } | null
}

function money(amount: number, currency: string) {
  const symbol = CURRENCIES.find((item) => item.value === currency)?.symbol || currency
  return `${symbol}${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function CreditNotesPage() {
  const user = await requireUserOrRedirect()

  const notes: CreditNoteRow[] = await db
    .select({
      id: creditNotes.id,
      number: creditNotes.number,
      amount: creditNotes.amount,
      reason: creditNotes.reason,
      issued_at: creditNotes.issued_at,
      document_id: creditNotes.document_id,
      documents: { number: documents.number, client_name: documents.client_name, currency: documents.currency },
    })
    .from(creditNotes)
    .leftJoin(documents, eq(documents.id, creditNotes.document_id))
    .where(eq(creditNotes.user_id, user.id))
    .orderBy(desc(creditNotes.issued_at))
    .limit(200)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Credit notes</h1>
        <p className="text-muted-foreground">Credits issued against invoices. Issue or void one from the invoice itself.</p>
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
                  <TableHead>Issued</TableHead>
                  <TableHead>Reason</TableHead>
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
                    <TableCell>{formatDate(note.issued_at)}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground" title={note.reason}>{note.reason}</TableCell>
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
            <p className="font-medium">No credit notes yet</p>
            <p className="max-w-md text-sm text-muted-foreground">Open an invoice and choose “Issue credit” to reduce its balance without recording a payment.</p>
            <Button asChild><Link href="/dashboard/invoices">Go to invoices</Link></Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
