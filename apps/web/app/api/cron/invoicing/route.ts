import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { consumeUsage } from "@/lib/usage"
import { sendInvoiceReminder } from "@/lib/reminders"

// Rendering a PDF per reminder is slow; give the job room beyond the default
export const maxDuration = 300

// Once an invoice is overdue, clients with auto reminders get one email per week
const REMINDER_INTERVAL_DAYS = 7
// Cap per run so a backlog cannot blow the function timeout; the rest go next night
const MAX_REMINDERS_PER_RUN = 50

function advanceDate(date: Date, frequency: string) {
  const next = new Date(date)
  if (frequency === "weekly") next.setUTCDate(next.getUTCDate() + 7)
  if (frequency === "monthly") next.setUTCMonth(next.getUTCMonth() + 1)
  if (frequency === "quarterly") next.setUTCMonth(next.getUTCMonth() + 3)
  if (frequency === "yearly") next.setUTCFullYear(next.getUTCFullYear() + 1)
  return next
}

export async function GET() {
  const requestHeaders = await headers()
  // Fail closed: without CRON_SECRET anyone could trigger this service-role job
  if (!process.env.CRON_SECRET || requestHeaders.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const { data: schedules, error } = await supabase
    .from("recurring_schedules")
    .select("*, documents(*, line_items(*))")
    .eq("active", true)
    .lte("next_run_at", now.toISOString())
    .limit(100)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  let draftsCreated = 0
  let skippedOverLimit = 0
  for (const schedule of schedules || []) {
    const source = schedule.documents
    // The source must belong to the schedule's owner, or this would copy another user's invoice
    if (!source || source.user_id !== schedule.user_id || (schedule.ends_at && new Date(schedule.ends_at) < now)) {
      await supabase.from("recurring_schedules").update({ active: false }).eq("id", schedule.id)
      continue
    }
    // Recurring drafts count toward the monthly invoice limit. Over the limit, leave the
    // schedule due so it runs once the month resets or the user upgrades.
    const { allowed } = await consumeUsage(supabase, schedule.user_id, "invoice")
    if (!allowed) {
      skippedOverLimit++
      continue
    }
    const { count } = await supabase.from("documents").select("id", { count: "exact", head: true }).eq("user_id", schedule.user_id).eq("type", "invoice")
    const issueDate = now.toISOString().slice(0, 10)
    const originalIssue = new Date(source.issue_date)
    const originalDue = source.due_date ? new Date(source.due_date) : null
    const dueDays = originalDue ? Math.max(0, Math.round((originalDue.getTime() - originalIssue.getTime()) / 86400000)) : 0
    const dueDate = new Date(now.getTime() + dueDays * 86400000).toISOString().slice(0, 10)
    const { data: draft } = await supabase.from("documents").insert({
      user_id: schedule.user_id, client_id: source.client_id, type: "invoice",
      number: `INV-${String((count || 0) + 1).padStart(4, "0")}`, issue_date: issueDate,
      due_date: dueDate, status: "draft", currency: source.currency, subtotal: source.subtotal,
      tax_total: source.tax_total, discount_type: source.discount_type, discount_value: source.discount_value,
      grand_total: source.grand_total, notes: source.notes, terms: source.terms,
      payment_method: source.payment_method, upi_id: source.upi_id,
      payment_methods: source.payment_methods ?? null, payment_method_type: source.payment_method_type ?? null,
      paypal_email: source.paypal_email ?? null, bank_name: source.bank_name ?? null,
      bank_account_name: source.bank_account_name ?? null, bank_account_number: source.bank_account_number ?? null,
      bank_routing_number: source.bank_routing_number ?? null, bank_swift_code: source.bank_swift_code ?? null,
      client_name: source.client_name,
      client_email: source.client_email, client_address: source.client_address, client_gst_id: source.client_gst_id,
      include_tax: source.include_tax, late_fee_type: source.late_fee_type, late_fee_value: source.late_fee_value,
      parent_document_id: source.id,
    }).select("id").single()
    if (draft && source.line_items?.length) {
      await supabase.from("line_items").insert(source.line_items.map((item: Record<string, unknown>, index: number) => ({
        document_id: draft.id, name: item.name, description: item.description, quantity: item.quantity,
        rate: item.rate, tax_percent: item.tax_percent, line_total: item.line_total, sort_order: index,
      })))
    }
    if (draft) draftsCreated++
    const nextRun = advanceDate(new Date(schedule.next_run_at), schedule.frequency)
    await supabase.from("recurring_schedules").update({ last_run_at: now.toISOString(), next_run_at: nextRun.toISOString(), updated_at: now.toISOString() }).eq("id", schedule.id)
  }

  const today = now.toISOString().slice(0, 10)
  const { data: overdue } = await supabase.from("documents").select("id, user_id, grand_total, late_fee_type, late_fee_value").eq("type", "invoice").not("late_fee_type", "is", null).lt("due_date", today).neq("status", "paid").neq("status", "cancelled")
  let lateFeesApplied = 0
  for (const invoice of overdue || []) {
    const value = Number(invoice.late_fee_value || 0)
    const amount = invoice.late_fee_type === "percentage" ? Number(invoice.grand_total) * value / 100 : value
    if (amount <= 0) continue
    const { error: feeError } = await supabase.from("late_fee_applications").insert({ user_id: invoice.user_id, document_id: invoice.id, fee_type: invoice.late_fee_type, fee_value: value, amount })
    if (!feeError) {
      await supabase.from("documents").update({ grand_total: Number(invoice.grand_total) + amount, status: "overdue" }).eq("id", invoice.id)
      lateFeesApplied++
    }
  }

  // Weekly overdue reminders: only for clients that opted in, only once per 7 days per
  // invoice (manual reminders also set last_reminder_sent, so they push the next one out).
  const reminderCutoff = new Date(now.getTime() - REMINDER_INTERVAL_DAYS * 86400000).toISOString()
  const { data: dueForReminder, error: reminderQueryError } = await supabase
    .from("documents")
    .select("id, user_id, clients!inner(auto_reminder)")
    .eq("type", "invoice")
    .in("status", ["sent", "overdue"])
    .lt("due_date", today)
    .not("client_email", "is", null)
    .eq("clients.auto_reminder", true)
    .or(`last_reminder_sent.is.null,last_reminder_sent.lte.${reminderCutoff}`)
    .order("last_reminder_sent", { ascending: true, nullsFirst: true })
    .limit(MAX_REMINDERS_PER_RUN)
  if (reminderQueryError) console.error("Overdue reminder query failed:", reminderQueryError.message)

  let remindersSent = 0
  let remindersSkipped = 0
  for (const invoice of dueForReminder || []) {
    try {
      // Re-checks ownership, paid plan, status and the monthly email limit before sending
      await sendInvoiceReminder(invoice.user_id, invoice.id)
      remindersSent++
    } catch (error) {
      // Free plan, over the email limit, missing data: skip and retry on a later run
      remindersSkipped++
      console.warn(`Overdue reminder skipped for ${invoice.id}:`, error instanceof Error ? error.message : error)
    }
  }

  return Response.json({ draftsCreated, skippedOverLimit, lateFeesApplied, remindersSent, remindersSkipped })
}
