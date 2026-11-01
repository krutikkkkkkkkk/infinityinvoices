import { headers } from "next/headers"
import { and, asc, clients, db, documents, eq, inArray, isNotNull, isNull, lateFeeApplications, lineItems, lt, lte, ne, or, recurringSchedules, sql, subscriptions } from "@infinity/db"
import { consumeUsage } from "@/lib/usage"
import { sendInvoiceReminder } from "@/lib/reminders"

// Rendering a PDF per reminder is slow; give the job room beyond the default
export const maxDuration = 300

// Clients with auto reminders get the first email the day before the due date, then one per week
const REMINDER_LEAD_DAYS = 1
const REMINDER_INTERVAL_DAYS = 7
// Cap per run so a backlog cannot blow the function timeout; the rest go next night
const MAX_REMINDERS_PER_RUN = 50

/** Adds whole months, clamping to the month's last day so a schedule on the 31st never skips February. */
function addMonths(date: Date, months: number) {
  const next = new Date(date)
  const day = next.getUTCDate()
  next.setUTCDate(1)
  next.setUTCMonth(next.getUTCMonth() + months)
  const lastDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate()
  next.setUTCDate(Math.min(day, lastDay))
  return next
}

function advanceDate(date: Date, frequency: string) {
  if (frequency === "monthly") return addMonths(date, 1)
  if (frequency === "quarterly") return addMonths(date, 3)
  if (frequency === "yearly") return addMonths(date, 12)
  const next = new Date(date)
  if (frequency === "weekly") next.setUTCDate(next.getUTCDate() + 7)
  return next
}

/** YYYY-MM-DD (UTC) for `days` days from `date`. */
function utcDay(date: Date, days = 0) {
  return new Date(date.getTime() + days * 86400000).toISOString().slice(0, 10)
}

