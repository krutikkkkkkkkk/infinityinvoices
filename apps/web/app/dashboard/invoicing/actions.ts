"use server"

import { revalidatePath } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { roundMoney } from "@/lib/invoice-balance"
import { syncInvoiceSettlement } from "@/lib/invoice-settlement"
import { parseDocumentStyle, type DocumentStyle } from "@/lib/document-style"

async function authenticatedClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return { supabase, user }
}

/** Paths that show invoice balances and need refreshing after a settlement change. */
function revalidateInvoice(documentId: string) {
  revalidatePath(`/dashboard/documents/${documentId}`)
  revalidatePath("/dashboard/invoices")
  revalidatePath("/dashboard/credit-notes")
  revalidatePath("/dashboard")
}

/** Open balance computed from the settlement tables (the source of truth, not the cached columns). */
async function openBalance(supabase: SupabaseClient, userId: string, documentId: string, grandTotal: number | string) {
  const [{ data: payments }, { data: credits }] = await Promise.all([
    supabase.from("payment_records").select("amount").eq("document_id", documentId).eq("user_id", userId),
    supabase.from("credit_notes").select("amount").eq("document_id", documentId).eq("user_id", userId),
  ])
  const paid = roundMoney((payments || []).reduce((sum, row) => sum + Number(row.amount), 0))
  const credited = roundMoney((credits || []).reduce((sum, row) => sum + Number(row.amount), 0))
  const remaining = Math.max(0, roundMoney(Number(grandTotal) - paid - credited))
  return { paid, credited, remaining }
}

async function loadInvoice(supabase: SupabaseClient, userId: string, documentId: string) {
  const { data: document, error } = await supabase
    .from("documents")
    .select("id, grand_total, status")
    .eq("id", documentId)
    .eq("user_id", userId)
    .eq("type", "invoice")
    .single()
  if (error || !document) throw new Error("Invoice not found")
  if (document.status === "cancelled") throw new Error("This invoice is cancelled")
  return document
}

export async function recordPayment(input: {
  documentId: string
  amount: number
  paidAt: string
  method?: string
  reference?: string
  notes?: string
}) {
  const { supabase, user } = await authenticatedClient()
  const amount = roundMoney(input.amount)
  if (!Number.isFinite(Number(input.amount)) || amount <= 0) throw new Error("Enter a valid payment amount")
  const paidAt = new Date(input.paidAt)
  if (Number.isNaN(paidAt.getTime())) throw new Error("Enter a valid payment date")

  const document = await loadInvoice(supabase, user.id, input.documentId)
  const { remaining } = await openBalance(supabase, user.id, input.documentId, document.grand_total)
  if (remaining <= 0) throw new Error("This invoice is already settled")
  if (amount > remaining) throw new Error(`Payment cannot exceed the remaining balance of ${remaining.toFixed(2)}`)

  const { error } = await supabase.from("payment_records").insert({
    user_id: user.id,
    document_id: input.documentId,
    amount,
    paid_at: paidAt.toISOString(),
    method: input.method?.trim() || null,
    reference: input.reference?.trim() || null,
    notes: input.notes?.trim() || null,
  })
  if (error) throw new Error(error.message)

  // Partial payments keep the invoice open (sent / overdue); a full one marks it paid
  await syncInvoiceSettlement(supabase, user.id, input.documentId)
  revalidateInvoice(input.documentId)
}

export async function deletePayment(paymentId: string, documentId: string) {
  const { supabase, user } = await authenticatedClient()
  const { error } = await supabase
    .from("payment_records")
    .delete()
    .eq("id", paymentId)
    .eq("document_id", documentId)
    .eq("user_id", user.id)
  if (error) throw new Error(error.message)
  await syncInvoiceSettlement(supabase, user.id, documentId)
  revalidateInvoice(documentId)
}

/** Next CN number, based on the highest existing one so deleted notes never cause duplicates. */
async function nextCreditNoteNumber(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("credit_notes")
    .select("number")
    .eq("user_id", userId)
    .like("number", "CN-%")
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle()
  const last = Number(String(data?.number || "").replace(/\D/g, "")) || 0
  return `CN-${String(last + 1).padStart(4, "0")}`
}

