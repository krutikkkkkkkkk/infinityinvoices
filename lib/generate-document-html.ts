import { Document, LineItem } from "./types"

const CURRENCIES: { [key: string]: string } = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
}

export type TemplateType = "classic" | "minimal" | "tax" | "dark"

export function generateDocumentHTML(
  document: Document & { line_items: LineItem[] },
  profile: any,
  template: TemplateType = "classic"
) {
  const lineItems = document.line_items || []
  const includeTax = document.include_tax !== false
  const subtotal = lineItems.reduce(
    (sum: number, item: LineItem) => sum + item.quantity * item.rate,
    0
  )
  const taxAmount = includeTax
    ? lineItems.reduce(
        (sum: number, item: LineItem) => sum + (item.quantity * item.rate * item.tax_percent) / 100,
        0
      )
    : 0
  const discount = document.discount_value || 0
  const total = subtotal + taxAmount - discount

  const currencySymbol = CURRENCIES[document.currency] || "₹"

  if (template === "minimal") {
    return generateMinimalTemplate(document, profile, lineItems, currencySymbol, subtotal, taxAmount, discount, total, includeTax)
  }

  if (template === "tax") {
    return generateTaxTemplate(document, profile, lineItems, currencySymbol, subtotal, taxAmount, discount, total, includeTax)
  }

  if (template === "dark") {
    return generateDarkTemplate(document, profile, lineItems, currencySymbol, subtotal, taxAmount, discount, total, includeTax)
  }

  return generateClassicTemplate(document, profile, lineItems, currencySymbol, subtotal, taxAmount, discount, total, includeTax)
}

