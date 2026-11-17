import { escapeHtml, safeHttpUrl } from "./escape-html"
import { amountInWords, formatDate, formatMoney, type TemplateProfile } from "./generate-document-html"
import { refundMethodLabel } from "./refund-methods"

/**
 * Print-ready A4 HTML for a refund note (rendered to PDF for download and email).
 * Every user-supplied string is HTML-escaped before it reaches the markup.
 */

export interface RefundNoteForHtml {
  number: string
  amount: number
  reason: string
  method: string | null
  reference: string | null
  refunded_at: string
}

export interface RefundInvoiceForHtml {
  number: string
  issue_date: string | null
  currency: string
  grand_total: number
  client_name: string | null
  client_email: string | null
  client_address: string | null
  client_gst_id: string | null
}

export interface RefundTotals {
  /** Sum of payments recorded on the invoice. */
  paid: number
  /** Sum of every refund on the invoice, this one included. */
  refunded: number
}

const FONT_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
const ACCENT = "#635bff"

export function refundNoteFileName(number: string): string {
  return `Refund-Note-${String(number || "draft").replace(/[^A-Za-z0-9._-]+/g, "-")}.pdf`
}

function multiline(value: string | null | undefined): string {
  return escapeHtml(value ?? "").replace(/\r?\n/g, "<br>")
}

export function generateRefundNoteHTML(
  refund: RefundNoteForHtml,
  invoice: RefundInvoiceForHtml,
  totals: RefundTotals,
  profile: TemplateProfile | null | undefined
): string {
  const p = profile ?? {}
  const money = (value: number) => escapeHtml(formatMoney(value, invoice.currency))
  const logo = safeHttpUrl(p.logo_url)
  const company = (p.company_name || "").trim()
  const method = refundMethodLabel(refund.method)
  const netReceived = Math.max(0, totals.paid - totals.refunded)

  const senderLines = [
    p.company_address ? multiline(p.company_address) : "",
    p.gst_id ? `GSTIN: ${escapeHtml(p.gst_id)}` : "",
    [p.email, p.phone].filter(Boolean).map((v) => escapeHtml(v)).join(" &middot; "),
  ].filter(Boolean)

  const clientLines = [
    invoice.client_address ? multiline(invoice.client_address) : "",
    invoice.client_email ? escapeHtml(invoice.client_email) : "",
    invoice.client_gst_id ? `GSTIN: ${escapeHtml(invoice.client_gst_id)}` : "",
  ].filter(Boolean)

  const meta: [string, string][] = [
    ["Refund note no.", escapeHtml(refund.number)],
    ["Refund date", escapeHtml(formatDate(refund.refunded_at, "long"))],
    ["Against invoice", escapeHtml(invoice.number)],
    ...(invoice.issue_date ? [["Invoice date", escapeHtml(formatDate(invoice.issue_date, "long"))] as [string, string]] : []),
  ]

  const summary: [string, string][] = [
    ["Invoice total", money(invoice.grand_total)],
    ["Amount paid", money(totals.paid)],
    ["Total refunded", money(totals.refunded)],
    ["Net received", money(netReceived)],
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Refund note ${escapeHtml(refund.number)}</title>
<link rel="stylesheet" href="${FONT_URL}">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Inter, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: #111827; font-size: 13px; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { padding: 48px 52px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; padding-bottom: 24px; border-bottom: 3px solid ${ACCENT}; }
  .brand img { max-height: 56px; max-width: 180px; display: block; margin-bottom: 10px; }
  .company { font-size: 18px; font-weight: 700; }
  .muted { color: #6b7280; }
  .title { text-align: right; }
  .title h1 { margin: 0; font-size: 26px; letter-spacing: 1px; text-transform: uppercase; color: ${ACCENT}; }
  .title .amount { margin-top: 6px; font-size: 20px; font-weight: 700; }
  .grid { display: flex; justify-content: space-between; gap: 32px; margin: 28px 0; }
  .label { font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; }
  .meta td { padding: 2px 0; }
  .meta td:first-child { color: #6b7280; padding-right: 24px; }
  .meta td:last-child { text-align: right; font-weight: 500; }
  table.items { width: 100%; border-collapse: collapse; margin-top: 8px; }
  table.items th { text-align: left; font-size: 11px; letter-spacing: 0.6px; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding: 10px 8px; }
  table.items td { padding: 14px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  table.items .right { text-align: right; }
  .bottom { display: flex; justify-content: space-between; gap: 32px; margin-top: 24px; }
  .words { max-width: 55%; }
  .summary { min-width: 260px; border-collapse: collapse; }
  .summary td { padding: 4px 0; }
  .summary td:last-child { text-align: right; }
  .summary .refund td { border-top: 2px solid #111827; padding-top: 10px; font-size: 16px; font-weight: 700; }
  .foot { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
</style>
</head>
<body>
<div class="page">
  <div class="head">
    <div class="brand">
      ${logo ? `<img src="${escapeHtml(logo)}" alt="">` : ""}
      ${company ? `<div class="company">${escapeHtml(company)}</div>` : ""}
      ${senderLines.map((line) => `<div class="muted">${line}</div>`).join("")}
    </div>
    <div class="title">
      <h1>Refund note</h1>
      <div class="amount">${money(refund.amount)}</div>
      <div class="muted">refunded on ${escapeHtml(formatDate(refund.refunded_at, "long"))}</div>
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="label">Refunded to</div>
      <div style="font-weight:600;">${escapeHtml(invoice.client_name || "Client")}</div>
      ${clientLines.map((line) => `<div class="muted">${line}</div>`).join("")}
    </div>
    <table class="meta">
      ${meta.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
    </table>
  </div>

  <table class="items">
    <thead>
      <tr><th>Description</th><th>Method</th><th>Reference</th><th class="right">Amount</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Refund against invoice ${escapeHtml(invoice.number)}<div class="muted">${multiline(refund.reason)}</div></td>
        <td>${escapeHtml(method || "-")}</td>
        <td>${escapeHtml(refund.reference || "-")}</td>
        <td class="right" style="font-weight:600;">${money(refund.amount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="bottom">
    <div class="words">
      <div class="label">Amount refunded in words</div>
      <div>${amountInWords(refund.amount, invoice.currency)}</div>
    </div>
    <table class="summary">
      ${summary.map(([k, v]) => `<tr><td class="muted">${k}</td><td>${v}</td></tr>`).join("")}
      <tr class="refund"><td>This refund</td><td>${money(refund.amount)}</td></tr>
    </table>
  </div>

  <div class="foot">
    This refund note confirms that ${money(refund.amount)} has been returned to ${escapeHtml(invoice.client_name || "the client")} against invoice ${escapeHtml(invoice.number)}.${company ? ` Issued by ${escapeHtml(company)}.` : ""}
  </div>
</div>
</body>
</html>`
}
