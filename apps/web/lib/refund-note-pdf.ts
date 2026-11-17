import "server-only"

import { and, db, documents, eq, paymentRecords, profiles, refundNotes } from "@infinity/db"
import { roundMoney } from "@/lib/invoice-balance"
import { getPlanForUser } from "@/lib/plan-server"
import { applyBranding } from "@/lib/plans"
import { renderHtmlToPdf } from "@/lib/pdf/render"
import { inlineRemoteImages } from "@/lib/pdf/inline-images"
import { generateRefundNoteHTML, refundNoteFileName } from "@/lib/refund-note-html"

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * A refund note with its invoice, totals and the owner's profile. Scoped to `userId`: returns null
 * unless the refund note and its invoice both belong to that user.
 */
export async function loadRefundNote(userId: string, refundNoteId: string) {
  if (!UUID_REGEX.test(refundNoteId)) return null

  const [row] = await db
    .select({
      refund: {
        id: refundNotes.id,
        number: refundNotes.number,
        amount: refundNotes.amount,
        reason: refundNotes.reason,
        method: refundNotes.method,
        reference: refundNotes.reference,
        refunded_at: refundNotes.refunded_at,
        emailed_at: refundNotes.emailed_at,
      },
      invoice: {
        id: documents.id,
        number: documents.number,
        issue_date: documents.issue_date,
        currency: documents.currency,
        grand_total: documents.grand_total,
        client_name: documents.client_name,
        client_email: documents.client_email,
        client_address: documents.client_address,
        client_gst_id: documents.client_gst_id,
      },
    })
    .from(refundNotes)
    .innerJoin(documents, and(eq(documents.id, refundNotes.document_id), eq(documents.user_id, userId)))
    .where(and(eq(refundNotes.id, refundNoteId), eq(refundNotes.user_id, userId)))
    .limit(1)
  if (!row) return null

  const [payments, refunds, [profile], plan] = await Promise.all([
    db.select({ amount: paymentRecords.amount }).from(paymentRecords).where(and(eq(paymentRecords.document_id, row.invoice.id), eq(paymentRecords.user_id, userId))),
    db.select({ amount: refundNotes.amount }).from(refundNotes).where(and(eq(refundNotes.document_id, row.invoice.id), eq(refundNotes.user_id, userId))),
    db.select().from(profiles).where(eq(profiles.id, userId)).limit(1),
    getPlanForUser(userId),
  ])

  return {
    refund: row.refund,
    invoice: row.invoice,
    totals: {
      paid: roundMoney(payments.reduce((sum, item) => sum + Number(item.amount), 0)),
      refunded: roundMoney(refunds.reduce((sum, item) => sum + Number(item.amount), 0)),
    },
    // Logo only on plans with custom branding, as on invoices
    profile: applyBranding(plan, profile ?? null),
  }
}

export type LoadedRefundNote = NonNullable<Awaited<ReturnType<typeof loadRefundNote>>>

/** Renders the refund note to PDF; `pdf` is null when no headless browser is available. */
export async function renderRefundNotePdf(note: LoadedRefundNote) {
  const html = await inlineRemoteImages(
    generateRefundNoteHTML(
      { ...note.refund, amount: Number(note.refund.amount) },
      { ...note.invoice, grand_total: Number(note.invoice.grand_total) },
      note.totals,
      note.profile
    )
  )
  const fileName = refundNoteFileName(note.refund.number)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return { html, fileName, pdf: Buffer.from(await renderHtmlToPdf(html)) }
    } catch (error) {
      console.error(`[pdf] Refund note rendering failed (attempt ${attempt}/2):`, error)
    }
  }
  return { html, fileName, pdf: null as Buffer | null }
}
