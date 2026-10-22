import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { roundMoney } from "@/lib/invoice-balance"
import { startOfToday, toISODate } from "@/lib/date-range"

/**
 * Recomputes an invoice's paid / credited totals from payment_records and credit_notes
 * and stores them on the document together with the resulting status.
 *
 * Works with either the user client (RLS) or the admin client, so every query is
 * scoped to `userId` explicitly. Callers must have authorised `userId` already.
 */
export async function syncInvoiceSettlement(supabase: SupabaseClient, userId: string, documentId: string) {
  const [{ data: document, error: documentError }, { data: payments }, { data: credits }] = await Promise.all([
    supabase.from("documents").select("id, grand_total, status, due_date").eq("id", documentId).eq("user_id", userId).eq("type", "invoice").single(),
    supabase.from("payment_records").select("amount").eq("document_id", documentId).eq("user_id", userId),
    supabase.from("credit_notes").select("amount").eq("document_id", documentId).eq("user_id", userId),
  ])
  if (documentError || !document) throw new Error("Invoice not found")

  const paid = roundMoney((payments || []).reduce((sum, row) => sum + Number(row.amount), 0))
  const credited = roundMoney((credits || []).reduce((sum, row) => sum + Number(row.amount), 0))
  const total = roundMoney(document.grand_total)
  const settled = roundMoney(paid + credited)
  const remaining = Math.max(0, roundMoney(total - settled))

  let status: string = document.status
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

  const update = (values: Record<string, unknown>) =>
    supabase.from("documents").update(values).eq("id", documentId).eq("user_id", userId)
  let { error } = await update({ amount_paid: paid, credit_total: credited, status })
  if (error && /credit_total/.test(error.message)) {
    // scripts/018_settlements.sql not applied yet: keep payments working, credits stay panel-only
    console.warn("documents.credit_total is missing; run scripts/018_settlements.sql")
    ;({ error } = await update({ amount_paid: paid, status }))
  }
  if (error) throw new Error(error.message)

  return { paid, credited, settled, remaining, status }
}
