import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"
import { consumeUsage } from "@/lib/usage"
import { hasPaidPlan } from "@/lib/plans"
import { formatDate, formatMoney } from "@/lib/generate-document-html"
import { renderDocumentPdf } from "@/lib/pdf/render"
import { getInvoiceBalance } from "@/lib/invoice-balance"
import { buildReminderEmail } from "@/lib/email/templates"

/**
 * Sends a payment reminder email (with the invoice PDF attached) for one invoice.
 * Runs with the service role, so every query is scoped to `userId`; callers must have
 * already established that `userId` is allowed to act (signed-in user or the cron job).
 */
export async function sendInvoiceReminder(userId: string, documentId: string) {
  const admin = createAdminClient()
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("plan,status")
    .eq("user_id", userId)
    .maybeSingle()
  // Email sending is only available on paid plans (Pro / Lifetime)
  if (!hasPaidPlan(subscription)) throw new Error("Payment reminders require an active Pro or Lifetime plan")

  const { data: document } = await admin
    .from("documents")
    .select("*, line_items(*)")
    .eq("id", documentId)
    .eq("user_id", userId)
    .eq("type", "invoice")
    .single()
  if (!document) throw new Error("Invoice not found")
  if (!document.client_email) throw new Error("This invoice has no client email")
  if (document.status === "paid" || document.status === "cancelled") throw new Error("Reminders cannot be sent for paid or cancelled invoices")

  const [{ data: profile }, resend] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    Promise.resolve(new Resend(process.env.RESEND_API_KEY)),
  ])
  const { paid: amountPaid, remaining } = getInvoiceBalance(document)
  const dueDate = document.due_date ? new Date(document.due_date) : null
  const daysOverdue = dueDate ? Math.max(0, Math.floor((Date.now() - dueDate.getTime()) / 86_400_000)) : 0
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@new.infinityinvoices.com"
  const usage = await consumeUsage(admin, userId, "email")
  if (!usage.allowed) throw new Error(`You've reached your monthly limit of ${usage.limit} emails`)

  const rendered = await renderDocumentPdf(document, profile, "classic")
  const companyName = profile?.company_name?.trim() || "Your Company"
  const email = buildReminderEmail({
    number: document.number || "DRAFT",
    amountDue: formatMoney(remaining, document.currency),
    amountPaid: amountPaid > 0 ? formatMoney(amountPaid, document.currency) : null,
    dueDateLabel: document.due_date ? formatDate(document.due_date, "long") : null,
    daysOverdue,
    clientName: document.client_name,
    hasAttachment: Boolean(rendered.pdf),
    sender: { companyName, email: profile?.email, phone: profile?.phone },
  })

  const { error: emailError } = await resend.emails.send({
    from: `${companyName.replace(/["<>]/g, "")} via Infinity Invoices <${fromEmail}>`,
    to: document.client_email,
    replyTo: profile?.email || undefined,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: rendered.pdf
      ? [{ filename: rendered.fileName, content: rendered.pdf, contentType: "application/pdf" }]
      : undefined,
  })
  if (emailError) throw new Error(emailError.message)
  const { error: updateError } = await admin.from("documents").update({
    last_reminder_sent: new Date().toISOString(),
    reminder_count: Number(document.reminder_count || 0) + 1,
  }).eq("id", document.id).eq("user_id", userId)
  if (updateError) throw updateError
  return { number: document.number, email: document.client_email }
}
