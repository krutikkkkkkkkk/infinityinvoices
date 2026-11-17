import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { and, db, eq, refundNotes } from "@infinity/db"
import { getCurrentUser } from "@/lib/auth/server"
import { getPlanForUser } from "@/lib/plan-server"
import { consumeUsage } from "@/lib/usage"
import { formatDate, formatMoney } from "@/lib/generate-document-html"
import { buildRefundEmail, senderFrom } from "@/lib/email/templates"
import { loadRefundNote, renderRefundNotePdf } from "@/lib/refund-note-pdf"
import { refundMethodLabel } from "@/lib/refund-methods"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_REGEX = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/
const MAX_MESSAGE_LENGTH = 2000

/**
 * POST /api/send-refund-note
 * Body: { refundNoteId, recipientEmail?, message? }
 *
 * Pro only. Emails the client that a refund has been made, with the refund note attached as a PDF.
 * The recipient defaults to the invoice's client email. If the PDF can't be rendered nothing is
 * sent (502) and nothing is counted against the email limit.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const plan = await getPlanForUser(user.id)
    if (!plan.refundEmails) {
      return NextResponse.json(
        {
          error: "PRO_REQUIRED:Refund emails are a Pro feature. Upgrade to Pro to email refund notes to your clients.",
          requiresUpgrade: true,
        },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => null)
    const refundNoteId = typeof body?.refundNoteId === "string" ? body.refundNoteId : ""
    const requestedEmail = typeof body?.recipientEmail === "string" ? body.recipientEmail.trim() : ""
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : ""

    const note = await loadRefundNote(user.id, refundNoteId)
    if (!note) return NextResponse.json({ error: "Refund note not found" }, { status: 404 })

    const recipientEmail = requestedEmail || note.invoice.client_email?.trim() || ""
    if (!recipientEmail) return NextResponse.json({ error: "Add a recipient email" }, { status: 400 })
    if (!EMAIL_REGEX.test(recipientEmail)) return NextResponse.json({ error: "Invalid recipient email" }, { status: 400 })

    const rendered = await renderRefundNotePdf(note)
    if (!rendered.pdf) {
      return NextResponse.json(
        { error: "Couldn't generate the PDF, so the email wasn't sent. Please try again in a moment." },
        { status: 502 }
      )
    }

    // Count the email only once there's a PDF to send
    const usage = await consumeUsage(user.id, "email")
    if (!usage.allowed) {
      return NextResponse.json(
        { error: `PRO_REQUIRED:You've reached your monthly limit of ${usage.limit} emails.`, requiresUpgrade: true },
        { status: 403 }
      )
    }

    const companyName = note.profile?.company_name?.trim() || "Your Company"
    const email = buildRefundEmail({
      number: note.refund.number,
      invoiceNumber: note.invoice.number,
      amount: formatMoney(Number(note.refund.amount), note.invoice.currency),
      refundDate: formatDate(note.refund.refunded_at, "long"),
      method: refundMethodLabel(note.refund.method) || null,
      reference: note.refund.reference,
      reason: note.refund.reason,
      message,
      clientName: note.invoice.client_name,
      hasAttachment: true,
      sender: { companyName, email: note.profile?.email, phone: note.profile?.phone },
    })

    const { data, error } = await resend.emails.send({
      from: senderFrom(note.profile?.company_name),
      to: recipientEmail,
      replyTo: note.profile?.email || undefined,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: [{ filename: rendered.fileName, content: rendered.pdf, contentType: "application/pdf" }],
      headers: { "X-Mailer": "Infinity Invoices" },
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await db
      .update(refundNotes)
      .set({ emailed_at: new Date().toISOString() })
      .where(and(eq(refundNotes.id, note.refund.id), eq(refundNotes.user_id, user.id)))

    return NextResponse.json({ success: true, messageId: data?.id, recipient: recipientEmail })
  } catch (error) {
    console.error("Send refund note error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
