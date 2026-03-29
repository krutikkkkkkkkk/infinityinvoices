import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Generate clean HTML for PDF
function generateInvoiceHTML(document: any, profile: any) {
  const lineItems = document.line_items || []
  const subtotal = lineItems.reduce(
    (sum: number, item: any) => sum + item.quantity * item.rate,
    0
  )
  const taxAmount = subtotal * ((document.tax_rate || 0) / 100)
  const total = subtotal + taxAmount - (document.discount || 0)

  const itemsHtml = lineItems
    .map(
      (item: any, i: number) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description || ""}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.rate.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(item.quantity * item.rate).toFixed(2)}</td>
      </tr>
    `
    )
    .join("")

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1f2937;
      background: white;
      padding: 40px;
      max-width: 794px;
      margin: 0 auto;
    }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company-info { max-width: 300px; }
    .company-name { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .company-details { font-size: 12px; color: #6b7280; line-height: 1.5; }
    .invoice-info { text-align: right; }
    .invoice-title { font-size: 32px; font-weight: 700; text-transform: uppercase; color: #111827; }
    .invoice-number { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .invoice-date { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .bill-to { margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .bill-to-label { font-size: 10px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; font-weight: 600; }
    .client-name { font-size: 16px; font-weight: 600; }
    .client-details { font-size: 12px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { 
      padding: 12px; 
      text-align: left; 
      font-size: 10px; 
      text-transform: uppercase; 
      color: #6b7280; 
      border-bottom: 2px solid #e5e7eb;
      font-weight: 600;
    }
    th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
    td { font-size: 14px; }
    .totals { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .total-row.final { 
      border-top: 2px solid #111827; 
      font-weight: 700; 
      font-size: 18px; 
      margin-top: 8px; 
      padding-top: 12px; 
    }
    .notes { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .notes-label { font-size: 10px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; font-weight: 600; }
    .notes-text { font-size: 12px; color: #6b7280; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-name">${profile?.company_name || "Your Company"}</div>
      <div class="company-details">
        ${profile?.company_address || ""}<br>
        ${profile?.email || ""}<br>
        ${profile?.phone || ""}<br>
        ${profile?.gst_id ? `GSTIN: ${profile.gst_id}` : ""}
      </div>
    </div>
    <div class="invoice-info">
      <div class="invoice-title">${document.type === "quotation" ? "Quotation" : "Invoice"}</div>
      <div class="invoice-number">#${document.number || "DRAFT"}</div>
      <div class="invoice-date">Date: ${new Date(document.issue_date || Date.now()).toLocaleDateString("en-IN")}</div>
      ${document.due_date ? `<div class="invoice-date">Due: ${new Date(document.due_date).toLocaleDateString("en-IN")}</div>` : ""}
    </div>
  </div>

  <div class="bill-to">
    <div class="bill-to-label">Bill To</div>
    <div class="client-name">${document.client_name || "Client"}</div>
    <div class="client-details">
      ${document.client_email || ""}<br>
      ${document.client_address || ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Description</th>
        <th style="width: 80px;">Qty</th>
        <th style="width: 100px;">Rate</th>
        <th style="width: 100px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>₹${subtotal.toFixed(2)}</span>
    </div>
    ${document.tax_rate ? `
    <div class="total-row">
      <span>Tax (${document.tax_rate}%)</span>
      <span>₹${taxAmount.toFixed(2)}</span>
    </div>
    ` : ""}
    ${document.discount ? `
    <div class="total-row">
      <span>Discount</span>
      <span>-₹${document.discount.toFixed(2)}</span>
    </div>
    ` : ""}
    <div class="total-row final">
      <span>Total</span>
      <span>₹${total.toFixed(2)}</span>
    </div>
  </div>

  ${document.notes ? `
  <div class="notes">
    <div class="notes-label">Notes</div>
    <div class="notes-text">${document.notes}</div>
  </div>
  ` : ""}

  <div class="footer">
    Thank you for your business!
  </div>
</body>
</html>
`
}

export async function GET(request: NextRequest) {
  try {
    const documentId = request.nextUrl.searchParams.get("id")

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 })
    }

    // Verify authentication and ownership
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch document with line items and profile
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*, line_items(*)")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, company_address, gst_id, email, phone, logo_url")
      .eq("id", user.id)
      .single()

    // Generate HTML
    const html = generateInvoiceHTML(document, profile)

    // Use Browserless if available, otherwise return HTML for client-side rendering
    const browserlessUrl = process.env.BROWSERLESS_URL

    if (browserlessUrl) {
      // Use Browserless PDF API
      const response = await fetch(`${browserlessUrl}/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          options: {
            format: "A4",
            printBackground: true,
            margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Browserless PDF generation failed")
      }

      const pdf = await response.arrayBuffer()

      return new NextResponse(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${document.number || document.type}-${Date.now()}.pdf"`,
        },
      })
    }

    // Fallback: Return HTML with instructions to use client-side rendering
    // The client will use html2canvas as fallback
    return NextResponse.json({ html, fallback: true }, { status: 200 })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
