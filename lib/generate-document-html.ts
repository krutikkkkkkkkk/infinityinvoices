import { Document, LineItem } from "./types"

const CURRENCIES: { [key: string]: string } = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
}

export function generateDocumentHTML(
  document: Document & { line_items: LineItem[] },
  profile: any
) {
  const lineItems = document.line_items || []
  const subtotal = lineItems.reduce(
    (sum: number, item: LineItem) => sum + item.quantity * item.rate,
    0
  )
  const taxAmount = subtotal * ((document.tax_rate || 0) / 100)
  const discount = document.discount || 0
  const total = subtotal + taxAmount - discount

  const currencySymbol = CURRENCIES[document.currency] || "₹"

  const itemsHtml = lineItems
    .map(
      (item: LineItem, i: number) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description || ""}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol}${item.rate.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol}${(item.quantity * item.rate).toFixed(2)}</td>
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
      padding: 32px;
      max-width: 794px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      gap: 40px; 
      margin-bottom: 32px; 
      width: 100%;
    }
    .company-info { 
      flex: 1; 
      min-width: 0;
    }
    .company-name { 
      font-size: 18px; 
      font-weight: 700; 
      margin-bottom: 8px; 
      color: #1f2937; 
    }
    .company-details { 
      font-size: 12px; 
      color: #6b7280; 
      line-height: 1.6; 
    }
    .invoice-info { 
      text-align: right; 
      white-space: nowrap;
    }
    .invoice-title { 
      font-size: 32px; 
      font-weight: 700; 
      text-transform: uppercase; 
      color: #1f2937; 
      margin-bottom: 8px; 
    }
    .invoice-meta { 
      font-size: 12px; 
      color: #6b7280; 
      margin-top: 4px; 
      line-height: 1.6;
    }
    .bill-to { margin-bottom: 32px; padding: 16px; background: #f9fafb; border-radius: 6px; }
    .bill-to-label { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; font-weight: 600; }
    .client-name { font-size: 15px; font-weight: 600; color: #1f2937; }
    .client-details { font-size: 12px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { 
      padding: 12px; 
      text-align: left; 
      font-size: 11px; 
      text-transform: uppercase; 
      color: #6b7280; 
      border-bottom: 2px solid #e5e7eb;
      font-weight: 600;
    }
    th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
    td { font-size: 13px; color: #1f2937; }
    .totals { margin-left: auto; width: 300px; margin-bottom: 24px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #1f2937; }
    .total-row.subtotal { padding: 8px 0; }
    .total-row.tax { padding: 8px 0; }
    .total-row.discount { padding: 8px 0; color: #dc2626; }
    .total-row.final { 
      border-top: 2px solid #1f2937; 
      font-weight: 700; 
      font-size: 16px; 
      margin-top: 12px; 
      padding-top: 12px; 
    }
    .payment-info { margin-top: 32px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb; }
    .payment-label { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 12px; font-weight: 600; }
    .payment-method { margin-bottom: 16px; }
    .payment-method:last-child { margin-bottom: 0; }
    .payment-method-title { font-weight: 600; font-size: 13px; margin-bottom: 8px; color: #1f2937; }
    .payment-detail { font-size: 12px; color: #6b7280; margin: 4px 0; }
    .payment-detail-value { color: #1f2937; font-family: monospace; }
    .payment-divider { margin: 12px 0; padding-top: 12px; border-top: 1px solid #e5e7eb; }
    .qr-container { display: flex; gap: 12px; margin-top: 8px; }
    .qr-image { width: 80px; height: 80px; }
    .qr-text { font-size: 12px; }
    .notes { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .notes-label { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; font-weight: 600; }
    .notes-text { font-size: 12px; color: #6b7280; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" class="company-logo">` : ""}
      <div class="company-name">${profile?.company_name || "Your Company"}</div>
      <div class="company-details">
        ${profile?.company_address || ""}${profile?.company_address ? "<br>" : ""}
        ${profile?.email || ""}${profile?.email ? "<br>" : ""}
        ${profile?.phone || ""}${profile?.phone ? "<br>" : ""}
        ${profile?.gst_id ? `GSTIN: ${profile.gst_id}` : ""}
      </div>
    </div>
    <div class="invoice-info">
      <div class="invoice-title">${document.type === "quotation" ? "Quotation" : "Invoice"}</div>
      <div class="invoice-meta"><span style="font-weight: 600;">#</span> ${document.number || "DRAFT"}</div>
      <div class="invoice-meta"><span style="font-weight: 600;">Date:</span> ${new Date(document.issue_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
      ${document.due_date ? `<div class="invoice-meta"><span style="font-weight: 600;">Due:</span> ${new Date(document.due_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>` : ""}
    </div>
  </div>

  <div class="bill-to">
    <div class="bill-to-label">Bill To</div>
    <div class="client-name">${document.client_name || "Client Name"}</div>
    <div class="client-details">
      ${document.client_email || ""}${document.client_email ? "<br>" : ""}
      ${document.client_phone || ""}${document.client_phone ? "<br>" : ""}
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
    <div class="total-row subtotal">
      <span>Subtotal</span>
      <span>${currencySymbol}${subtotal.toFixed(2)}</span>
    </div>
    ${document.tax_rate ? `
    <div class="total-row tax">
      <span>Tax (${document.tax_rate}%)</span>
      <span>${currencySymbol}${taxAmount.toFixed(2)}</span>
    </div>
    ` : ""}
    ${discount > 0 ? `
    <div class="total-row discount">
      <span>Discount</span>
      <span>-${currencySymbol}${discount.toFixed(2)}</span>
    </div>
    ` : ""}
    <div class="total-row final">
      <span>Total</span>
      <span>${currencySymbol}${total.toFixed(2)}</span>
    </div>
  </div>

  ${(profile?.bank_name || profile?.upi_id || profile?.paypal_email) ? `
  <div class="payment-info">
    <div class="payment-label">Payment Information</div>
    
    ${profile?.bank_name ? `
    <div class="payment-method">
      <div class="payment-method-title">Bank Transfer</div>
      <div class="payment-detail">Bank: <span class="payment-detail-value">${profile.bank_name}</span></div>
      ${profile.bank_account_name ? `<div class="payment-detail">Account Name: <span class="payment-detail-value">${profile.bank_account_name}</span></div>` : ""}
      ${profile.bank_account_number ? `<div class="payment-detail">Account Number: <span class="payment-detail-value">${profile.bank_account_number}</span></div>` : ""}
      ${profile.bank_routing_number ? `<div class="payment-detail">Routing/IFSC: <span class="payment-detail-value">${profile.bank_routing_number}</span></div>` : ""}
      ${profile.bank_swift_code ? `<div class="payment-detail">SWIFT/BIC: <span class="payment-detail-value">${profile.bank_swift_code}</span></div>` : ""}
    </div>
    ` : ""}
    
    ${profile?.upi_id ? `
    <div class="payment-method ${profile?.bank_name ? "payment-divider" : ""}">
      <div class="payment-method-title">UPI Payment</div>
      <div class="qr-container">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${total}&cu=INR" alt="UPI QR" class="qr-image">
        <div class="qr-text">
          <div class="payment-detail">UPI ID: <span class="payment-detail-value">${profile.upi_id}</span></div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">Scan to pay</div>
        </div>
      </div>
    </div>
    ` : ""}
    
    ${profile?.paypal_email ? `
    <div class="payment-method ${(profile?.bank_name || profile?.upi_id) ? "payment-divider" : ""}">
      <div class="payment-method-title">PayPal</div>
      <div class="payment-detail">PayPal Email: <span class="payment-detail-value">${profile.paypal_email}</span></div>
    </div>
    ` : ""}
  </div>
  ` : ""}

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
