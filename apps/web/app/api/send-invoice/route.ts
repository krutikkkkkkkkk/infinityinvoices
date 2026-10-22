import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { checkAndIncrementUsage } from "@/lib/usage"
import { hasPaidPlan } from "@/lib/plans"
import { formatDate, formatMoney, isTemplateType, type TemplateType } from "@/lib/generate-document-html"
import { parseTemplateColors } from "@/lib/document-style"
import { renderDocumentPdf } from "@/lib/pdf/render"
import { getInvoiceBalance } from "@/lib/invoice-balance"
import { buildDocumentEmail } from "@/lib/email/templates"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_REGEX = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/
const MAX_MESSAGE_LENGTH = 2000

/**
 * POST /api/send-invoice
 * Body: { documentId, recipientEmail, message?, template?, colors?: { primary?, accent? } }
 *
 * Sends a short, plain email to the client with the document attached as a PDF
 * (rendered with the chosen template). If the PDF cannot be rendered on this
 * host the email still goes out with the online link only.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Email sending is only available on paid plans (Pro / Lifetime)
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .single()

    if (!hasPaidPlan(subscription)) {
      return NextResponse.json(
        {
          error:
            "PRO_REQUIRED:Email sending is a Pro feature. Upgrade to Pro for unlimited email sending and advanced features.",
          requiresUpgrade: true,
        },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => null)
    const documentId = typeof body?.documentId === "string" ? body.documentId : ""
    const recipientEmail = typeof body?.recipientEmail === "string" ? body.recipientEmail.trim() : ""
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : ""
    const template: TemplateType = isTemplateType(body?.template) ? body.template : "classic"
    // Custom colours are a paid feature; this route already requires a paid plan above.
    const colors = parseTemplateColors(body?.colors)

    if (!documentId || !recipientEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!EMAIL_REGEX.test(recipientEmail)) {
      return NextResponse.json({ error: "Invalid recipient email" }, { status: 400 })
    }

    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*, line_items(*)")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

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

    const isQuote = document.type === "quotation"
    // Invoices are billed for what is still owed after payments and credit notes
    const amount = isQuote ? Number(document.grand_total) : getInvoiceBalance(document).remaining
    const dateValue = isQuote ? document.valid_until || document.due_date : document.due_date
    const companyName = profile?.company_name?.trim() || "Your Company"

    const email = buildDocumentEmail({
      kind: isQuote ? "quotation" : "invoice",
      number: document.number || "DRAFT",
      amount: formatMoney(amount, document.currency),
      dateLine: dateValue ? formatDate(dateValue, "long") : null,
      message,
      clientName: document.client_name,
      hasAttachment: Boolean(rendered.pdf),
      sender: { companyName, email: profile?.email, phone: profile?.phone },
    })

    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@new.infinityinvoices.com"

    const { data, error } = await resend.emails.send({
      from: `${companyName.replace(/["<>]/g, "")} via Infinity Invoices <${fromEmail}>`,
      to: recipientEmail,
      replyTo: profile?.email || undefined,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: rendered.pdf
        ? [{ filename: rendered.fileName, content: rendered.pdf, contentType: "application/pdf" }]
        : undefined,
      headers: { "X-Mailer": "Infinity Invoices" },
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (document.status === "draft") {
      await supabase.from("documents").update({ status: "sent" }).eq("id", documentId).eq("user_id", user.id)
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      attached: Boolean(rendered.pdf),
      ...(rendered.pdf ? {} : { warning: "PDF could not be generated; the email was sent with the online link only." }),
    })
  } catch (error) {
    console.error("Send invoice error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
