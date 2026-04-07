import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
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

    const isPro = subscription?.plan === "pro" && subscription?.status === "active"

    if (!isPro) {
      return NextResponse.json({ 
        error: "PRO_REQUIRED:Email sending is a Pro feature. Upgrade to Pro for unlimited email sending and advanced features.",
        requiresUpgrade: true 
      }, { status: 403 })
    }

    const { documentId, recipientEmail, message } = await request.json()

    if (!documentId || !recipientEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch document with line items
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*, line_items(*)")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Fetch profile for sender info
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    // Generate share token if not exists
    let shareToken = document.share_token
    if (!shareToken) {
      shareToken = crypto.randomUUID()
      await supabase
        .from("documents")
        .update({ share_token: shareToken })
        .eq("id", documentId)
    }

    // Get site URL for portal link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "")
    const portalLink = siteUrl ? `${siteUrl}/invoice/${shareToken}` : ""

    const currencySymbols: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
    }
    const symbol = currencySymbols[document.currency] || document.currency

    // Generate email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.type === "invoice" ? "Invoice" : "Quotation"} ${document.number}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 640px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Main Card -->
    <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
          ${document.type === "invoice" ? "Invoice" : "Quotation"}
        </h1>
        <p style="color: #94a3b8; margin: 0; font-size: 16px; font-weight: 500;">
          ${document.number}
        </p>
      </div>

      <!-- Amount Banner -->
      <div style="background: #f8fafc; padding: 24px 32px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #64748b; margin: 0 0 4px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Amount Due</p>
        <p style="color: #0f172a; margin: 0; font-size: 36px; font-weight: 700;">${symbol}${Number(document.grand_total).toLocaleString()}</p>
        ${document.due_date ? `<p style="color: #64748b; margin: 8px 0 0 0; font-size: 14px;">Due by ${new Date(document.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>` : ""}
        ${portalLink ? `
        <a href="${portalLink}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">View Online & Pay</a>
        ` : ""}
      </div>

      <div style="padding: 32px;">
        
        <!-- Personal Message -->
        ${message ? `
        <div style="margin-bottom: 28px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 12px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.6;">${message}</p>
        </div>
        ` : ""}

        <!-- From/To Section -->
        <div style="display: flex; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 16px;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">From</p>
                <p style="color: #0f172a; margin: 0; font-size: 15px; font-weight: 600;">${profile?.company_name || "Your Company"}</p>
                ${profile?.address ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">${profile.company_address}</p>` : ""}
                ${profile?.email ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">${profile.email}</p>` : ""}
                ${profile?.gst_id ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">GSTIN: ${profile.gst_id}</p>` : ""}
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 16px; border-left: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Bill To</p>
                <p style="color: #0f172a; margin: 0; font-size: 15px; font-weight: 600;">${document.client_name}</p>
                ${document.client_address ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">${document.client_address}</p>` : ""}
                ${document.client_email ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">${document.client_email}</p>` : ""}
                ${document.client_gst_id ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">GSTIN: ${document.client_gst_id}</p>` : ""}
              </td>
            </tr>
          </table>
        </div>

        <!-- Invoice Details -->
        <div style="background: #f8fafc; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Invoice Number</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 13px; text-align: right; font-weight: 600;">${document.number}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Issue Date</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 13px; text-align: right;">${new Date(document.issue_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td>
            </tr>
            ${document.due_date ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Due Date</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 13px; text-align: right;">${new Date(document.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td>
            </tr>
            ` : ""}
          </table>
        </div>

        <!-- Line Items -->
        <div style="margin-bottom: 28px;">
          <p style="color: #64748b; margin: 0 0 12px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Items</p>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 12px 0; text-align: left; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Description</th>
                <th style="padding: 12px 0; text-align: center; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; width: 60px;">Qty</th>
                <th style="padding: 12px 0; text-align: right; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; width: 100px;">Rate</th>
                <th style="padding: 12px 0; text-align: right; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; width: 100px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${document.line_items?.map((item: any) => `
              <tr>
                <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9;">
                  <p style="margin: 0; color: #0f172a; font-size: 14px; font-weight: 500;">${item.name}</p>
                  ${item.description ? `<p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">${item.description}</p>` : ""}
                </td>
                <td style="padding: 14px 0; text-align: center; color: #0f172a; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${item.quantity}</td>
                <td style="padding: 14px 0; text-align: right; color: #0f172a; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${symbol}${Number(item.rate).toLocaleString()}</td>
                <td style="padding: 14px 0; text-align: right; color: #0f172a; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f1f5f9;">${symbol}${(Number(item.quantity) * Number(item.rate)).toLocaleString()}</td>
              </tr>
              `).join("") || ""}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Subtotal</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right;">${symbol}${Number(document.subtotal).toLocaleString()}</td>
            </tr>
            ${document.discount_value > 0 ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Discount</td>
              <td style="padding: 8px 0; color: #059669; font-size: 14px; text-align: right;">-${symbol}${Number(document.discount_amount).toLocaleString()}</td>
            </tr>
            ` : ""}
            ${document.tax_total > 0 ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Tax</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right;">${symbol}${Number(document.tax_total).toLocaleString()}</td>
            </tr>
            ` : ""}
            <tr>
              <td colspan="2" style="padding-top: 12px;"><div style="border-top: 2px solid #e2e8f0;"></div></td>
            </tr>
            <tr>
              <td style="padding: 12px 0 0 0; color: #0f172a; font-size: 18px; font-weight: 700;">Total</td>
              <td style="padding: 12px 0 0 0; color: #0f172a; font-size: 18px; font-weight: 700; text-align: right;">${symbol}${Number(document.grand_total).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Payment Methods -->
        ${((document.payment_methods?.includes("bank") || document.payment_method_type === "bank") || 
           ((document.payment_methods?.includes("upi") || document.payment_method_type === "upi") && document.upi_id) ||
           ((document.payment_methods?.includes("paypal") || document.payment_method_type === "paypal") && document.paypal_email)) ? `
        <div style="margin-bottom: 28px;">
          <p style="color: #64748b; margin: 0 0 16px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Payment Options</p>
          
          <!-- UPI Payment -->
          ${(document.payment_methods?.includes("upi") || document.payment_method_type === "upi") && document.upi_id ? `
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
              <td style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="color: #166534; margin: 0 0 12px 0; font-size: 13px; font-weight: 600;">Pay with UPI</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=${encodeURIComponent(document.upi_id)}&pn=${encodeURIComponent(profile?.company_name || "")}&am=${document.grand_total}&cu=${document.currency}" alt="UPI QR Code" style="width: 140px; height: 140px; border-radius: 8px;" />
                <p style="color: #166534; margin: 12px 0 0 0; font-size: 12px; font-family: monospace;">${document.upi_id}</p>
                <p style="color: #15803d; margin: 8px 0 0 0; font-size: 11px;">Scan QR or use UPI ID to pay</p>
              </td>
            </tr>
          </table>
          ` : ""}

          <!-- PayPal Payment -->
          ${(document.payment_methods?.includes("paypal") || document.payment_method_type === "paypal") && document.paypal_email ? `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; width: 50px;">
                  <table style="width: 40px; height: 40px; background: #0070ba; border-radius: 8px; border-collapse: collapse;">
                    <tr>
                      <td style="text-align: center; vertical-align: middle;">
                        <span style="color: white; font-weight: bold; font-size: 16px;">P</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="vertical-align: middle; padding-left: 12px;">
                  <p style="color: #1e40af; margin: 0 0 4px 0; font-size: 13px; font-weight: 600;">Pay with PayPal</p>
                  <p style="color: #3b82f6; margin: 0; font-size: 14px; font-family: monospace;">${document.paypal_email}</p>
                </td>
              </tr>
            </table>
          </div>
          ` : ""}

          <!-- Bank Transfer -->
          ${document.payment_methods?.includes("bank") || document.payment_method_type === "bank" ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
            <p style="color: #334155; margin: 0 0 16px 0; font-size: 13px; font-weight: 600;">Bank Transfer</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${document.bank_name ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 12px; width: 120px;">Bank</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 12px; font-weight: 500;">${document.bank_name}</td>
              </tr>
              ` : ""}
              ${document.bank_account_name ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 12px;">Account Name</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 12px; font-weight: 500;">${document.bank_account_name}</td>
              </tr>
              ` : ""}
              ${document.bank_account_number ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 12px;">Account Number</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 12px; font-family: monospace; font-weight: 500;">${document.bank_account_number}</td>
              </tr>
              ` : ""}
              ${document.bank_routing_number ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 12px;">IFSC Code</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 12px; font-family: monospace; font-weight: 500;">${document.bank_routing_number}</td>
              </tr>
              ` : ""}
              ${document.bank_swift_code ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 12px;">SWIFT Code</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 12px; font-family: monospace; font-weight: 500;">${document.bank_swift_code}</td>
              </tr>
              ` : ""}
            </table>
          </div>
          ` : ""}
        </div>
        ` : ""}

        <!-- Notes -->
        ${document.notes ? `
        <div style="margin-bottom: 28px; padding: 16px 20px; background: #fefce8; border-radius: 12px; border: 1px solid #fef08a;">
          <p style="color: #854d0e; margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Notes</p>
          <p style="color: #713f12; margin: 0; font-size: 14px;">${document.notes}</p>
        </div>
        ` : ""}

        <!-- Terms -->
        ${document.terms ? `
        <div style="padding: 16px 20px; background: #f8fafc; border-radius: 12px;">
          <p style="color: #64748b; margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Terms & Conditions</p>
          <p style="color: #475569; margin: 0; font-size: 13px;">${document.terms}</p>
        </div>
        ` : ""}

      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px 20px;">
      <p style="color: #64748b; margin: 0 0 8px 0; font-size: 13px;">
        Thank you for your business!
      </p>
      <p style="color: #94a3b8; margin: 0; font-size: 12px;">
        ${profile?.company_name || "Your Company"}${profile?.email ? ` | ${profile.email}` : ""}${profile?.phone ? ` | ${profile.phone}` : ""}
      </p>
    </div>

  </div>
</body>
</html>
`

    // Send email via Resend
    // Use RESEND_FROM_EMAIL env var, or fallback to Resend test email for development
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Infinity Invoices <onboarding@resend.dev>"
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `${document.type === "invoice" ? "Invoice" : "Quotation"} ${document.number} from ${profile?.company_name || "Your Company"}`,
      html: emailHtml,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update document status to "sent" if it's a draft
    if (document.status === "draft") {
      await supabase
        .from("documents")
        .update({ status: "sent" })
        .eq("id", documentId)
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error("Send invoice error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
