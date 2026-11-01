"use server"

import { revalidatePath } from "next/cache"
import { and, asc, creditNotes, db, desc, documents, eq, invoicePresets, like, paymentRecords, recurringSchedules } from "@infinity/db"
import { requireUser } from "@/lib/auth/server"
import { roundMoney } from "@/lib/invoice-balance"
import { syncInvoiceSettlement } from "@/lib/invoice-settlement"
import { parseDocumentStyle, type DocumentStyle } from "@/lib/document-style"
import { getPlanForUser } from "@/lib/plan-server"
import { canAddPreset } from "@/lib/plans"

/** Paths that show invoice balances and need refreshing after a settlement change. */
function revalidateInvoice(documentId: string) {
  revalidatePath(`/dashboard/documents/${documentId}`)
  revalidatePath("/dashboard/invoices")
  revalidatePath("/dashboard/credit-notes")
  revalidatePath("/dashboard")
}

/** Open balance computed from the settlement tables (the source of truth, not the cached columns). */
async function openBalance(userId: string, documentId: string, grandTotal: number | string) {
  const [payments, credits] = await Promise.all([
    db.select({ amount: paymentRecords.amount }).from(paymentRecords).where(and(eq(paymentRecords.document_id, documentId), eq(paymentRecords.user_id, userId))),
    db.select({ amount: creditNotes.amount }).from(creditNotes).where(and(eq(creditNotes.document_id, documentId), eq(creditNotes.user_id, userId))),
  ])
  const paid = roundMoney(payments.reduce((sum, row) => sum + Number(row.amount), 0))
  const credited = roundMoney(credits.reduce((sum, row) => sum + Number(row.amount), 0))
  const remaining = Math.max(0, roundMoney(Number(grandTotal) - paid - credited))
  return { paid, credited, remaining }
}

async function loadInvoice(userId: string, documentId: string) {
  const [document] = await db
    .select({ id: documents.id, grand_total: documents.grand_total, status: documents.status })
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.user_id, userId), eq(documents.type, "invoice")))
    .limit(1)
  if (!document) throw new Error("Invoice not found")
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
  const user = await requireUser()
  const amount = roundMoney(input.amount)
  if (!Number.isFinite(Number(input.amount)) || amount <= 0) throw new Error("Enter a valid payment amount")
  const paidAt = new Date(input.paidAt)
  if (Number.isNaN(paidAt.getTime())) throw new Error("Enter a valid payment date")

  const document = await loadInvoice(user.id, input.documentId)
  const { remaining } = await openBalance(user.id, input.documentId, document.grand_total)
  if (remaining <= 0) throw new Error("This invoice is already settled")
  if (amount > remaining) throw new Error(`Payment cannot exceed the remaining balance of ${remaining.toFixed(2)}`)

  await db.insert(paymentRecords).values({
    user_id: user.id,
    document_id: input.documentId,
    amount,
    paid_at: paidAt.toISOString(),
    method: input.method?.trim() || null,
    reference: input.reference?.trim() || null,
    notes: input.notes?.trim() || null,
  })

  // Partial payments keep the invoice open (sent / overdue); a full one marks it paid
  await syncInvoiceSettlement(user.id, input.documentId)
  revalidateInvoice(input.documentId)
}

export async function deletePayment(paymentId: string, documentId: string) {
  const user = await requireUser()
  await db
    .delete(paymentRecords)
    .where(and(eq(paymentRecords.id, paymentId), eq(paymentRecords.document_id, documentId), eq(paymentRecords.user_id, user.id)))
  await syncInvoiceSettlement(user.id, documentId)
  revalidateInvoice(documentId)
}

/** Next CN number, based on the highest existing one so deleted notes never cause duplicates. */
async function nextCreditNoteNumber(userId: string) {
  const [last] = await db
    .select({ number: creditNotes.number })
    .from(creditNotes)
    .where(and(eq(creditNotes.user_id, userId), like(creditNotes.number, "CN-%")))
    .orderBy(desc(creditNotes.number))
    .limit(1)
  const lastNumber = Number(String(last?.number || "").replace(/\D/g, "")) || 0
  return `CN-${String(lastNumber + 1).padStart(4, "0")}`
}

export async function issueCreditNote(input: { documentId: string; amount: number; reason: string }) {
  const user = await requireUser()
  const amount = roundMoney(input.amount)
  const reason = (input.reason || "").trim()
  if (!Number.isFinite(Number(input.amount)) || amount <= 0) throw new Error("Enter a valid credit amount")
  if (!reason) throw new Error("A reason is required for a credit note")

  const document = await loadInvoice(user.id, input.documentId)
  const { remaining } = await openBalance(user.id, input.documentId, document.grand_total)
  if (remaining <= 0) throw new Error("This invoice is already settled")
  if (amount > remaining) throw new Error(`Credit cannot exceed the remaining balance of ${remaining.toFixed(2)}`)

  const number = await nextCreditNoteNumber(user.id)
  await db.insert(creditNotes).values({
    user_id: user.id,
    document_id: input.documentId,
    number,
    amount,
    reason,
  })

  await syncInvoiceSettlement(user.id, input.documentId)
  revalidateInvoice(input.documentId)
  return { number }
}

export async function deleteCreditNote(creditNoteId: string, documentId: string) {
  const user = await requireUser()
  await db
    .delete(creditNotes)
    .where(and(eq(creditNotes.id, creditNoteId), eq(creditNotes.document_id, documentId), eq(creditNotes.user_id, user.id)))
  await syncInvoiceSettlement(user.id, documentId)
  revalidateInvoice(documentId)
}

