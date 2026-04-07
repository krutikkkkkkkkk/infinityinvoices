import { Document, LineItem } from "./types"

const CURRENCIES: { [key: string]: string } = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
}

export type TemplateType = "classic" | "minimal" | "tax" | "dark" | "executive" | "bold"

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

  if (template === "executive") {
    return generateExecutiveTemplate(document, profile, lineItems, currencySymbol, subtotal, taxAmount, discount, total, includeTax)
  }

  if (template === "bold") {
    return generateBoldTemplate(document, profile, lineItems, currencySymbol, subtotal, taxAmount, discount, total, includeTax)
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

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { margin: 0.5in; size: A4; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .company-logo { max-height: 60px; margin-bottom: 12px; }
    .company-name { font-size: 18px; font-weight: 700; color: #1f2937; }
    .company-details { font-size: 12px; color: #6b7280; line-height: 1.6; }
    .invoice-title { font-size: 32px; font-weight: 700; text-transform: uppercase; color: #1f2937; }
    .invoice-meta { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .bill-to { margin-bottom: 32px; padding: 16px; background: #f9fafb; border-radius: 6px; }
    .bill-to-label { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; font-weight: 600; }
    .client-name { font-size: 15px; font-weight: 600; color: #1f2937; }
    .client-details { font-size: 12px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    .totals { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
    .total-row.final { border-top: 2px solid #1f2937; font-weight: 700; font-size: 16px; margin-top: 8px; padding-top: 12px; }
    .payment-info { margin-top: 32px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px; }
    .payment-label { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 12px; font-weight: 600; }
    .payment-method { margin-bottom: 12px; }
    .payment-method-title { font-weight: 600; font-size: 13px; margin-bottom: 6px; }
    .payment-detail { font-size: 12px; color: #6b7280; margin: 2px 0; }
    .qr-container { display: flex; gap: 12px; margin-top: 8px; }
    .qr-image { width: 80px; height: 80px; }
    .notes { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .notes-label { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; font-weight: 600; }
    .notes-text { font-size: 12px; color: #6b7280; white-space: pre-line; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" class="company-logo">` : ""}
      <div class="company-name">${profile?.company_name || "Your Company"}</div>
      <div class="company-details">
        ${profile?.company_address ? `${profile.company_address}<br>` : ""}
        ${profile?.email ? `${profile.email}<br>` : ""}
        ${profile?.phone ? `${profile.phone}<br>` : ""}
        ${profile?.gst_id ? `GSTIN: ${profile.gst_id}` : ""}
      </div>
    </div>
    <div style="text-align: right;">
      <div class="invoice-title">${document.type === "quotation" ? "Quotation" : "Invoice"}</div>
      <div class="invoice-meta"><strong>#</strong> ${document.number || "DRAFT"}</div>
      <div class="invoice-meta"><strong>Date:</strong> ${new Date(document.issue_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
      ${document.due_date ? `<div class="invoice-meta"><strong>Due:</strong> ${new Date(document.due_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>` : ""}
    </div>
  </div>

  <div class="bill-to">
    <div class="bill-to-label">Bill To</div>
    <div class="client-name">${document.client_name || "Client"}</div>
    <div class="client-details">
      ${document.client_email ? `${document.client_email}<br>` : ""}
      ${document.client_address || ""}
      ${document.client_gst_id ? `<br>GSTIN: ${document.client_gst_id}` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Description</th>
        <th style="text-align: right; width: 60px;">Qty</th>
        <th style="text-align: right; width: 100px;">Rate</th>
        ${includeTax ? `<th style="text-align: right; width: 60px;">Tax</th>` : ""}
        <th style="text-align: right; width: 100px;">Amount</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>${currencySymbol}${subtotal.toFixed(2)}</span></div>
    ${includeTax && taxAmount > 0 ? `<div class="total-row"><span>Tax</span><span>${currencySymbol}${taxAmount.toFixed(2)}</span></div>` : ""}
    ${discount > 0 ? `<div class="total-row" style="color: #dc2626;"><span>Discount</span><span>-${currencySymbol}${discount.toFixed(2)}</span></div>` : ""}
    <div class="total-row final"><span>Total</span><span>${currencySymbol}${total.toFixed(2)}</span></div>
  </div>

  ${(profile?.bank_name || profile?.upi_id || profile?.paypal_email) ? `
  <div class="payment-info">
    <div class="payment-label">Payment Information</div>
    ${profile?.bank_name ? `
    <div class="payment-method">
      <div class="payment-method-title">Bank Transfer</div>
      <div class="payment-detail">Bank: ${profile.bank_name}</div>
      ${profile.bank_account_name ? `<div class="payment-detail">Account: ${profile.bank_account_name}</div>` : ""}
      ${profile.bank_account_number ? `<div class="payment-detail">A/C #: ${profile.bank_account_number}</div>` : ""}
      ${profile.bank_routing_number ? `<div class="payment-detail">IFSC: ${profile.bank_routing_number}</div>` : ""}
      ${profile.bank_swift_code ? `<div class="payment-detail">SWIFT: ${profile.bank_swift_code}</div>` : ""}
    </div>
    ` : ""}
    ${profile?.upi_id ? `
    <div class="payment-method" style="${profile?.bank_name ? "border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;" : ""}">
      <div class="payment-method-title">UPI Payment</div>
      <div class="qr-container">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${total}&cu=INR" alt="UPI QR" class="qr-image">
        <div><div class="payment-detail">UPI ID: ${profile.upi_id}</div><div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">Scan to pay</div></div>
      </div>
    </div>
    ` : ""}
    ${profile?.paypal_email ? `
    <div class="payment-method" style="${(profile?.bank_name || profile?.upi_id) ? "border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;" : ""}">
      <div class="payment-method-title">PayPal</div>
      <div class="payment-detail">Email: ${profile.paypal_email}</div>
    </div>
    ` : ""}
  </div>
  ` : ""}

  ${document.notes ? `<div class="notes"><div class="notes-label">Notes</div><div class="notes-text">${document.notes}</div></div>` : ""}
  ${document.terms ? `<div class="notes"><div class="notes-label">Terms & Conditions</div><div class="notes-text">${document.terms}</div></div>` : ""}

  <div class="footer">Thank you for your business!</div>
</body>
</html>
  `
}

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
      (item: LineItem, i: number) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #444;">
          <div style="color: #f3f4f6; font-weight: 500;">${item.name || ""}</div>
          ${item.description ? `<div style="font-size: 12px; color: #9ca3af;">${item.description}</div>` : ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #d1d5db;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #d1d5db;">${currencySymbol}${Number(item.rate).toFixed(2)}</td>
        ${includeTax ? `<td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #d1d5db;">${item.tax_percent}%</td>` : ""}
        <td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #f3f4f6; font-weight: 600;">${currencySymbol}${Number(item.line_total).toFixed(2)}</td>
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
      text-transform: uppercase;
    }
    .invoice-number {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 4px;
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
    .bill-section.right {
      text-align: right;
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
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
      color: #d1d5db;
    }
    .total-row.discount {
      color: #f87171;
    }
    .total-row.final {
      border-top: 2px solid #555;
      padding-top: 12px;
      margin-top: 12px;
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }
    
    .payment-info {
      margin-top: 24px;
      padding: 16px;
      background: #333;
      border-radius: 8px;
      border: 1px solid #444;
    }
    .payment-title {
      font-size: 12px;
      font-weight: 600;
      color: #d1d5db;
      margin-bottom: 12px;
    }
    .payment-section {
      margin-bottom: 12px;
    }
    .payment-section-title {
      font-size: 11px;
      font-weight: 600;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    .payment-detail {
      font-size: 11px;
      color: #d1d5db;
      margin: 2px 0;
    }
    .payment-detail span {
      color: #9ca3af;
    }
    
    .notes-section {
      margin-top: 16px;
    }
    .notes-title {
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    .notes-text {
      font-size: 12px;
      color: #d1d5db;
      white-space: pre-line;
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
      ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" class="logo" style="width: 64px; height: 64px; object-fit: contain;">` : `<div class="logo">
        <div style="width: 48px; height: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <div style="background: #2a2a2a;"></div>
          <div style="background: #2a2a2a;"></div>
          <div style="background: #2a2a2a;"></div>
          <div style="background: #2a2a2a;"></div>
        </div>
      </div>`}
      <div class="company-info">
        <div class="company-name">${profile?.company_name || "Your Company"}</div>
        <div class="company-details">${profile?.company_address || ""}</div>
      </div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">${document.type}</div>
      <div class="invoice-number"># ${document.number}</div>
      <div class="invoice-date">Date: ${new Date(document.issue_date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</div>
      ${document.due_date ? `<div class="invoice-date">Due: ${new Date(document.due_date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</div>` : ""}
    </div>
  </div>

  <div class="bill-to">
    <div class="bill-section">
      <div class="bill-label">From</div>
      <div class="bill-name">${profile?.company_name || "Your Company"}</div>
      ${profile?.company_address ? `<div class="bill-detail">${profile.company_address}</div>` : ""}
      ${profile?.email ? `<div class="bill-detail">${profile.email}</div>` : ""}
      ${profile?.phone ? `<div class="bill-detail">${profile.phone}</div>` : ""}
      ${profile?.gst_id ? `<div class="bill-detail">GST: ${profile.gst_id}</div>` : ""}
    </div>
    <div class="bill-section right">
      <div class="bill-label">Bill To</div>
      <div class="bill-name">${document.client_name || "Client Name"}</div>
      ${document.client_address ? `<div class="bill-detail">${document.client_address}</div>` : ""}
      ${document.client_email ? `<div class="bill-detail">${document.client_email}</div>` : ""}
      ${document.client_gst_id ? `<div class="bill-detail">GST: ${document.client_gst_id}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="width: 60px;">Qty</th>
        <th style="width: 100px;">Rate</th>
        ${includeTax ? `<th style="width: 60px;">Tax</th>` : ""}
        <th style="width: 100px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>${currencySymbol}${Number(document.subtotal).toFixed(2)}</span>
    </div>
    ${includeTax && Number(document.tax_total) > 0 ? `
    <div class="total-row">
      <span>Tax:</span>
      <span>${currencySymbol}${Number(document.tax_total).toFixed(2)}</span>
    </div>
    ` : ""}
    ${discount > 0 ? `
    <div class="total-row discount">
      <span>Discount${document.discount_type === "percentage" ? ` (${document.discount_value}%)` : ""}:</span>
      <span>-${currencySymbol}${document.discount_type === "percentage" ? ((Number(document.subtotal) * Number(document.discount_value)) / 100).toFixed(2) : Number(discount).toFixed(2)}</span>
    </div>
    ` : ""}
    <div class="total-row final">
      <span>Total:</span>
      <span>${currencySymbol}${Number(document.grand_total).toFixed(2)}</span>
    </div>
  </div>

  ${(profile?.bank_name || profile?.upi_id || profile?.paypal_email) ? `
  <div class="payment-info">
    <div class="payment-title">Payment Information</div>
    ${profile?.bank_name ? `
    <div class="payment-section">
      <div class="payment-section-title">Bank Transfer</div>
      <div class="payment-detail"><span>Bank:</span> ${profile.bank_name}</div>
      ${profile.bank_account_name ? `<div class="payment-detail"><span>Account Name:</span> ${profile.bank_account_name}</div>` : ""}
      ${profile.bank_account_number ? `<div class="payment-detail"><span>Account Number:</span> ${profile.bank_account_number}</div>` : ""}
      ${profile.bank_routing_number ? `<div class="payment-detail"><span>Routing/IFSC:</span> ${profile.bank_routing_number}</div>` : ""}
      ${profile.bank_swift_code ? `<div class="payment-detail"><span>SWIFT/BIC:</span> ${profile.bank_swift_code}</div>` : ""}
    </div>
    ` : ""}
    ${profile?.upi_id ? `
    <div class="payment-section">
      <div class="payment-section-title">UPI Payment</div>
      <div class="payment-detail"><span>UPI ID:</span> ${profile.upi_id}</div>
    </div>
    ` : ""}
    ${profile?.paypal_email ? `
    <div class="payment-section">
      <div class="payment-section-title">PayPal</div>
      <div class="payment-detail"><span>PayPal Email:</span> ${profile.paypal_email}</div>
    </div>
    ` : ""}
  </div>
  ` : ""}

  ${document.notes ? `
  <div class="notes-section">
    <div class="notes-title">Notes</div>
    <div class="notes-text">${document.notes}</div>
  </div>
  ` : ""}

  ${document.terms ? `
  <div class="notes-section">
    <div class="notes-title">Terms & Conditions</div>
    <div class="notes-text">${document.terms}</div>
  </div>
  ` : ""}

  <div class="footer">
    <p>Thank you for your business!</p>
  </div>
</body>
</html>
  `
}

function generateExecutiveTemplate(
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
      (item: LineItem) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #111827; font-size: 13px;">${item.name || ""}</div>
          ${item.description ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">${item.description}</div>` : ""}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; color: #374151;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; color: #374151;">${currencySymbol}${Number(item.rate).toFixed(2)}</td>
        ${includeTax ? `<td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; color: #374151;">${item.tax_percent}%</td>` : ""}
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; font-weight: 600; color: #111827;">${currencySymbol}${Number(item.line_total).toFixed(2)}</td>
      </tr>
    `
    )
    .join("")

  const dateFormatted = new Date(document.issue_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  const dueDateFormatted = document.due_date ? new Date(document.due_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : null

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; }
    @page { margin: 0; size: A4; }
    .page-break { break-after: page; }
    .no-break { break-inside: avoid; }
  </style>
</head>
<body>
  <div style="display: flex; min-height: 297mm; width: 210mm; margin: 0 auto;">
    <!-- Navy Sidebar -->
    <div style="width: 56mm; background: linear-gradient(to bottom, #1e3a5f, #0f2744); color: white; padding: 24px 20px; display: flex; flex-direction: column;">
      ${profile?.logo_url ? `<div style="background: white; border-radius: 8px; padding: 10px; margin-bottom: 20px;"><img src="${profile.logo_url}" alt="Logo" style="height: 48px; width: auto; display: block;"></div>` : ""}
      <div style="margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 8px;">${profile?.company_name || "Your Company"}</div>
        ${profile?.company_address ? `<div style="font-size: 10px; opacity: 0.8; white-space: pre-line; line-height: 1.5; margin-bottom: 8px;">${profile.company_address}</div>` : ""}
        ${profile?.email ? `<div style="font-size: 10px; opacity: 0.8; margin-top: 4px;">${profile.email}</div>` : ""}
        ${profile?.phone ? `<div style="font-size: 10px; opacity: 0.8;">${profile.phone}</div>` : ""}
        ${profile?.gst_id ? `<div style="font-size: 10px; opacity: 0.7; margin-top: 8px;">GST: ${profile.gst_id}</div>` : ""}
      </div>
      ${profile?.upi_id ? `
      <div style="margin-top: auto;">
        <div style="background: white; padding: 8px; border-radius: 6px; margin-bottom: 6px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${document.grand_total}&cu=${document.currency}" alt="UPI QR" style="width: 100%; display: block;">
        </div>
        <div style="font-size: 9px; text-align: center; opacity: 0.7;">Scan to Pay via UPI</div>
      </div>
      ` : ""}
    </div>

    <!-- Main content -->
    <div style="flex: 1; padding: 32px 28px; display: flex; flex-direction: column;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #d4af37;">
        <div>
          <h1 style="font-size: 28px; font-weight: 800; color: #1e3a5f; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${document.type}</h1>
          <p style="font-size: 12px; color: #9ca3af;">Document #${document.number}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 10px; color: #9ca3af; margin-bottom: 2px;">Issue Date</p>
          <p style="font-size: 12px; font-weight: 600; color: #111827;">${dateFormatted}</p>
          ${dueDateFormatted ? `<p style="font-size: 10px; color: #9ca3af; margin-top: 8px; margin-bottom: 2px;">Due Date</p><p style="font-size: 12px; font-weight: 600; color: #d4af37;">${dueDateFormatted}</p>` : ""}
        </div>
      </div>

      <!-- Bill To -->
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <div style="width: 3px; height: 14px; background: #d4af37;"></div>
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1e3a5f;">Bill To</span>
        </div>
        <p style="font-weight: 700; color: #111827; font-size: 14px; margin-bottom: 4px;">${document.client_name || "Client"}</p>
        ${document.client_address ? `<p style="font-size: 12px; color: #6b7280; white-space: pre-line;">${document.client_address}</p>` : ""}
        ${document.client_email ? `<p style="font-size: 12px; color: #6b7280;">${document.client_email}</p>` : ""}
        ${document.client_gst_id ? `<p style="font-size: 12px; color: #6b7280; margin-top: 4px;"><strong>GST:</strong> ${document.client_gst_id}</p>` : ""}
      </div>

      <!-- Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #1e3a5f;">
            <th style="text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
            <th style="text-align: right; padding: 10px 12px; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; width: 50px;">Qty</th>
            <th style="text-align: right; padding: 10px 12px; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; width: 90px;">Rate</th>
            ${includeTax ? `<th style="text-align: right; padding: 10px 12px; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; width: 50px;">Tax</th>` : ""}
            <th style="text-align: right; padding: 10px 12px; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; width: 90px;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
        <div style="width: 260px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; color: #6b7280;"><span>Subtotal:</span><span style="color: #111827; font-weight: 500;">${currencySymbol}${subtotal.toFixed(2)}</span></div>
          ${includeTax && taxAmount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; color: #6b7280;"><span>Tax:</span><span style="color: #111827; font-weight: 500;">${currencySymbol}${taxAmount.toFixed(2)}</span></div>` : ""}
          ${discount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; color: #dc2626;"><span>Discount:</span><span>-${currencySymbol}${Number(discount).toFixed(2)}</span></div>` : ""}
          <div style="display: flex; justify-content: space-between; padding-top: 12px; margin-top: 4px; border-top: 2px solid #d4af37;">
            <span style="font-size: 15px; font-weight: 800; color: #1e3a5f;">Total:</span>
            <span style="font-size: 16px; font-weight: 800; color: #1e3a5f;">${currencySymbol}${Number(document.grand_total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Payment Info -->
      ${(profile?.bank_name || profile?.upi_id || profile?.paypal_email) ? `
      <div style="border: 2px solid #1e3a5f; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1e3a5f; margin-bottom: 12px;">Payment Information</p>
        ${profile?.bank_name ? `
        <div style="margin-bottom: 12px; font-size: 11px;">
          <p style="font-weight: 700; color: #374151; margin-bottom: 6px;">Bank Transfer</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <p style="color: #6b7280;"><b>Bank:</b> ${profile.bank_name}</p>
            ${profile.bank_account_name ? `<p style="color: #6b7280;"><b>Account:</b> ${profile.bank_account_name}</p>` : ""}
            ${profile.bank_account_number ? `<p style="color: #6b7280;"><b>A/C #:</b> <span style="font-family: monospace;">${profile.bank_account_number}</span></p>` : ""}
            ${profile.bank_routing_number ? `<p style="color: #6b7280;"><b>IFSC:</b> <span style="font-family: monospace;">${profile.bank_routing_number}</span></p>` : ""}
            ${profile.bank_swift_code ? `<p style="color: #6b7280;"><b>SWIFT:</b> <span style="font-family: monospace;">${profile.bank_swift_code}</span></p>` : ""}
          </div>
        </div>
        ` : ""}
        ${profile?.upi_id ? `<div style="border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 11px;"><p style="font-weight: 700; color: #374151; margin-bottom: 4px;">UPI</p><p style="color: #6b7280; font-family: monospace;">${profile.upi_id}</p></div>` : ""}
        ${profile?.paypal_email ? `<div style="border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 11px;"><p style="font-weight: 700; color: #374151; margin-bottom: 4px;">PayPal</p><p style="color: #6b7280;">${profile.paypal_email}</p></div>` : ""}
      </div>
      ` : ""}

      ${document.notes ? `<div style="margin-bottom: 12px;"><p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 4px;">Notes</p><p style="font-size: 12px; color: #374151; white-space: pre-line; line-height: 1.5;">${document.notes}</p></div>` : ""}
      ${document.terms ? `<div style="margin-bottom: 12px;"><p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 4px;">Terms &amp; Conditions</p><p style="font-size: 12px; color: #374151; white-space: pre-line; line-height: 1.5;">${document.terms}</p></div>` : ""}

      <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #d1d5db;">
        <p>Thank you for your business!</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

function generateBoldTemplate(
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
      (item: LineItem) => `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #111827; font-size: 13px;">${item.name || ""}</div>
          ${item.description ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">${item.description}</div>` : ""}
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; color: #4b5563;">${item.quantity}</td>
        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; color: #4b5563;">${currencySymbol}${Number(item.rate).toFixed(2)}</td>
        ${includeTax ? `<td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; color: #4b5563;">${item.tax_percent}%</td>` : ""}
        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; font-weight: 700; color: #111827;">${currencySymbol}${Number(item.line_total).toFixed(2)}</td>
      </tr>
    `
    )
    .join("")

  const dateFormatted = new Date(document.issue_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  const dueDateFormatted = document.due_date ? new Date(document.due_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : null

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; width: 210mm; min-height: 297mm; }
    @page { margin: 0; size: A4; }
    .page-break { break-after: page; }
    .no-break { break-inside: avoid; }
  </style>
</head>
<body>
  <!-- Black header band -->
  <div style="background: #0d0d0d; padding: 32px 40px;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" style="height: 48px; width: auto; margin-bottom: 12px; display: block;">` : ""}
        <div style="color: white; font-size: 18px; font-weight: 700; margin-bottom: 4px;">${profile?.company_name || "Your Company"}</div>
        ${profile?.company_address ? `<div style="color: #9ca3af; font-size: 11px; white-space: pre-line; line-height: 1.5;">${profile.company_address}</div>` : ""}
        ${profile?.email ? `<div style="color: #9ca3af; font-size: 11px;">${profile.email}</div>` : ""}
        ${profile?.phone ? `<div style="color: #9ca3af; font-size: 11px;">${profile.phone}</div>` : ""}
        ${profile?.gst_id ? `<div style="color: #9ca3af; font-size: 11px; margin-top: 4px;">GST: ${profile.gst_id}</div>` : ""}
      </div>
      <div style="text-align: right;">
        <div style="color: white; font-size: 52px; font-weight: 900; text-transform: uppercase; line-height: 1; letter-spacing: -1px;">${document.type}</div>
        <div style="color: #9ca3af; font-size: 12px; margin-top: 10px;">No. <strong style="color: white;">${document.number}</strong></div>
        <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">Date: <strong style="color: white;">${dateFormatted}</strong></div>
        ${dueDateFormatted ? `<div style="font-size: 12px; margin-top: 4px; color: #6b7280;">Due: <strong style="color: #fbbf24;">${dueDateFormatted}</strong></div>` : ""}
      </div>
    </div>
  </div>
  <!-- Amber accent bar -->
  <div style="height: 4px; background: #fbbf24;"></div>

  <!-- Body -->
  <div style="padding: 32px 40px;">
    <!-- Bill To -->
    <div style="margin-bottom: 32px;">
      <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-bottom: 8px;">Bill To</p>
      <p style="font-size: 20px; font-weight: 900; color: #111827; margin-bottom: 6px;">${document.client_name || "Client"}</p>
      ${document.client_address ? `<p style="font-size: 13px; color: #6b7280; white-space: pre-line; line-height: 1.5;">${document.client_address}</p>` : ""}
      ${document.client_email ? `<p style="font-size: 13px; color: #6b7280;">${document.client_email}</p>` : ""}
      ${document.client_gst_id ? `<p style="font-size: 13px; color: #6b7280; margin-top: 4px;"><b>GST:</b> ${document.client_gst_id}</p>` : ""}
    </div>

    <!-- Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="border-top: 2px solid #0d0d0d; border-bottom: 2px solid #0d0d0d;">
          <th style="text-align: left; padding: 12px 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #111827;">Item</th>
          <th style="text-align: right; padding: 12px 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #111827; width: 50px;">Qty</th>
          <th style="text-align: right; padding: 12px 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #111827; width: 90px;">Rate</th>
          ${includeTax ? `<th style="text-align: right; padding: 12px 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #111827; width: 50px;">Tax</th>` : ""}
          <th style="text-align: right; padding: 12px 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #111827; width: 90px;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <!-- Totals -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
      <div style="width: 280px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; color: #6b7280;"><span>Subtotal:</span><span style="color: #111827; font-weight: 500;">${currencySymbol}${subtotal.toFixed(2)}</span></div>
        ${includeTax && taxAmount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; color: #6b7280;"><span>Tax:</span><span style="color: #111827; font-weight: 500;">${currencySymbol}${taxAmount.toFixed(2)}</span></div>` : ""}
        ${discount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; color: #dc2626;"><span>Discount:</span><span>-${currencySymbol}${Number(discount).toFixed(2)}</span></div>` : ""}
        <div style="display: flex; justify-content: space-between; align-items: center; background: #0d0d0d; padding: 12px 16px; margin-top: 8px;">
          <span style="font-size: 14px; font-weight: 900; color: white; text-transform: uppercase; letter-spacing: 1px;">Total</span>
          <span style="font-size: 18px; font-weight: 900; color: #fbbf24;">${currencySymbol}${Number(document.grand_total).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- Payment Info -->
    ${(profile?.bank_name || profile?.upi_id || profile?.paypal_email) ? `
    <div style="border-top: 2px solid #0d0d0d; padding-top: 24px; margin-bottom: 24px;">
      <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #111827; margin-bottom: 16px;">Payment Information</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div>
          ${profile?.bank_name ? `
          <div style="margin-bottom: 16px; font-size: 11px;">
            <p style="font-weight: 700; color: #111827; margin-bottom: 6px;">Bank Transfer</p>
            <p style="color: #6b7280; margin-bottom: 2px;"><b>Bank:</b> ${profile.bank_name}</p>
            ${profile.bank_account_name ? `<p style="color: #6b7280; margin-bottom: 2px;"><b>Account:</b> ${profile.bank_account_name}</p>` : ""}
            ${profile.bank_account_number ? `<p style="color: #6b7280; margin-bottom: 2px;"><b>A/C #:</b> <span style="font-family: monospace;">${profile.bank_account_number}</span></p>` : ""}
            ${profile.bank_routing_number ? `<p style="color: #6b7280; margin-bottom: 2px;"><b>IFSC:</b> <span style="font-family: monospace;">${profile.bank_routing_number}</span></p>` : ""}
            ${profile.bank_swift_code ? `<p style="color: #6b7280;"><b>SWIFT:</b> <span style="font-family: monospace;">${profile.bank_swift_code}</span></p>` : ""}
          </div>
          ` : ""}
          ${profile?.paypal_email ? `<div style="font-size: 11px;"><p style="font-weight: 700; color: #111827; margin-bottom: 4px;">PayPal</p><p style="color: #6b7280;">${profile.paypal_email}</p></div>` : ""}
        </div>
        ${profile?.upi_id ? `
        <div>
          <p style="font-size: 11px; font-weight: 700; color: #111827; margin-bottom: 8px;">UPI Payment</p>
          <div style="border: 2px solid #0d0d0d; padding: 4px; display: inline-block; margin-bottom: 6px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${document.grand_total}&cu=${document.currency}" alt="UPI QR" style="width: 100px; height: 100px; display: block;">
          </div>
          <p style="font-size: 11px; color: #6b7280; font-family: monospace;">${profile.upi_id}</p>
        </div>
        ` : ""}
      </div>
    </div>
    ` : ""}

    ${document.notes ? `<div style="margin-bottom: 16px; border-left: 4px solid #fbbf24; padding-left: 12px;"><p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin-bottom: 4px;">Notes</p><p style="font-size: 12px; color: #374151; white-space: pre-line; line-height: 1.5;">${document.notes}</p></div>` : ""}
    ${document.terms ? `<div style="margin-bottom: 16px; border-left: 4px solid #d1d5db; padding-left: 12px;"><p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin-bottom: 4px;">Terms &amp; Conditions</p><p style="font-size: 12px; color: #374151; white-space: pre-line; line-height: 1.5;">${document.terms}</p></div>` : ""}

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af;">
      <span>Thank you for your business!</span>
      <span style="font-family: monospace;">${document.number}</span>
    </div>
  </div>
</body>
</html>`
}
