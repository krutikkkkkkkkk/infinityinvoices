import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

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
  if (process.env.CRON_SECRET && requestHeaders.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
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
  for (const schedule of schedules || []) {
    const source = schedule.documents
    if (!source || (schedule.ends_at && new Date(schedule.ends_at) < now)) {
      await supabase.from("recurring_schedules").update({ active: false }).eq("id", schedule.id)
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
      payment_method: source.payment_method, upi_id: source.upi_id, client_name: source.client_name,
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

  return Response.json({ draftsCreated, lateFeesApplied })
}
