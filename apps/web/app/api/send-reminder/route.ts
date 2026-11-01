import { and, asc, clients, db, documents, eq, lineItems, profiles, subscriptions } from "@infinity/db"
import { getCurrentUser } from "@/lib/auth/server"
import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { checkAndIncrementUsage } from "@/lib/usage"
import { hasPaidPlan } from "@/lib/plans"
import { formatDate, formatMoney, isTemplateType, type DocumentWithItems, type TemplateType } from "@/lib/generate-document-html"
import { parseTemplateColors } from "@/lib/document-style"
import { renderDocumentPdf } from "@/lib/pdf/render"
import { getInvoiceBalance } from "@/lib/invoice-balance"
import { buildReminderEmail } from "@/lib/email/templates"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const resend = new Resend(process.env.RESEND_API_KEY)

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Reminder emails are only available on paid plans (Pro / Lifetime)
    const [subscription] = await db
      .select({ plan: subscriptions.plan, status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.user_id, user.id))
      .limit(1)

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

    const document = UUID_REGEX.test(documentId)
      ? await db.query.documents.findFirst({
          where: and(eq(documents.id, documentId), eq(documents.user_id, user.id), eq(documents.type, "invoice")),
          with: {
            line_items: { orderBy: [asc(lineItems.sort_order)] },
            client: { columns: { id: true, name: true, email: true, auto_reminder: true } },
          },
        })
      : undefined

    if (!document) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (document.client && !document.client.auto_reminder) {
      return NextResponse.json({ error: "Auto reminders are disabled for this client" }, { status: 403 })
    }

    if (!document.client_email) {
      return NextResponse.json({ error: "Client email not available" }, { status: 400 })
    }

    if (document.status === "paid" || document.status === "cancelled") {
      return NextResponse.json({ error: "Cannot send reminder for paid/cancelled invoice" }, { status: 400 })
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, document.user_id)).limit(1)

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

    const rendered = await renderDocumentPdf(document as DocumentWithItems, profile, template, colors)
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

    await db
      .update(documents)
      .set({
        last_reminder_sent: new Date().toISOString(),
        reminder_count: (document.reminder_count || 0) + 1,
      })
      .where(and(eq(documents.id, documentId), eq(documents.user_id, user.id)))

    return NextResponse.json({ success: true, attached: Boolean(rendered.pdf) })
  } catch (error) {
    console.error("Reminder error:", error)
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 })
  }
}
