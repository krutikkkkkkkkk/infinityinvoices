import type { Document, LineItem } from "./types"

export type TemplateId = "classic" | "modern" | "minimal" | "branded" | "executive"

export interface PDFTemplate {
  id: TemplateId
  name: string
  description: string
  isPro: boolean
  thumbnail: string // inline SVG data URI for preview
  generate: (document: Document & { line_items: LineItem[] }, profile: any) => string
}

const CURRENCIES: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£",
}

function calcTotals(document: Document & { line_items: LineItem[] }) {
  const lineItems = document.line_items || []
  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.rate, 0)
  const taxAmount = subtotal * ((document.tax_rate || 0) / 100)
  const discount = document.discount || 0
  const total = subtotal + taxAmount - discount
  const currencySymbol = CURRENCIES[document.currency] || "₹"
  return { lineItems, subtotal, taxAmount, discount, total, currencySymbol }
}

function paymentSection(profile: any, total: number) {
  if (!profile?.bank_name && !profile?.upi_id && !profile?.paypal_email) return ""
  return `
  <div style="margin-top:24px;padding:16px;border:1px solid #e5e7eb;border-radius:6px;">
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;font-weight:700;margin-bottom:12px;">Payment Information</div>
    ${profile?.bank_name ? `
      <div style="margin-bottom:12px;">
        <div style="font-weight:600;font-size:12px;margin-bottom:6px;">Bank Transfer</div>
        ${profile.bank_name ? `<div style="font-size:11px;color:#4b5563;">Bank: <strong>${profile.bank_name}</strong></div>` : ""}
        ${profile.bank_account_name ? `<div style="font-size:11px;color:#4b5563;">Account Name: <strong>${profile.bank_account_name}</strong></div>` : ""}
        ${profile.bank_account_number ? `<div style="font-size:11px;color:#4b5563;">Account No: <strong style="font-family:monospace;">${profile.bank_account_number}</strong></div>` : ""}
        ${profile.bank_routing_number ? `<div style="font-size:11px;color:#4b5563;">IFSC/Routing: <strong style="font-family:monospace;">${profile.bank_routing_number}</strong></div>` : ""}
        ${profile.bank_swift_code ? `<div style="font-size:11px;color:#4b5563;">SWIFT: <strong style="font-family:monospace;">${profile.bank_swift_code}</strong></div>` : ""}
      </div>` : ""}
    ${profile?.upi_id ? `
      <div style="margin-bottom:12px;${profile?.bank_name ? "padding-top:12px;border-top:1px solid #f3f4f6;" : ""}">
        <div style="font-weight:600;font-size:12px;margin-bottom:6px;">UPI Payment</div>
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${total}&cu=INR" style="width:80px;height:80px;" />
          <div>
            <div style="font-size:11px;color:#6b7280;">UPI ID:</div>
            <div style="font-family:monospace;font-size:12px;">${profile.upi_id}</div>
            <div style="font-size:10px;color:#9ca3af;margin-top:4px;">Scan to pay</div>
          </div>
        </div>
      </div>` : ""}
    ${profile?.paypal_email ? `
      <div style="${(profile?.bank_name || profile?.upi_id) ? "padding-top:12px;border-top:1px solid #f3f4f6;" : ""}">
        <div style="font-weight:600;font-size:12px;margin-bottom:6px;">PayPal</div>
        <div style="font-size:11px;color:#4b5563;">Email: <strong>${profile.paypal_email}</strong></div>
      </div>` : ""}
  </div>`
}