export async function GET() {
  const requestHeaders = await headers()
  // Fail closed: without CRON_SECRET anyone could trigger this job, which acts for every user
  if (!process.env.CRON_SECRET || requestHeaders.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  let schedules
  try {
    // Recurring invoices are Pro / Lifetime only. A lapsed user's schedules stay due and resume on
    // upgrade; filtering here keeps them from filling the batch limit.
    const paidUsers = db
      .select({ user_id: subscriptions.user_id })
      .from(subscriptions)
      .where(and(inArray(subscriptions.plan, ["pro", "lifetime"]), eq(subscriptions.status, "active")))
    schedules = await db.query.recurringSchedules.findMany({
      where: and(
        eq(recurringSchedules.active, true),
        lte(recurringSchedules.next_run_at, now.toISOString()),
        inArray(recurringSchedules.user_id, paidUsers),
      ),
      with: { source: { with: { line_items: { orderBy: [asc(lineItems.sort_order)] } } } },
      limit: 100,
    })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Failed to load schedules" }, { status: 500 })
  }

  let draftsCreated = 0
  let skippedOverLimit = 0
  for (const schedule of schedules) {
    const source = schedule.source
    // The source must belong to the schedule's owner, or this would copy another user's invoice
    if (!source || source.user_id !== schedule.user_id || (schedule.ends_at && new Date(schedule.ends_at) < now)) {
      await db.update(recurringSchedules).set({ active: false }).where(eq(recurringSchedules.id, schedule.id))
      continue
    }
    // Recurring drafts count toward the monthly invoice limit. Over the limit, leave the
    // schedule due so it runs once the month resets or the user upgrades.
    const { allowed } = await consumeUsage(schedule.user_id, "invoice")
    if (!allowed) {
      skippedOverLimit++
      continue
    }
    const count = await db.$count(documents, and(eq(documents.user_id, schedule.user_id), eq(documents.type, "invoice")))
    const issueDate = now.toISOString().slice(0, 10)
    const originalIssue = new Date(source.issue_date)
    const originalDue = source.due_date ? new Date(source.due_date) : null
    const dueDays = originalDue ? Math.max(0, Math.round((originalDue.getTime() - originalIssue.getTime()) / 86400000)) : 0
    const dueDate = new Date(now.getTime() + dueDays * 86400000).toISOString().slice(0, 10)
    const [draft] = await db.insert(documents).values({
      user_id: schedule.user_id, client_id: source.client_id, type: "invoice",
      number: `INV-${String(count + 1).padStart(4, "0")}`, issue_date: issueDate,
      due_date: dueDate, status: "draft", currency: source.currency, subtotal: source.subtotal,
      tax_total: source.tax_total, discount_type: source.discount_type, discount_value: source.discount_value,
      grand_total: source.grand_total, notes: source.notes, terms: source.terms,
      payment_method: source.payment_method, upi_id: source.upi_id,
      payment_methods: source.payment_methods ?? [], payment_method_type: source.payment_method_type ?? null,
      paypal_email: source.paypal_email ?? null, bank_name: source.bank_name ?? null,
      bank_account_name: source.bank_account_name ?? null, bank_account_number: source.bank_account_number ?? null,
      bank_routing_number: source.bank_routing_number ?? null, bank_swift_code: source.bank_swift_code ?? null,
      client_name: source.client_name,
      client_email: source.client_email, client_address: source.client_address, client_gst_id: source.client_gst_id,
      include_tax: source.include_tax, late_fee_type: source.late_fee_type, late_fee_value: source.late_fee_value,
      parent_document_id: source.id,
    }).returning({ id: documents.id })
    if (draft && source.line_items.length) {
      await db.insert(lineItems).values(source.line_items.map((item, index) => ({
        document_id: draft.id, name: item.name, description: item.description, quantity: item.quantity,
        rate: item.rate, tax_percent: item.tax_percent, line_total: item.line_total, sort_order: index,
      })))
    }
    if (draft) draftsCreated++
    const nextRun = advanceDate(new Date(schedule.next_run_at), schedule.frequency)
    await db.update(recurringSchedules).set({ last_run_at: now.toISOString(), next_run_at: nextRun.toISOString() }).where(eq(recurringSchedules.id, schedule.id))
  }

  const today = now.toISOString().slice(0, 10)
  const overdue = await db
    .select({ id: documents.id, user_id: documents.user_id, grand_total: documents.grand_total, late_fee_type: documents.late_fee_type, late_fee_value: documents.late_fee_value })
    .from(documents)
    .where(and(
      eq(documents.type, "invoice"),
      isNotNull(documents.late_fee_type),
      lt(documents.due_date, today),
      ne(documents.status, "paid"),
      ne(documents.status, "cancelled"),
    ))
  let lateFeesApplied = 0
  for (const invoice of overdue) {
    const value = Number(invoice.late_fee_value || 0)
    const amount = invoice.late_fee_type === "percentage" ? Number(invoice.grand_total) * value / 100 : value
    if (amount <= 0 || !invoice.late_fee_type) continue
    // One fee per invoice: the unique document_id turns a repeat run into a no-op
    const applied = await db
      .insert(lateFeeApplications)
      .values({ user_id: invoice.user_id, document_id: invoice.id, fee_type: invoice.late_fee_type, fee_value: value, amount })
      .onConflictDoNothing({ target: lateFeeApplications.document_id })
      .returning({ id: lateFeeApplications.id })
    if (applied.length) {
      await db
        .update(documents)
        .set({ grand_total: Number(invoice.grand_total) + amount, status: "overdue" })
        .where(and(eq(documents.id, invoice.id), eq(documents.user_id, invoice.user_id)))
      lateFeesApplied++
    }
  }

  // Auto reminders (Pro / Lifetime only, clients that opted in): the first goes out the day before
  // the due date, then one every 7 days until the invoice is paid or the client is switched off.
  // Manual reminders also set last_reminder_sent, so they push the next one out. The cutoff is a
  // calendar day, not an exact timestamp, so a few seconds of cron jitter can't slip a week to 8 days.
  const reminderCutoff = `${utcDay(now, -(REMINDER_INTERVAL_DAYS - 1))}T00:00:00.000Z`
  let dueForReminder: { id: string; user_id: string }[] = []
  try {
    dueForReminder = await db
      .select({ id: documents.id, user_id: documents.user_id })
      .from(documents)
      .innerJoin(clients, and(eq(clients.id, documents.client_id), eq(clients.user_id, documents.user_id)))
      // Filter by plan here, not only at send time, so free users' invoices can't fill the per-run cap
      .innerJoin(subscriptions, eq(subscriptions.user_id, documents.user_id))
      .where(and(
        eq(documents.type, "invoice"),
        inArray(documents.status, ["sent", "overdue"]),
        lte(documents.due_date, utcDay(now, REMINDER_LEAD_DAYS)),
        isNotNull(documents.client_email),
        eq(clients.auto_reminder, true),
        inArray(subscriptions.plan, ["pro", "lifetime"]),
        eq(subscriptions.status, "active"),
        or(isNull(documents.last_reminder_sent), lt(documents.last_reminder_sent, reminderCutoff)),
      ))
      .orderBy(sql`${documents.last_reminder_sent} asc nulls first`)
      .limit(MAX_REMINDERS_PER_RUN)
  } catch (error) {
    console.error("Overdue reminder query failed:", error instanceof Error ? error.message : error)
  }

  let remindersSent = 0
  let remindersSkipped = 0
  for (const invoice of dueForReminder) {
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