export async function configureLateFee(input: {
  documentId: string
  feeType: "fixed" | "percentage" | null
  feeValue: number
}) {
  const user = await requireUser()
  const value = Number(input.feeValue)
  if (input.feeType && (!Number.isFinite(value) || value <= 0)) throw new Error("Enter a valid late fee")
  await db
    .update(documents)
    .set({
      late_fee_type: input.feeType,
      late_fee_value: input.feeType ? value : null,
    })
    .where(and(eq(documents.id, input.documentId), eq(documents.user_id, user.id), eq(documents.type, "invoice")))
  revalidatePath(`/dashboard/documents/${input.documentId}`)
}

/**
 * Recurring drafts are a Pro feature. Errors are returned rather than thrown so production builds
 * don't mask the message.
 */
export async function createRecurringSchedule(input: {
  documentId: string
  frequency: "weekly" | "monthly" | "quarterly" | "yearly"
  nextRunAt: string
  endsAt?: string
}): Promise<{ error?: string }> {
  const user = await requireUser()
  if (!(await getPlanForUser(user.id)).recurringInvoices) {
    return { error: "PRO_REQUIRED:Recurring invoices are a Pro feature. Upgrade to Pro to create drafts automatically." }
  }
  if (!["weekly", "monthly", "quarterly", "yearly"].includes(input.frequency)) return { error: "Invalid frequency" }
  const nextRunAt = new Date(input.nextRunAt)
  const endsAt = input.endsAt ? new Date(input.endsAt) : null
  if (Number.isNaN(nextRunAt.getTime())) return { error: "Choose a valid first draft date" }
  if (endsAt && (Number.isNaN(endsAt.getTime()) || endsAt < nextRunAt)) return { error: "Choose a valid end date" }

  // The cron job copies the source for any user, so ownership must be checked here
  const [document] = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.id, input.documentId), eq(documents.user_id, user.id), eq(documents.type, "invoice")))
    .limit(1)
  if (!document) return { error: "Invoice not found" }

  // One active schedule per invoice, or each run would create several drafts
  const active = await db.$count(
    recurringSchedules,
    and(eq(recurringSchedules.source_document_id, input.documentId), eq(recurringSchedules.user_id, user.id), eq(recurringSchedules.active, true))
  )
  if (active > 0) return { error: "This invoice already has a recurring schedule" }

  await db.insert(recurringSchedules).values({
    user_id: user.id,
    source_document_id: input.documentId,
    frequency: input.frequency,
    next_run_at: nextRunAt.toISOString(),
    ends_at: endsAt?.toISOString() ?? null,
  })
  revalidatePath(`/dashboard/documents/${input.documentId}`)
  return {}
}

const MAX_PRESET_NAME_LENGTH = 100
// A preset is a document's form data; this is far above a real one, but stops multi-MB rows
const MAX_PRESET_BYTES = 64 * 1024

/**
 * Saves a preset, replacing the user's preset of the same name. Free plans are limited to
 * `plan.limits.presets`; overwriting an existing preset is always allowed.
 */
export async function saveInvoicePreset(name: string, data: Record<string, unknown>): Promise<{ error?: string }> {
  const user = await requireUser()
  const presetName = typeof name === "string" ? name.trim() : ""
  if (!presetName) return { error: "Preset name is required" }
  if (presetName.length > MAX_PRESET_NAME_LENGTH) return { error: `Preset names can be at most ${MAX_PRESET_NAME_LENGTH} characters` }
  if (!data || typeof data !== "object" || Array.isArray(data)) return { error: "Invalid preset data" }
  if (Buffer.byteLength(JSON.stringify(data)) > MAX_PRESET_BYTES) return { error: "This preset is too large to save" }

  const plan = await getPlanForUser(user.id)
  if (plan.limits.presets !== -1) {
    const [existing] = await db
      .select({ id: invoicePresets.id })
      .from(invoicePresets)
      .where(and(eq(invoicePresets.user_id, user.id), eq(invoicePresets.name, presetName)))
      .limit(1)
    if (!existing && !canAddPreset(plan, await db.$count(invoicePresets, eq(invoicePresets.user_id, user.id)))) {
      return {
        error: `PRO_REQUIRED:The ${plan.name} plan includes ${plan.limits.presets} invoice preset. Delete it or upgrade to Pro for unlimited presets.`,
      }
    }
  }

  await db
    .insert(invoicePresets)
    .values({ user_id: user.id, name: presetName, data })
    .onConflictDoUpdate({
      target: [invoicePresets.user_id, invoicePresets.name],
      set: { data, updated_at: new Date().toISOString() },
    })
  revalidatePath("/dashboard/documents/new")
  revalidatePath("/dashboard/presets")
  return {}
}

export interface InvoicePresetSummary {
  id: string
  name: string
  /** The template and colours saved with the preset, if any. */
  style: DocumentStyle | null
}

/** The user's presets with their saved look, for applying a preset's style to any document. */
export async function listInvoicePresets(): Promise<InvoicePresetSummary[]> {
  const user = await requireUser()
  const rows = await db
    .select({ id: invoicePresets.id, name: invoicePresets.name, data: invoicePresets.data })
    .from(invoicePresets)
    .where(eq(invoicePresets.user_id, user.id))
    .orderBy(asc(invoicePresets.name))
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    style: parseDocumentStyle((row.data as { style?: unknown } | null)?.style),
  }))
}

export async function deleteInvoicePreset(id: string) {
  const user = await requireUser()
  await db.delete(invoicePresets).where(and(eq(invoicePresets.id, id), eq(invoicePresets.user_id, user.id)))
  revalidatePath("/dashboard/documents/new")
}