// ─── CLASSIC TEMPLATE ────────────────────────────────────────────────────────
function generateClassic(document: Document & { line_items: LineItem[] }, profile: any): string {
  const { lineItems, subtotal, taxAmount, discount, total, currencySymbol } = calcTotals(document)

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;background:#fff;padding:40px;max-width:794px;margin:0 auto;line-height:1.5;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;}
    .company-name{font-size:20px;font-weight:700;color:#111827;margin-bottom:6px;}
    .company-details{font-size:11px;color:#6b7280;line-height:1.7;}
    .invoice-right{text-align:right;}
    .invoice-title{font-size:30px;font-weight:800;text-transform:uppercase;color:#111827;letter-spacing:-.5px;}
    .invoice-meta{font-size:12px;color:#6b7280;margin-top:4px;}
    .divider{border:none;border-top:2px solid #111827;margin:0 0 24px;}
    .bill-to{margin-bottom:28px;padding:16px;background:#f9fafb;border-radius:8px;}
    .bill-to-label{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;font-weight:700;margin-bottom:8px;}
    .client-name{font-size:15px;font-weight:600;}
    .client-details{font-size:11px;color:#6b7280;margin-top:4px;line-height:1.6;}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;}
    th{font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:700;border-bottom:2px solid #e5e7eb;padding:10px 8px;text-align:left;}
    th:not(:nth-child(2)){text-align:right;width:90px;}
    td{font-size:13px;padding:12px 8px;border-bottom:1px solid #f3f4f6;color:#1f2937;}
    td:not(:nth-child(2)){text-align:right;}
    .totals{margin-left:auto;width:260px;}
    .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;}
    .total-final{border-top:2px solid #111827;margin-top:8px;padding-top:10px;font-weight:700;font-size:16px;}
    .notes{margin-top:28px;padding-top:16px;border-top:1px solid #e5e7eb;}
    .section-label{font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:700;margin-bottom:6px;}
    .footer{margin-top:32px;text-align:center;font-size:10px;color:#9ca3af;}
  </style></head><body>
  <div class="header">
    <div>
      <div class="company-name">${profile?.company_name || "Your Company"}</div>
      <div class="company-details">
        ${profile?.company_address ? profile.company_address + "<br>" : ""}
        ${profile?.email ? profile.email + "<br>" : ""}
        ${profile?.phone ? profile.phone + "<br>" : ""}
        ${profile?.gst_id ? "GSTIN: " + profile.gst_id : ""}
      </div>
    </div>
    <div class="invoice-right">
      <div class="invoice-title">${document.type === "quotation" ? "Quotation" : "Invoice"}</div>
      <div class="invoice-meta"># ${document.number || "DRAFT"}</div>
      <div class="invoice-meta">Date: ${new Date(document.issue_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
      ${document.due_date ? `<div class="invoice-meta">Due: ${new Date(document.due_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>` : ""}
    </div>
  </div>
  <hr class="divider">
  <div class="bill-to">
    <div class="bill-to-label">Bill To</div>
    <div class="client-name">${document.client_name || "Client"}</div>
    <div class="client-details">
      ${document.client_email ? document.client_email + "<br>" : ""}
      ${document.client_phone ? document.client_phone + "<br>" : ""}
      ${document.client_address || ""}
    </div>
  </div>
  <table>
    <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
    <tbody>
      ${lineItems.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.description || ""}</td>
        <td>${item.quantity}</td>
        <td>${currencySymbol}${item.rate.toFixed(2)}</td>
        <td>${currencySymbol}${(item.quantity * item.rate).toFixed(2)}</td>
      </tr>`).join("")}
    </tbody>
  </table>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>${currencySymbol}${subtotal.toFixed(2)}</span></div>
    ${document.tax_rate ? `<div class="total-row"><span>Tax (${document.tax_rate}%)</span><span>${currencySymbol}${taxAmount.toFixed(2)}</span></div>` : ""}
    ${discount > 0 ? `<div class="total-row" style="color:#dc2626;"><span>Discount</span><span>-${currencySymbol}${discount.toFixed(2)}</span></div>` : ""}
    <div class="total-row total-final"><span>Total</span><span>${currencySymbol}${total.toFixed(2)}</span></div>
  </div>
  ${paymentSection(profile, total)}
  ${document.notes ? `<div class="notes"><div class="section-label">Notes</div><div style="font-size:12px;color:#6b7280;">${document.notes}</div></div>` : ""}
  <div class="footer">Thank you for your business!</div>
</body></html>`
}

// ─── MODERN TEMPLATE ─────────────────────────────────────────────────────────
function generateModern(document: Document & { line_items: LineItem[] }, profile: any): string {
  const { lineItems, subtotal, taxAmount, discount, total, currencySymbol } = calcTotals(document)

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;background:#fff;max-width:794px;margin:0 auto;line-height:1.5;}
    .top-bar{background:#1f2937;color:#fff;padding:32px 40px;display:flex;justify-content:space-between;align-items:flex-start;}
    .company-name{font-size:20px;font-weight:700;margin-bottom:6px;}
    .company-details{font-size:11px;color:#9ca3af;line-height:1.7;}
    .invoice-right{text-align:right;}
    .invoice-title{font-size:28px;font-weight:800;letter-spacing:-.5px;text-transform:uppercase;color:#fff;}
    .invoice-meta{font-size:11px;color:#9ca3af;margin-top:4px;}
    .body-pad{padding:32px 40px;}
    .bill-to{margin-bottom:28px;padding:16px;background:#f8fafc;border-left:4px solid #1f2937;border-radius:0 6px 6px 0;}
    .bill-to-label{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;font-weight:700;margin-bottom:8px;}
    .client-name{font-size:15px;font-weight:600;}
    .client-details{font-size:11px;color:#6b7280;margin-top:4px;line-height:1.6;}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;}
    thead{background:#f8fafc;}
    th{font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:700;padding:12px;text-align:left;border-bottom:2px solid #e5e7eb;}
    th:not(:nth-child(2)){text-align:right;width:90px;}
    td{font-size:13px;padding:12px;border-bottom:1px solid #f3f4f6;color:#1f2937;}
    td:not(:nth-child(2)){text-align:right;}
    .totals{margin-left:auto;width:260px;}
    .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;}
    .total-final{background:#1f2937;color:#fff;margin-top:8px;padding:12px;border-radius:6px;font-weight:700;font-size:15px;}
    .notes{margin-top:28px;padding:16px;background:#f8fafc;border-radius:6px;}
    .section-label{font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:700;margin-bottom:6px;}
    .footer{margin-top:32px;text-align:center;font-size:10px;color:#9ca3af;}
  </style></head><body>
  <div class="top-bar">
    <div>
      <div class="company-name">${profile?.company_name || "Your Company"}</div>
      <div class="company-details">
        ${profile?.company_address ? profile.company_address + "<br>" : ""}
        ${profile?.email ? profile.email + "<br>" : ""}
        ${profile?.phone ? profile.phone + "<br>" : ""}
        ${profile?.gst_id ? "GSTIN: " + profile.gst_id : ""}
      </div>
    </div>
    <div class="invoice-right">
      <div class="invoice-title">${document.type === "quotation" ? "Quotation" : "Invoice"}</div>
      <div class="invoice-meta"># ${document.number || "DRAFT"}</div>
      <div class="invoice-meta">Date: ${new Date(document.issue_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
      ${document.due_date ? `<div class="invoice-meta">Due: ${new Date(document.due_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>` : ""}
    </div>
  </div>
  <div class="body-pad">
    <div class="bill-to">
      <div class="bill-to-label">Bill To</div>
      <div class="client-name">${document.client_name || "Client"}</div>
      <div class="client-details">
        ${document.client_email ? document.client_email + "<br>" : ""}
        ${document.client_phone ? document.client_phone + "<br>" : ""}
        ${document.client_address || ""}
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>
        ${lineItems.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.description || ""}</td>
          <td>${item.quantity}</td>
          <td>${currencySymbol}${item.rate.toFixed(2)}</td>
          <td>${currencySymbol}${(item.quantity * item.rate).toFixed(2)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>${currencySymbol}${subtotal.toFixed(2)}</span></div>
      ${document.tax_rate ? `<div class="total-row"><span>Tax (${document.tax_rate}%)</span><span>${currencySymbol}${taxAmount.toFixed(2)}</span></div>` : ""}
      ${discount > 0 ? `<div class="total-row" style="color:#dc2626;"><span>Discount</span><span>-${currencySymbol}${discount.toFixed(2)}</span></div>` : ""}
      <div class="total-row total-final"><span>Total</span><span>${currencySymbol}${total.toFixed(2)}</span></div>
    </div>
    ${paymentSection(profile, total)}
    ${document.notes ? `<div class="notes"><div class="section-label">Notes</div><div style="font-size:12px;color:#6b7280;">${document.notes}</div></div>` : ""}
    <div class="footer">Thank you for your business!</div>
  </div>
</body></html>`
}

// ─── MINIMAL TEMPLATE ────────────────────────────────────────────────────────
function generateMinimal(document: Document & { line_items: LineItem[] }, profile: any): string {
  const { lineItems, subtotal, taxAmount, discount, total, currencySymbol } = calcTotals(document)

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Georgia',serif;color:#1a1a1a;background:#fff;padding:48px;max-width:794px;margin:0 auto;line-height:1.6;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;}
    .company-name{font-size:22px;font-weight:700;letter-spacing:-.3px;margin-bottom:8px;}
    .company-details{font-size:11px;color:#666;line-height:1.8;}
    .invoice-right{text-align:right;}
    .invoice-title{font-size:13px;text-transform:uppercase;letter-spacing:.15em;color:#999;font-family:-apple-system,sans-serif;margin-bottom:6px;}
    .invoice-number{font-size:22px;font-weight:700;}
    .invoice-meta{font-size:11px;color:#666;margin-top:4px;}
    .thin-line{border:none;border-top:1px solid #ddd;margin:0 0 32px;}
    .two-col{display:flex;justify-content:space-between;margin-bottom:36px;}
    .bill-to-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#999;font-family:-apple-system,sans-serif;margin-bottom:8px;}
    .client-name{font-size:15px;font-weight:700;}
    .client-details{font-size:11px;color:#666;margin-top:4px;line-height:1.6;}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;}
    th{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#999;font-family:-apple-system,sans-serif;font-weight:400;border-bottom:1px solid #ddd;padding:10px 0;text-align:left;}
    th:not(:nth-child(2)){text-align:right;width:90px;}
    td{font-size:13px;padding:12px 0;border-bottom:1px solid #f0f0f0;color:#1a1a1a;}
    td:not(:nth-child(2)){text-align:right;}
    .totals{margin-left:auto;width:240px;}
    .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#555;}
    .total-final{border-top:1px solid #1a1a1a;margin-top:8px;padding-top:10px;font-weight:700;font-size:16px;color:#1a1a1a;}
    .notes{margin-top:32px;padding-top:16px;border-top:1px solid #ddd;}
    .section-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#999;font-family:-apple-system,sans-serif;margin-bottom:8px;}
    .footer{margin-top:48px;text-align:center;font-size:10px;color:#bbb;font-family:-apple-system,sans-serif;}
  </style></head><body>
  <div class="header">
    <div>
      <div class="company-name">${profile?.company_name || "Your Company"}</div>
      <div class="company-details">
        ${profile?.company_address ? profile.company_address + "<br>" : ""}
        ${profile?.email ? profile.email + "<br>" : ""}
        ${profile?.phone ? profile.phone + "<br>" : ""}
        ${profile?.gst_id ? "GSTIN: " + profile.gst_id : ""}
      </div>
    </div>
    <div class="invoice-right">
      <div class="invoice-title">${document.type === "quotation" ? "Quotation" : "Invoice"}</div>
      <div class="invoice-number">${document.number || "DRAFT"}</div>
      <div class="invoice-meta">${new Date(document.issue_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
      ${document.due_date ? `<div class="invoice-meta">Due ${new Date(document.due_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>` : ""}
    </div>
  </div>
  <hr class="thin-line">
  <div class="two-col">
    <div>
      <div class="bill-to-label">Billed To</div>
      <div class="client-name">${document.client_name || "Client"}</div>
      <div class="client-details">
        ${document.client_email ? document.client_email + "<br>" : ""}
        ${document.client_phone ? document.client_phone + "<br>" : ""}
        ${document.client_address || ""}
      </div>
    </div>
  </div>
  <table>
    <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
    <tbody>
      ${lineItems.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.description || ""}</td>
        <td>${item.quantity}</td>
        <td>${currencySymbol}${item.rate.toFixed(2)}</td>
        <td>${currencySymbol}${(item.quantity * item.rate).toFixed(2)}</td>
      </tr>`).join("")}
    </tbody>
  </table>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>${currencySymbol}${subtotal.toFixed(2)}</span></div>
    ${document.tax_rate ? `<div class="total-row"><span>Tax (${document.tax_rate}%)</span><span>${currencySymbol}${taxAmount.toFixed(2)}</span></div>` : ""}
    ${discount > 0 ? `<div class="total-row" style="color:#dc2626;"><span>Discount</span><span>-${currencySymbol}${discount.toFixed(2)}</span></div>` : ""}
    <div class="total-row total-final"><span>Total</span><span>${currencySymbol}${total.toFixed(2)}</span></div>
  </div>
  ${paymentSection(profile, total)}
  ${document.notes ? `<div class="notes"><div class="section-label">Notes</div><div style="font-size:12px;color:#666;">${document.notes}</div></div>` : ""}
  <div class="footer">Thank you for your business!</div>
</body></html>`
}

// ─── BRANDED TEMPLATE (Pro) ───────────────────────────────────────────────────
function generateBranded(document: Document & { line_items: LineItem[] }, profile: any): string {
  const { lineItems, subtotal, taxAmount, discount, total, currencySymbol } = calcTotals(document)

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;background:#fff;max-width:794px;margin:0 auto;line-height:1.5;}
    .accent{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:36px 40px;}
    .accent-top{display:flex;justify-content:space-between;align-items:flex-start;}
    .company-name{font-size:22px;font-weight:800;margin-bottom:6px;}
    .company-details{font-size:11px;color:#c7d2fe;line-height:1.7;}
    .invoice-right{text-align:right;}
    .invoice-title{font-size:30px;font-weight:800;text-transform:uppercase;letter-spacing:-1px;}
    .invoice-meta{font-size:11px;color:#c7d2fe;margin-top:4px;}
    .body-pad{padding:32px 40px;}
    .bill-to{margin-bottom:28px;display:flex;gap:32px;}
    .bill-to-block{flex:1;}
    .bill-to-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#6b7280;font-weight:700;margin-bottom:8px;}
    .client-name{font-size:15px;font-weight:600;}
    .client-details{font-size:11px;color:#6b7280;margin-top:4px;line-height:1.6;}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;}
    thead tr{background:#f5f3ff;}
    th{font-size:10px;text-transform:uppercase;color:#7c3aed;font-weight:700;padding:12px;text-align:left;border-bottom:2px solid #e0e7ff;}
    th:not(:nth-child(2)){text-align:right;width:90px;}
    td{font-size:13px;padding:12px;border-bottom:1px solid #f3f4f6;}
    td:not(:nth-child(2)){text-align:right;}
    .totals{margin-left:auto;width:260px;}
    .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;}
    .total-final{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;margin-top:8px;padding:12px;border-radius:8px;font-weight:700;font-size:15px;}
    .notes{margin-top:28px;padding:16px;background:#f5f3ff;border-radius:8px;border-left:4px solid #7c3aed;}
    .section-label{font-size:10px;text-transform:uppercase;color:#7c3aed;font-weight:700;margin-bottom:6px;}
    .footer{margin-top:32px;text-align:center;font-size:10px;color:#9ca3af;}
  </style></head><body>
  <div class="accent">
    <div class="accent-top">
      <div>
        <div class="company-name">${profile?.company_name || "Your Company"}</div>
        <div class="company-details">
          ${profile?.company_address ? profile.company_address + "<br>" : ""}
          ${profile?.email ? profile.email + "<br>" : ""}
          ${profile?.phone ? profile.phone + "<br>" : ""}
          ${profile?.gst_id ? "GSTIN: " + profile.gst_id : ""}
        </div>
      </div>
      <div class="invoice-right">
        <div class="invoice-title">${document.type === "quotation" ? "Quotation" : "Invoice"}</div>
        <div class="invoice-meta"># ${document.number || "DRAFT"}</div>
        <div class="invoice-meta">${new Date(document.issue_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
        ${document.due_date ? `<div class="invoice-meta">Due ${new Date(document.due_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>` : ""}
      </div>
    </div>
  </div>
  <div class="body-pad">
    <div class="bill-to">
      <div class="bill-to-block">
        <div class="bill-to-label">Bill To</div>
        <div class="client-name">${document.client_name || "Client"}</div>
        <div class="client-details">
          ${document.client_email ? document.client_email + "<br>" : ""}
          ${document.client_phone ? document.client_phone + "<br>" : ""}
          ${document.client_address || ""}
        </div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>
        ${lineItems.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.description || ""}</td>
          <td>${item.quantity}</td>
          <td>${currencySymbol}${item.rate.toFixed(2)}</td>
          <td>${currencySymbol}${(item.quantity * item.rate).toFixed(2)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>${currencySymbol}${subtotal.toFixed(2)}</span></div>
      ${document.tax_rate ? `<div class="total-row"><span>Tax (${document.tax_rate}%)</span><span>${currencySymbol}${taxAmount.toFixed(2)}</span></div>` : ""}
      ${discount > 0 ? `<div class="total-row" style="color:#dc2626;"><span>Discount</span><span>-${currencySymbol}${discount.toFixed(2)}</span></div>` : ""}
      <div class="total-row total-final"><span>Total</span><span>${currencySymbol}${total.toFixed(2)}</span></div>
    </div>
    ${paymentSection(profile, total)}
    ${document.notes ? `<div class="notes"><div class="section-label">Notes</div><div style="font-size:12px;color:#4b5563;">${document.notes}</div></div>` : ""}
    <div class="footer">Thank you for your business!</div>
  </div>
</body></html>`
}

// ─── EXECUTIVE TEMPLATE (Pro) ─────────────────────────────────────────────────
function generateExecutive(document: Document & { line_items: LineItem[] }, profile: any): string {
  const { lineItems, subtotal, taxAmount, discount, total, currencySymbol } = calcTotals(document)

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;background:#fff;max-width:794px;margin:0 auto;line-height:1.5;}
    .sidebar-layout{display:flex;min-height:100vh;}
    .sidebar{background:#0f172a;color:#fff;width:220px;flex-shrink:0;padding:36px 24px;display:flex;flex-direction:column;gap:32px;}
    .company-name{font-size:16px;font-weight:700;line-height:1.3;margin-bottom:8px;}
    .company-details{font-size:10px;color:#94a3b8;line-height:1.8;}
    .sidebar-meta-label{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#64748b;font-weight:600;margin-bottom:6px;}
    .sidebar-meta-value{font-size:12px;color:#e2e8f0;}
    .main{flex:1;padding:36px 32px;}
    .invoice-title{font-size:28px;font-weight:800;text-transform:uppercase;color:#0f172a;letter-spacing:-1px;margin-bottom:4px;}
    .invoice-number{font-size:13px;color:#64748b;margin-bottom:32px;}
    .bill-to-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;margin-bottom:8px;}
    .client-name{font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px;}
    .client-details{font-size:11px;color:#6b7280;line-height:1.6;}
    table{width:100%;border-collapse:collapse;margin:24px 0;}
    th{font-size:10px;text-transform:uppercase;color:#64748b;font-weight:700;border-top:2px solid #0f172a;border-bottom:1px solid #e5e7eb;padding:10px 0;text-align:left;}
    th:not(:nth-child(2)){text-align:right;width:90px;}
    td{font-size:12px;padding:11px 0;border-bottom:1px solid #f1f5f9;}
    td:not(:nth-child(2)){text-align:right;}
    .totals{margin-left:auto;width:220px;border-top:2px solid #0f172a;padding-top:12px;}
    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#64748b;}
    .total-final{display:flex;justify-content:space-between;margin-top:8px;font-size:16px;font-weight:800;color:#0f172a;}
    .notes{margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;}
    .section-label{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#64748b;font-weight:700;margin-bottom:6px;}
    .footer{margin-top:32px;font-size:10px;color:#94a3b8;}
  </style></head><body>
  <div class="sidebar-layout">
    <div class="sidebar">
      <div>
        <div class="company-name">${profile?.company_name || "Your Company"}</div>
        <div class="company-details">
          ${profile?.company_address ? profile.company_address + "<br>" : ""}
          ${profile?.email ? profile.email + "<br>" : ""}
          ${profile?.phone ? profile.phone + "<br>" : ""}
          ${profile?.gst_id ? "GSTIN: " + profile.gst_id : ""}
        </div>
      </div>
      <div>
        <div class="sidebar-meta-label">Invoice No.</div>
        <div class="sidebar-meta-value">${document.number || "DRAFT"}</div>
      </div>
      <div>
        <div class="sidebar-meta-label">Issue Date</div>
        <div class="sidebar-meta-value">${new Date(document.issue_date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</div>
      </div>
      ${document.due_date ? `
      <div>
        <div class="sidebar-meta-label">Due Date</div>
        <div class="sidebar-meta-value">${new Date(document.due_date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</div>
      </div>` : ""}
      <div>
        <div class="sidebar-meta-label">Amount Due</div>
        <div style="font-size:20px;font-weight:800;color:#fff;">${currencySymbol}${total.toFixed(2)}</div>
      </div>
    </div>
    <div class="main">
      <div class="invoice-title">${document.type === "quotation" ? "Quotation" : "Invoice"}</div>
      <div class="invoice-number"># ${document.number || "DRAFT"}</div>
      <div class="bill-to-label">Bill To</div>
      <div class="client-name">${document.client_name || "Client"}</div>
      <div class="client-details">
        ${document.client_email ? document.client_email + "<br>" : ""}
        ${document.client_phone ? document.client_phone + "<br>" : ""}
        ${document.client_address || ""}
      </div>
      <table>
        <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
        <tbody>
          ${lineItems.map((item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${item.description || ""}</td>
            <td>${item.quantity}</td>
            <td>${currencySymbol}${item.rate.toFixed(2)}</td>
            <td>${currencySymbol}${(item.quantity * item.rate).toFixed(2)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      <div class="totals">
        ${document.tax_rate ? `<div class="total-row"><span>Tax (${document.tax_rate}%)</span><span>${currencySymbol}${taxAmount.toFixed(2)}</span></div>` : ""}
        ${discount > 0 ? `<div class="total-row" style="color:#dc2626;"><span>Discount</span><span>-${currencySymbol}${discount.toFixed(2)}</span></div>` : ""}
        <div class="total-final"><span>Total Due</span><span>${currencySymbol}${total.toFixed(2)}</span></div>
      </div>
      ${paymentSection(profile, total)}
      ${document.notes ? `<div class="notes"><div class="section-label">Notes</div><div style="font-size:11px;color:#6b7280;">${document.notes}</div></div>` : ""}
      <div class="footer">Thank you for your business!</div>
    </div>
  </div>
</body></html>`
}

// ─── TEMPLATE REGISTRY ────────────────────────────────────────────────────────
export const PDF_TEMPLATES: PDFTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean, professional layout with a bold header",
    isPro: false,
    thumbnail: "",
    generate: generateClassic,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Dark header bar with a contemporary feel",
    isPro: false,
    thumbnail: "",
    generate: generateModern,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Elegant serif typography, understated elegance",
    isPro: false,
    thumbnail: "",
    generate: generateMinimal,
  },
  {
    id: "branded",
    name: "Branded",
    description: "Bold indigo gradient accent, vibrant and modern",
    isPro: true,
    thumbnail: "",
    generate: generateBranded,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Dark sidebar layout for a premium executive look",
    isPro: true,
    thumbnail: "",
    generate: generateExecutive,
  },
]

export function getTemplate(id: TemplateId): PDFTemplate {
  return PDF_TEMPLATES.find((t) => t.id === id) ?? PDF_TEMPLATES[0]
}
