"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

async function authenticatedClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return { supabase, user }
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
  const amount = Number(input.amount)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid payment amount")

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, grand_total")
    .eq("id", input.documentId)
    .eq("user_id", user.id)
    .eq("type", "invoice")
    .single()
  if (documentError || !document) throw new Error("Invoice not found")

  const [{ data: payments }, { data: credits }] = await Promise.all([
    supabase.from("payment_records").select("amount").eq("document_id", input.documentId).eq("user_id", user.id),
    supabase.from("credit_notes").select("amount").eq("document_id", input.documentId).eq("user_id", user.id),
  ])
  const paid = (payments || []).reduce((sum, row) => sum + Number(row.amount), 0)
  const credited = (credits || []).reduce((sum, row) => sum + Number(row.amount), 0)
  const remaining = Math.max(0, Number(document.grand_total) - paid - credited)
  if (amount > remaining) throw new Error("Payment cannot exceed the remaining balance")

  const { error } = await supabase.from("payment_records").insert({
    user_id: user.id,
    document_id: input.documentId,
    amount,
    paid_at: new Date(input.paidAt).toISOString(),
    method: input.method || null,
    reference: input.reference || null,
    notes: input.notes || null,
  })
  if (error) throw new Error(error.message)

  const newPaid = paid + amount
  await supabase.from("documents").update({
    amount_paid: newPaid,
    status: newPaid + credited >= Number(document.grand_total) ? "paid" : "sent",
  }).eq("id", input.documentId).eq("user_id", user.id)

  revalidatePath(`/dashboard/documents/${input.documentId}`)
}

export async function deletePayment(paymentId: string, documentId: string) {
  const { supabase, user } = await authenticatedClient()
  const { error } = await supabase.from("payment_records").delete().eq("id", paymentId).eq("user_id", user.id)
  if (error) throw new Error(error.message)

  const { data: payments } = await supabase.from("payment_records").select("amount").eq("document_id", documentId).eq("user_id", user.id)
  const amountPaid = (payments || []).reduce((sum, row) => sum + Number(row.amount), 0)
  await supabase.from("documents").update({ amount_paid: amountPaid, status: amountPaid > 0 ? "sent" : "sent" }).eq("id", documentId).eq("user_id", user.id)
  revalidatePath(`/dashboard/documents/${documentId}`)
}

export async function issueCreditNote(input: { documentId: string; amount: number; reason: string }) {
  const { supabase, user } = await authenticatedClient()
  const amount = Number(input.amount)
  if (!Number.isFinite(amount) || amount <= 0 || !input.reason.trim()) throw new Error("Amount and reason are required")

  const { data: document } = await supabase.from("documents").select("id, grand_total").eq("id", input.documentId).eq("user_id", user.id).eq("type", "invoice").single()
  if (!document) throw new Error("Invoice not found")

  const [{ data: payments }, { data: credits }, { count }] = await Promise.all([
    supabase.from("payment_records").select("amount").eq("document_id", input.documentId).eq("user_id", user.id),
    supabase.from("credit_notes").select("amount").eq("document_id", input.documentId).eq("user_id", user.id),
    supabase.from("credit_notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ])
  const settled = [...(payments || []), ...(credits || [])].reduce((sum, row) => sum + Number(row.amount), 0)
  if (amount > Math.max(0, Number(document.grand_total) - settled)) throw new Error("Credit cannot exceed the remaining balance")

  const number = `CN-${String((count || 0) + 1).padStart(4, "0")}`
  const { error } = await supabase.from("credit_notes").insert({ user_id: user.id, document_id: input.documentId, number, amount, reason: input.reason.trim() })
  if (error) throw new Error(error.message)

  if (settled + amount >= Number(document.grand_total)) {
    await supabase.from("documents").update({ status: "paid" }).eq("id", input.documentId).eq("user_id", user.id)
  }
  revalidatePath(`/dashboard/documents/${input.documentId}`)
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

export async function deleteInvoicePreset(id: string) {
  const { supabase, user } = await authenticatedClient()
  const { error } = await supabase.from("invoice_presets").delete().eq("id", id).eq("user_id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/documents/new")
}
