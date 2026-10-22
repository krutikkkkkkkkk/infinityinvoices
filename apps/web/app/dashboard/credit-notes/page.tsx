import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data } = await supabase
    .from("credit_notes")
    .select("id, number, amount, reason, issued_at, document_id, documents:document_id(number, client_name, currency)")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false })
    .limit(200)
  const notes = (data || []) as unknown as CreditNoteRow[]

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