export async function issueCreditNote(input: { documentId: string; amount: number; reason: string }) {
  const { supabase, user } = await authenticatedClient()
  const amount = roundMoney(input.amount)
  const reason = (input.reason || "").trim()
  if (!Number.isFinite(Number(input.amount)) || amount <= 0) throw new Error("Enter a valid credit amount")
  if (!reason) throw new Error("A reason is required for a credit note")

  const document = await loadInvoice(supabase, user.id, input.documentId)
  const { remaining } = await openBalance(supabase, user.id, input.documentId, document.grand_total)
  if (remaining <= 0) throw new Error("This invoice is already settled")
  if (amount > remaining) throw new Error(`Credit cannot exceed the remaining balance of ${remaining.toFixed(2)}`)

  const number = await nextCreditNoteNumber(supabase, user.id)
  const { error } = await supabase.from("credit_notes").insert({
    user_id: user.id,
    document_id: input.documentId,
    number,
    amount,
    reason,
  })
  if (error) throw new Error(error.message)

  await syncInvoiceSettlement(supabase, user.id, input.documentId)
  revalidateInvoice(input.documentId)
  return { number }
}

export async function deleteCreditNote(creditNoteId: string, documentId: string) {
  const { supabase, user } = await authenticatedClient()
  const { error } = await supabase
    .from("credit_notes")
    .delete()
    .eq("id", creditNoteId)
    .eq("document_id", documentId)
    .eq("user_id", user.id)
  if (error) throw new Error(error.message)
  await syncInvoiceSettlement(supabase, user.id, documentId)
  revalidateInvoice(documentId)
}

export async function configureLateFee(input: {
  documentId: string
  feeType: "fixed" | "percentage" | null
  feeValue: number
}) {
  const { supabase, user } = await authenticatedClient()
  const value = Number(input.feeValue)
  if (input.feeType && (!Number.isFinite(value) || value <= 0)) throw new Error("Enter a valid late fee")
  const { error } = await supabase.from("documents").update({
    late_fee_type: input.feeType,
    late_fee_value: input.feeType ? value : null,
  }).eq("id", input.documentId).eq("user_id", user.id).eq("type", "invoice")
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/documents/${input.documentId}`)
}

export async function createRecurringSchedule(input: {
  documentId: string
  frequency: "weekly" | "monthly" | "quarterly" | "yearly"
  nextRunAt: string
  endsAt?: string
}) {
  const { supabase, user } = await authenticatedClient()
  if (!["weekly", "monthly", "quarterly", "yearly"].includes(input.frequency)) throw new Error("Invalid frequency")
  // The cron job copies the source with the service role, so ownership must be checked here
  const { data: document } = await supabase.from("documents").select("id").eq("id", input.documentId).eq("user_id", user.id).eq("type", "invoice").maybeSingle()
  if (!document) throw new Error("Invoice not found")
  const { error } = await supabase.from("recurring_schedules").insert({
    user_id: user.id,
    source_document_id: input.documentId,
    frequency: input.frequency,
    next_run_at: new Date(input.nextRunAt).toISOString(),
    ends_at: input.endsAt ? new Date(input.endsAt).toISOString() : null,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/documents/${input.documentId}`)
}

export async function saveInvoicePreset(name: string, data: Record<string, unknown>) {
  const { supabase, user } = await authenticatedClient()
  if (!name.trim()) throw new Error("Preset name is required")
  const { error } = await supabase.from("invoice_presets").upsert({ user_id: user.id, name: name.trim(), data, updated_at: new Date().toISOString() }, { onConflict: "user_id,name" })
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/documents/new")
}

export interface InvoicePresetSummary {
  id: string
  name: string
  /** The template and colours saved with the preset, if any. */
  style: DocumentStyle | null
}

/** The user's presets with their saved look, for applying a preset's style to any document. */
export async function listInvoicePresets(): Promise<InvoicePresetSummary[]> {
  const { supabase, user } = await authenticatedClient()
  const { data, error } = await supabase.from("invoice_presets").select("id, name, data").eq("user_id", user.id).order("name")
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    style: parseDocumentStyle((row.data as { style?: unknown } | null)?.style),
  }))
}

export async function deleteInvoicePreset(id: string) {
  const { supabase, user } = await authenticatedClient()
  const { error } = await supabase.from("invoice_presets").delete().eq("id", id).eq("user_id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/documents/new")
}
