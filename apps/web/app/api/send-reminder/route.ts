import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { checkAndIncrementUsage } from "@/lib/usage"
import { hasPaidPlan } from "@/lib/plans"
import { formatDate, formatMoney, isTemplateType, type TemplateType } from "@/lib/generate-document-html"
import { parseTemplateColors } from "@/lib/document-style"
import { renderDocumentPdf } from "@/lib/pdf/render"
import { getInvoiceBalance } from "@/lib/invoice-balance"
import { buildReminderEmail } from "@/lib/email/templates"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * POST /api/send-reminder
 * Body: { documentId, template?, colors?: { primary?, accent? } }
 *
 * Sends a short payment reminder with a copy of the invoice attached as a PDF.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const documentId = typeof body?.documentId === "string" ? body.documentId : ""
    const template: TemplateType = isTemplateType(body?.template) ? body.template : "classic"
    // Custom colours are a paid feature; this route already requires a paid plan below.
    const colors = parseTemplateColors(body?.colors)

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Reminder emails are only available on paid plans (Pro / Lifetime)
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .single()

    if (!hasPaidPlan(subscription)) {
      return NextResponse.json(
        {
          error:
            "PRO_REQUIRED:Payment reminders are a Pro feature. Upgrade to Pro for automated reminders and unlimited emails.",
          requiresUpgrade: true,
        },
        { status: 403 }
      )
    }

    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*, line_items(*), clients:client_id(id, name, email, auto_reminder)")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .eq("type", "invoice")
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (document.clients && !document.clients.auto_reminder) {
      return NextResponse.json({ error: "Auto reminders are disabled for this client" }, { status: 403 })
    }

    if (!document.client_email) {
      return NextResponse.json({ error: "Client email not available" }, { status: 400 })
    }

    if (document.status === "paid" || document.status === "cancelled") {
      return NextResponse.json({ error: "Cannot send reminder for paid/cancelled invoice" }, { status: 400 })
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", document.user_id).single()

    const { paid: amountPaid, remaining } = getInvoiceBalance(document)

    const dueDate = document.due_date ? new Date(document.due_date) : null
    const daysOverdue = dueDate
      ? Math.max(0, Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 0

    // Count the email against the monthly limit before doing the expensive render
    const usage = await checkAndIncrementUsage("email")
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: `PRO_REQUIRED:You've reached your monthly limit of ${usage.limit} emails.`,
          requiresUpgrade: true,
        },
        { status: 403 }
      )
    }

    const rendered = await renderDocumentPdf(document, profile, template, colors)
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

    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@new.infinityinvoices.com"

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
      headers: { "X-Mailer": "Infinity Invoices" },
    })

    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 500 })
    }

    await supabase
      .from("documents")
      .update({
        last_reminder_sent: new Date().toISOString(),
        reminder_count: (document.reminder_count || 0) + 1,
      })
      .eq("id", documentId)
      .eq("user_id", user.id)

    return NextResponse.json({ success: true, attached: Boolean(rendered.pdf) })
  } catch (error) {
    console.error("Reminder error:", error)
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 })
  }
}
