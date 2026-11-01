import "server-only"

import { and, creditNotes, db, documents, eq, paymentRecords } from "@infinity/db"
import { roundMoney } from "@/lib/invoice-balance"
import { startOfToday, toISODate } from "@/lib/date-range"

/**
 * Recomputes an invoice's paid / credited totals from payment_records and credit_notes
 * and stores them on the document together with the resulting status.
 *
 * Every query is scoped to `userId` explicitly. Callers must have authorised `userId` already.
 */
export async function syncInvoiceSettlement(userId: string, documentId: string) {
  const [[document], payments, credits] = await Promise.all([
    db
      .select({ id: documents.id, grand_total: documents.grand_total, status: documents.status, due_date: documents.due_date })
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.user_id, userId), eq(documents.type, "invoice")))
      .limit(1),
    db.select({ amount: paymentRecords.amount }).from(paymentRecords).where(and(eq(paymentRecords.document_id, documentId), eq(paymentRecords.user_id, userId))),
    db.select({ amount: creditNotes.amount }).from(creditNotes).where(and(eq(creditNotes.document_id, documentId), eq(creditNotes.user_id, userId))),
  ])
  if (!document) throw new Error("Invoice not found")

  const paid = roundMoney(payments.reduce((sum, row) => sum + Number(row.amount), 0))
  const credited = roundMoney(credits.reduce((sum, row) => sum + Number(row.amount), 0))
  const total = roundMoney(document.grand_total)
  const settled = roundMoney(paid + credited)
  const remaining = Math.max(0, roundMoney(total - settled))

  let status: typeof document.status = document.status
  if (status !== "cancelled") {
    if (total > 0 && settled >= total) {
      status = "paid"
    } else if (status === "paid" || status === "sent" || status === "overdue") {
      // Partially settled (or a payment was removed): back to open, overdue if past due
      const pastDue = Boolean(document.due_date) && String(document.due_date).slice(0, 10) < toISODate(startOfToday())
      status = pastDue ? "overdue" : "sent"
    }
    // Drafts stay drafts until fully settled or sent
  }

  await db
    .update(documents)
    .set({ amount_paid: paid, credit_total: credited, status })
    .where(and(eq(documents.id, documentId), eq(documents.user_id, userId)))

  return { paid, credited, settled, remaining, status }
}
