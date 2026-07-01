import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { CURRENCIES } from "@/lib/types"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has Pro plan
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .single()

    const isPro = (subscription?.plan === "pro" || subscription?.plan === "lifetime") && subscription?.status === "active"

    if (!isPro) {
      return NextResponse.json({ 
        error: "PRO_REQUIRED:Payment reminders are a Pro feature. Upgrade to Pro for automated reminders and unlimited emails.",
        requiresUpgrade: true 
      }, { status: 403 })
    }

    // Fetch document with client info
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select(
        `
        *,
        clients:client_id(id, name, email, auto_reminder)
      `
      )
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Check if client has auto_reminder enabled
    if (document.clients && !document.clients.auto_reminder) {
      return NextResponse.json({ 
        error: "Auto reminders are disabled for this client" 
      }, { status: 403 })
    }

    if (!document.client_email) {
      return NextResponse.json({ error: "Client email not available" }, { status: 400 })
    }

    if (document.status === "paid" || document.status === "cancelled") {
      return NextResponse.json({ error: "Cannot send reminder for paid/cancelled invoice" }, { status: 400 })
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", document.user_id)
      .single()

    const currency = CURRENCIES.find((c) => c.value === document.currency)
    const symbol = currency?.symbol || "₹"
    const amountPaid = Number(document.amount_paid) || 0
    const remaining = Number(document.grand_total) - amountPaid

    // Calculate days overdue
    const dueDate = document.due_date ? new Date(document.due_date) : null
    const today = new Date()
    const daysOverdue = dueDate ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0

    // Generate share link if not exists
    let shareToken = document.share_token
    if (!shareToken) {
      shareToken = crypto.randomUUID()
      await supabase
        .from("documents")
        .update({ share_token: shareToken })
        .eq("id", documentId)
        .eq("user_id", user.id)
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "")
    const invoiceLink = `${siteUrl}/invoice/${shareToken}`

    // Email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
      
      <!-- Header -->
      <div style="background: ${daysOverdue > 0 ? "#dc2626" : "#f59e0b"}; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">
          ${daysOverdue > 0 ? "Payment Overdue" : "Payment Reminder"}
        </h1>
      </div>

      <div style="padding: 32px;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Dear ${document.client_name || "Customer"},
        </p>
        
        <p style="margin: 0 0 20px 0;">
          ${daysOverdue > 0 
            ? `This is a reminder that your invoice <strong>${document.number}</strong> is now <strong>${daysOverdue} days overdue</strong>.`
            : `This is a friendly reminder that invoice <strong>${document.number}</strong> is due${dueDate ? ` on <strong>${dueDate.toLocaleDateString()}</strong>` : " soon"}.`
          }
        </p>

        <!-- Amount Box -->
        <div style="background: ${daysOverdue > 0 ? "#fef2f2" : "#fffbeb"}; border: 1px solid ${daysOverdue > 0 ? "#fecaca" : "#fde68a"}; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px;">Amount Due</p>
          <p style="color: ${daysOverdue > 0 ? "#dc2626" : "#d97706"}; margin: 0; font-size: 36px; font-weight: 700;">
            ${symbol}${remaining.toLocaleString()}
          </p>
          ${amountPaid > 0 ? `<p style="color: #16a34a; margin: 8px 0 0 0; font-size: 14px;">Paid: ${symbol}${amountPaid.toLocaleString()}</p>` : ""}
        </div>

        <p style="margin: 0 0 24px 0;">
          Please make the payment at your earliest convenience to avoid any inconvenience.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${invoiceLink}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Invoice & Pay
          </a>
        </div>

        <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px;">
          If you have already made the payment, please disregard this reminder.
        </p>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding: 24px; text-align: center; background: #f9fafb;">
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          ${profile?.company_name || "Thank you for your business"}
        </p>
        ${profile?.email ? `<p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">${profile.email}</p>` : ""}
      </div>
    </div>
  </div>
</body>
</html>
`

    // Send email with proper headers for deliverability
    // Use custom verified domain for best deliverability
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@new.infinityinvoices.com"
    const replyToEmail = profile?.email || process.env.RESEND_REPLY_TO || "support@new.infinityinvoices.com"
    
    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: document.client_email,
      replyTo: replyToEmail,
      subject: `${daysOverdue > 0 ? "OVERDUE: " : "Reminder: "}Invoice ${document.number} - ${symbol}${remaining.toLocaleString()} Due`,
      html: emailHtml,
      headers: {
        "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe>`,
        "X-Mailer": "Infinity Invoices",
        "Precedence": "bulk",
      },
    })

    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 500 })
    }

    // Update reminder tracking
    await supabase
      .from("documents")
      .update({
        last_reminder_sent: new Date().toISOString(),
        reminder_count: (document.reminder_count || 0) + 1,
      })
      .eq("id", documentId)
        .eq("user_id", user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reminder error:", error)
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 })
  }
}