function generateClassicTemplate(
  document: Document & { line_items: LineItem[] },
  profile: any,
  lineItems: LineItem[],
  currencySymbol: string,
  subtotal: number,
  taxAmount: number,
  discount: number,
  total: number,
  includeTax: boolean
) {
  const itemsHtml = lineItems
    .map(
      (item: LineItem, i: number) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name || item.description || ""}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol}${Number(item.rate).toFixed(2)}</td>
        ${includeTax ? `<td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.tax_percent}%</td>` : ""}
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol}${Number(item.line_total).toFixed(2)}</td>
      </tr>
  `
    )
    .join("")

function generateTaxTemplate(
  document: Document & { line_items: LineItem[] },
  profile: any,
  lineItems: LineItem[],
  currencySymbol: string,
  subtotal: number,
  taxAmount: number,
  discount: number,
  total: number,
  includeTax: boolean
) {
  const itemsHtml = lineItems
    .map(
      (item: LineItem, i: number) => {
        const itemTotal = item.quantity * item.rate
        const tax = (itemTotal * item.tax_percent) / 100
        const lineTotal = itemTotal + tax
        return `
      <tr>
        <td>${i + 1}</td>
        <td>${item.description || ""}</td>
        <td style="text-align: right;">${item.quantity}</td>
        <td style="text-align: right;">${currencySymbol}${Number(item.rate).toFixed(2)}</td>
        ${includeTax ? `<td style="text-align: right;">${item.tax_percent}%</td>` : ""}
        <td style="text-align: right;">${currencySymbol}${Number(lineTotal).toFixed(2)}</td>
      </tr>
    `
      }
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
      margin: 0.5in;
      padding: 0;
      width: 7.5in;
      min-height: 9.5in;
      line-height: 1.6;
    }
    @page {
      margin: 0.5in;
      size: A4;
    }
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    .page-break { break-after: page; }
    .no-break { break-inside: avoid; }
    
    .tax-header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 3px solid #dc2626;
    }
    .tax-badge {
      font-size: 11px;
      font-weight: 700;
      color: #dc2626;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }
    .company-name { font-size: 24px; font-weight: 700; margin: 8px 0; }
    .gstin-info { font-size: 12px; color: #666; margin-top: 4px; }
    
    .invoice-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 24px;
    }
    .bill-to-section { }
    .bill-to-label { font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; margin-bottom: 8px; }
    .client-name { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 4px; }
    .gstin { font-size: 11px; color: #666; margin-top: 4px; }
    .client-address { font-size: 11px; color: #666; margin-top: 8px; }
    
    .invoice-details { text-align: right; }
    .detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .detail-label { font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; }
    .detail-value { font-size: 13px; font-weight: 600; color: #1f2937; }
    .due-date { color: #dc2626; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    thead tr { background-color: #f3f4f6; border-bottom: 2px solid #1f2937; }
    th {
      text-align: left;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #1f2937;
    }
    td {
      padding: 12px;
      font-size: 13px;
      border-bottom: 1px solid #e5e7eb;
      color: #1f2937;
    }
    
    .totals {
      width: 100%;
      border-left: 3px solid #1f2937;
      padding-left: 16px;
      margin-bottom: 24px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
    }
    .total-row.tax { color: #dc2626; font-weight: 700; }
    .total-row.final {
      padding-top: 12px;
      padding-bottom: 12px;
      border-top: 2px solid #1f2937;
      border-bottom: 2px solid #1f2937;
      font-size: 14px;
      font-weight: 700;
    }
    
    .footer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      margin-top: 24px;
      font-size: 11px;
    }
    .footer-section-title { font-weight: 700; color: #1f2937; margin-bottom: 8px; }
    .footer-detail { color: #666; margin-bottom: 4px; font-size: 11px; }
    .signatory { text-align: right; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="tax-header">
    <div class="tax-badge">TAX INVOICE</div>
    ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" style="height: 48px; margin: 8px 0;">` : ""}
    <div class="company-name">${profile?.company_name || "Your Company"}</div>
    ${profile?.gst_id ? `<div class="gstin-info">GSTIN: <strong>${profile.gst_id}</strong></div>` : ""}
  </div>

  <div class="invoice-grid">
    <div class="bill-to-section">
      <div class="bill-to-label">Bill To</div>
      <div class="client-name">${document.client_name || "Client"}</div>
      ${document.client_gst_id ? `<div class="gstin">GSTIN: <strong>${document.client_gst_id}</strong></div>` : ""}
      ${document.client_address ? `<div class="client-address">${document.client_address}</div>` : ""}
      ${document.client_email ? `<div class="client-address">${document.client_email}</div>` : ""}
    </div>
    <div class="invoice-details">
      <div class="detail-row">
        <div>
          <div class="detail-label">Invoice No.</div>
          <div class="detail-value">${document.number}</div>
        </div>
        <div>
          <div class="detail-label">Date</div>
          <div class="detail-value">${new Date(document.issue_date).toLocaleDateString("en-IN")}</div>
        </div>
      </div>
      ${document.due_date ? `
      <div>
        <div class="detail-label">Due Date</div>
        <div class="detail-value due-date">${new Date(document.due_date).toLocaleDateString("en-IN")}</div>
      </div>
      ` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right; width: 60px;">Qty</th>
        <th style="text-align: right; width: 100px;">Rate</th>
        ${includeTax ? `<th style="text-align: right; width: 60px;">GST %</th>` : ""}
        <th style="text-align: right; width: 100px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>${currencySymbol}${subtotal.toFixed(2)}</span>
    </div>
    ${includeTax && taxAmount > 0 ? `
    <div class="total-row tax">
      <span>Tax (GST):</span>
      <span>${currencySymbol}${taxAmount.toFixed(2)}</span>
    </div>
    ` : ""}
    ${discount > 0 ? `
    <div class="total-row">
      <span>Discount:</span>
      <span>-${currencySymbol}${discount.toFixed(2)}</span>
    </div>
    ` : ""}
    <div class="total-row final">
      <span>TOTAL:</span>
      <span>${currencySymbol}${total.toFixed(2)}</span>
    </div>
  </div>

  <div class="footer">
    <div>
      <div class="footer-section-title">Bank Details</div>
      ${profile?.bank_name ? `<div class="footer-detail">${profile.bank_name}</div>` : ""}
      ${profile?.bank_account_name ? `<div class="footer-detail">Acc Name: ${profile.bank_account_name}</div>` : ""}
      ${profile?.bank_account_number ? `<div class="footer-detail">Acc No: ${profile.bank_account_number}</div>` : ""}
      ${profile?.bank_swift_code ? `<div class="footer-detail">SWIFT: ${profile.bank_swift_code}</div>` : ""}
    </div>
    <div class="signatory">
      <div class="footer-section-title">Authorized Signatory</div>
      <div style="margin-top: 48px;">${profile?.company_name || "Company"}</div>
    </div>
  </div>
</body>
</html>
  `
}

    @page {
      margin: 0.5in;
      size: A4;
    }
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    .page-break { break-after: page; }
    .no-break { break-inside: avoid; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 40px; margin-bottom: 32px; width: 100%; }
    .company-info { flex: 1; min-width: 0; }
    .company-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: #1f2937; }
    .company-details { font-size: 12px; color: #6b7280; line-height: 1.6; }
    .invoice-info { text-align: right; white-space: nowrap; }
    .invoice-title { font-size: 32px; font-weight: 700; text-transform: uppercase; color: #1f2937; margin-bottom: 8px; }
    .invoice-meta { font-size: 12px; color: #6b7280; margin-top: 4px; line-height: 1.6; }
    .bill-to { margin-bottom: 32px; padding: 16px; background: #f9fafb; border-radius: 6px; }
    .bill-to-label { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; font-weight: 600; }
    .client-name { font-size: 15px; font-weight: 600; color: #1f2937; }
    .client-details { font-size: 12px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
    th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
    td { font-size: 13px; color: #1f2937; }
    .totals { margin-left: auto; width: 300px; margin-bottom: 24px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #1f2937; }
    .total-row.discount { color: #dc2626; }
    .total-row.final { border-top: 2px solid #1f2937; font-weight: 700; font-size: 16px; margin-top: 12px; padding-top: 12px; }
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
        ${includeTax ? `<th style="width: 80px;">Tax</th>` : ""}
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
    ${includeTax && taxAmount > 0 ? `
    <div class="total-row tax">
      <span>Tax</span>
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

function generateMinimalTemplate(
  document: Document & { line_items: LineItem[] },
  profile: any,
  lineItems: LineItem[],
  currencySymbol: string,
  subtotal: number,
  taxAmount: number,
  discount: number,
  total: number,
  includeTax: boolean
) {
  const taxPercent = subtotal > 0 ? Math.round((taxAmount / subtotal) * 100) : 0

  const itemsHtml = lineItems
    .map(
      (item: LineItem) => `
      <tr style="border-bottom: 1px solid #e8e8e0;">
        <td style="padding: 16px 0; color: #666;">
          ${item.name || item.description || ""}
          ${item.description && item.name ? `<br><span style="font-size: 12px; color: #999;">${item.description}</span>` : ""}
        </td>
        <td style="padding: 16px 0; text-align: right; color: #666;">${currencySymbol}${Number(item.rate).toFixed(2)}/hr</td>
        <td style="padding: 16px 0; text-align: right; color: #666;">${item.quantity}</td>
        <td style="padding: 16px 0; text-align: right; color: #1a1a1a;">${currencySymbol}${Number(item.line_total).toFixed(2)}</td>
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
      color: #1a1a1a;
      background: #f5f5f0;
      margin: 0;
      padding: 0.5in;
      min-height: 11in;
      line-height: 1.6;
    }
    @page {
      margin: 0;
      size: A4;
    }
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    .page-break { break-after: page; }
    .no-break { break-inside: avoid; }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px;">
    <h1 style="font-size: 48px; font-weight: 900; letter-spacing: -1px; color: #1a1a1a;">
      ${document.type === "quotation" ? "Quotation" : "Invoice"}
    </h1>
    <div style="text-align: right; font-size: 14px; color: #666;">
      <p>${new Date(document.issue_date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</p>
      <p style="font-weight: 500; color: #1a1a1a;">${document.type === "quotation" ? "Quotation" : "Invoice"} No. ${document.number || "DRAFT"}</p>
    </div>
  </div>

  <!-- Billed To Card -->
  <div style="margin-bottom: 40px; padding: 20px; background: #e8e8e0; border-radius: 8px;">
    <p style="font-size: 14px; font-weight: 500; color: #3b82f6; margin-bottom: 8px;">Billed to:</p>
    <p style="font-weight: 500; color: #1a1a1a;">${document.client_name || "Client Name"}</p>
    ${document.client_phone ? `<p style="font-size: 14px; color: #666;">${document.client_phone}</p>` : ""}
    ${document.client_address ? `<p style="font-size: 14px; color: #666;">${document.client_address}</p>` : ""}
  </div>

  <!-- Line Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
    <thead>
      <tr style="border-bottom: 2px solid #d4d4c8;">
        <th style="padding: 12px 0; text-align: left; font-size: 14px; font-weight: 500; color: #666;">Description</th>
        <th style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 500; color: #666;">Rate</th>
        <th style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 500; color: #666;">Hours</th>
        <th style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 500; color: #666;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
    <div style="width: 250px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
        <span style="color: #666;">Subtotal</span>
        <span style="color: #1a1a1a;">${currencySymbol}${subtotal.toFixed(2)}</span>
      </div>
      ${includeTax ? `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
        <span style="color: #666;">Tax (${taxPercent}%)</span>
        <span style="color: #1a1a1a;">${currencySymbol}${taxAmount.toFixed(2)}</span>
      </div>
      ` : ""}
      ${discount > 0 ? `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #dc2626;">
        <span>Discount</span>
        <span>-${currencySymbol}${discount.toFixed(2)}</span>
      </div>
      ` : ""}
      <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 8px; border-top: 2px solid #1a1a1a; font-size: 18px; font-weight: 700;">
        <span style="color: #1a1a1a;">Total</span>
        <span style="color: #1a1a1a;">${currencySymbol}${total.toFixed(2)}</span>
      </div>
    </div>
  </div>

  <!-- Footer - Two Column Layout -->
  <div style="margin-top: auto; padding-top: 32px; border-top: 1px solid #d4d4c8; display: flex; gap: 32px;">
    <!-- Payment Information -->
    <div style="flex: 1;">
      <h3 style="font-weight: 600; margin-bottom: 12px; color: #1a1a1a;">Payment Information</h3>
      <div style="font-size: 14px; color: #666; line-height: 1.8;">
        ${profile?.company_name ? `<p>${profile.company_name}</p>` : ""}
        ${profile?.bank_name ? `<p>Bank: ${profile.bank_name}</p>` : ""}
        ${profile?.bank_account_number ? `<p>Account No: ${profile.bank_account_number}</p>` : ""}
        ${profile?.bank_routing_number ? `<p>IFSC/Routing: ${profile.bank_routing_number}</p>` : ""}
      </div>
    </div>

    <!-- Sender Info -->
    <div style="flex: 1;">
      <h3 style="font-weight: 600; margin-bottom: 12px; color: #1a1a1a;">${profile?.company_name || "Your Company"}</h3>
      <div style="font-size: 14px; color: #666; line-height: 1.8;">
        ${profile?.company_address ? `<p>${profile.company_address}</p>` : ""}
        ${profile?.phone ? `<p>${profile.phone}</p>` : ""}
        ${profile?.email ? `<p>${profile.email}</p>` : ""}
      </div>
    </div>
  </div>
</body>
</html>
  `
}

function generateDarkTemplate(
  document: Document & { line_items: LineItem[] },
  profile: any,
  lineItems: LineItem[],
  currencySymbol: string,
  subtotal: number,
  taxAmount: number,
  discount: number,
  total: number,
  includeTax: boolean
) {
  const itemsHtml = lineItems
    .map(
      (item: LineItem, i: number) => {
        const itemSubtotal = item.quantity * item.rate
        const itemTax = includeTax ? (itemSubtotal * item.tax_percent) / 100 : 0
        const itemTotal = itemSubtotal + itemTax

        return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #444; color: #f3f4f6;">${item.description || ""}</td>
        <td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #d1d5db;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #d1d5db;">${currencySymbol}${itemSubtotal.toFixed(2)}</td>
        ${includeTax ? `<td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #d1d5db;">${item.tax_percent}%</td>` : ""}
        <td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #f3f4f6; font-weight: 600;">${currencySymbol}${itemTotal.toFixed(2)}</td>
      </tr>
    `
      }
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
      color: #f3f4f6;
      background: #2a2a2a;
      margin: 0.5in;
      padding: 0;
      width: 7.5in;
      min-height: 9.5in;
      line-height: 1.6;
    }
    @page {
      margin: 0.5in;
      size: A4;
    }
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    .page-break { break-after: page; }
    .no-break { break-inside: avoid; }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 2px solid #444;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo {
      width: 64px;
      height: 64px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    .company-info {
      color: #f3f4f6;
    }
    .company-name {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .company-details {
      font-size: 12px;
      color: #d1d5db;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 48px;
      font-weight: 900;
      letter-spacing: 4px;
      margin-bottom: 8px;
      color: #ffffff;
    }
    .invoice-number {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 12px;
    }
    .invoice-date {
      font-size: 11px;
      color: #6b7280;
    }
    
    .bill-to {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #444;
    }
    .bill-section {
      color: #f3f4f6;
    }
    .bill-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9ca3af;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .bill-name {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
      color: #ffffff;
    }
    .bill-detail {
      font-size: 12px;
      color: #d1d5db;
      margin-top: 4px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    thead tr {
      border-bottom: 2px solid #555;
    }
    th {
      text-align: left;
      padding: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #9ca3af;
      letter-spacing: 0.5px;
    }
    th:nth-child(n+2) { text-align: right; }
    
    .totals {
      margin-left: auto;
      width: 300px;
      padding-left: 32px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
      color: #d1d5db;
    }
    .total-row.final {
      border-top: 2px solid #555;
      padding-top: 12px;
      margin-top: 12px;
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }
    
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #444;
      font-size: 11px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" class="logo" style="width: 64px; height: 64px;">` : `<div class="logo">
        <div style="width: 48px; height: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <div style="background: #2a2a2a;"></div>
          <div style="background: #2a2a2a;"></div>
          <div style="background: #2a2a2a;"></div>
          <div style="background: #2a2a2a;"></div>
        </div>
      </div>`}
      <div class="company-info">
        <div class="company-name">${profile?.company_name || "FACTURA"}</div>
        <div class="company-details">${profile?.city || ""}</div>
      </div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">FACTURA</div>
      <div class="invoice-number">N° ${document.number}</div>
      <div class="invoice-date">${new Date(document.issue_date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}</div>
    </div>
  </div>

  <div class="bill-to">
    <div class="bill-section">
      <div class="bill-label">Empresa</div>
      <div class="bill-name">${profile?.company_name || "Company Name"}</div>
      <div class="bill-detail">${profile?.address || ""}</div>
      ${profile?.phone ? `<div class="bill-detail">${profile.phone}</div>` : ""}
      ${profile?.email ? `<div class="bill-detail">${profile.email}</div>` : ""}
    </div>
    <div class="bill-section">
      <div class="bill-label">Cliente</div>
      <div class="bill-name">${document.client_name || "Client Name"}</div>
      <div class="bill-detail">${document.client_address || ""}</div>
      ${document.client_email ? `<div class="bill-detail">${document.client_email}</div>` : ""}
      ${document.client_phone ? `<div class="bill-detail">${document.client_phone}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Descripción / Producto</th>
        <th style="width: 80px;">Cantidad</th>
        <th style="width: 100px;">Base</th>
        ${includeTax ? `<th style="width: 60px;">IVA</th>` : ""}
        <th style="width: 100px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Base Imponible</span>
      <span>${currencySymbol}${subtotal.toFixed(2)}</span>
    </div>
    ${includeTax && taxAmount > 0 ? `
    <div class="total-row">
      <span>IVA</span>
      <span>${currencySymbol}${taxAmount.toFixed(2)}</span>
    </div>
    ` : ""}
    ${discount > 0 ? `
    <div class="total-row">
      <span>Rebención</span>
      <span>-${currencySymbol}${discount.toFixed(2)}</span>
    </div>
    ` : ""}
    <div class="total-row final">
      <span>Total</span>
      <span>${currencySymbol}${total.toFixed(2)}</span>
    </div>
  </div>

  <div class="footer">
    <p>El pago se recibirá en el plazo de tres meses desde la emisión de esta factura.</p>
  </div>
</body>
</html>
  `
}
