import { escapeHtml } from "@/lib/escape-html"

/**
 * Minimal, deliverability-friendly transactional emails.
 *
 * The emails intentionally carry only the essentials (who, what, how much, when,
 * where to view it). The full document travels as the attached PDF, so the
 * message body stays short and renders consistently across mail clients.
 */

export interface EmailContent {
  subject: string
  html: string
  text: string
}

interface Sender {
  companyName: string
  email?: string | null
  phone?: string | null
}

interface BaseEmailInput {
  sender: Sender
  clientName?: string | null
  /** Whether the PDF is attached to the message. */
  hasAttachment: boolean
}

export interface DocumentEmailInput extends BaseEmailInput {
  kind: "invoice" | "quotation"
  number: string
  amount: string
  /** e.g. "Due 4 November 2026" or "Valid until 20 November 2026" */
  dateLine?: string | null
  /** Personal note written by the sender (plain text). */
  message?: string | null
}

export interface ReminderEmailInput extends BaseEmailInput {
  number: string
  amountDue: string
  amountPaid?: string | null
  dueDateLabel?: string | null
  daysOverdue: number
}

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

function nl2br(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>")
}

/** Ends a sentence with a period unless it already ends with punctuation (e.g. "Pvt. Ltd."). */
function sentence(text: string): string {
  return /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`
}

interface LayoutInput {
  preheader: string
  heading: string
  paragraphs: string[]
  summary: { label: string; value: string; accent?: boolean }[]
  footnote?: string | null
  sender: Sender
}

function layout(input: LayoutInput): string {
  const company = escapeHtml(input.sender.companyName)
  const contact = [input.sender.email, input.sender.phone]
    .filter(Boolean)
    .map((v) => escapeHtml(String(v)))
    .join(" &middot; ")

  const summaryRows = input.summary
    .map(
      (row) => `
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:14px;">${row.label}</td>
          <td style="padding:6px 0;color:${row.accent ? "#111827" : "#111827"};font-size:${row.accent ? "18px" : "14px"};font-weight:${row.accent ? "700" : "500"};text-align:right;">${row.value}</td>
        </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:${FONT_STACK};color:#111827;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
        <tr>
          <td style="padding:28px 32px 8px;">
            <p style="margin:0 0 16px;font-size:13px;font-weight:600;letter-spacing:0.4px;text-transform:uppercase;color:#6b7280;">${company}</p>
            <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:700;color:#111827;">${escapeHtml(input.heading)}</h1>
            ${input.paragraphs
              .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;">${p}</p>`)
              .join("")}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 8px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
              <tr><td style="padding:6px 0 0;"></td></tr>
              ${summaryRows}
              <tr><td style="padding:0 0 6px;"></td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 28px;">
            ${input.footnote ? `<p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#6b7280;">${input.footnote}</p>` : ""}
            <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">Thanks,<br><strong>${company}</strong></p>
            ${contact ? `<p style="margin:6px 0 0;font-size:12px;line-height:1.6;color:#9ca3af;">${contact}</p>` : ""}
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;">Sent with Infinity Invoices</p>
    </td>
  </tr>
</table>
</body>
</html>`
}

function textLayout(parts: { heading: string; lines: string[]; summary: [string, string][]; footnote?: string | null; sender: Sender }): string {
  const contact = [parts.sender.email, parts.sender.phone].filter(Boolean).join(" · ")
  return [
    parts.heading,
    "",
    ...parts.lines,
    "",
    ...parts.summary.map(([k, v]) => `${k}: ${v}`),
    "",
    parts.footnote ?? "",
    "",
    "Thanks,",
    parts.sender.companyName,
    contact,
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")
    .trim()
}

export function buildDocumentEmail(input: DocumentEmailInput): EmailContent {
  const label = input.kind === "quotation" ? "Quotation" : "Invoice"
  const heading = `${label} ${input.number}`
  const greeting = `Hi ${escapeHtml(input.clientName || "there")},`
  const intro = sentence(
    `Please find ${input.hasAttachment ? "attached" : "below"} ${label.toLowerCase()} <strong>${escapeHtml(input.number)}</strong> from ${escapeHtml(input.sender.companyName)}`
  )

  const paragraphs = [greeting, intro]
  if (input.message?.trim()) {
    paragraphs.push(
      `<span style="display:block;padding:12px 14px;background:#f9fafb;border-left:3px solid #d1d5db;border-radius:6px;color:#374151;">${nl2br(input.message.trim())}</span>`
    )
  }

  const summary = [
    { label: `${label} number`, value: escapeHtml(input.number) },
    ...(input.dateLine ? [{ label: input.kind === "quotation" ? "Valid until" : "Due date", value: escapeHtml(input.dateLine) }] : []),
    { label: input.kind === "quotation" ? "Quoted total" : "Amount due", value: escapeHtml(input.amount), accent: true },
  ]

  const footnote = input.hasAttachment
    ? `The ${label.toLowerCase()} is attached as a PDF.`
    : `Reply to this email if you need a copy of the ${label.toLowerCase()}.`

  const html = layout({
    preheader: `${label} ${input.number} for ${input.amount}${input.dateLine ? ` · ${input.dateLine}` : ""}`,
    heading,
    paragraphs,
    summary,
    footnote,
    sender: input.sender,
  })

  const text = textLayout({
    heading,
    lines: [
      `Hi ${input.clientName || "there"},`,
      "",
      sentence(`Please find ${input.hasAttachment ? "attached" : "below"} ${label.toLowerCase()} ${input.number} from ${input.sender.companyName}`),
      ...(input.message?.trim() ? ["", input.message.trim()] : []),
    ],
    summary: [
      [`${label} number`, input.number],
      ...(input.dateLine ? [[input.kind === "quotation" ? "Valid until" : "Due date", input.dateLine] as [string, string]] : []),
      [input.kind === "quotation" ? "Quoted total" : "Amount due", input.amount],
    ],
    footnote,
    sender: input.sender,
  })

  return {
    subject: `${label} ${input.number} from ${input.sender.companyName}`,
    html,
    text,
  }
}

export function buildReminderEmail(input: ReminderEmailInput): EmailContent {
  const overdue = input.daysOverdue > 0
  const heading = overdue ? `Payment overdue: Invoice ${input.number}` : `Payment reminder: Invoice ${input.number}`
  const statusLine = overdue
    ? `Invoice <strong>${escapeHtml(input.number)}</strong> is now <strong>${input.daysOverdue} day${input.daysOverdue === 1 ? "" : "s"} overdue</strong>.`
    : `This is a friendly reminder that invoice <strong>${escapeHtml(input.number)}</strong> is due${input.dueDateLabel ? ` on <strong>${escapeHtml(input.dueDateLabel)}</strong>` : " soon"}.`

  const summary = [
    { label: "Invoice number", value: escapeHtml(input.number) },
    ...(input.dueDateLabel ? [{ label: "Due date", value: escapeHtml(input.dueDateLabel) }] : []),
    ...(input.amountPaid ? [{ label: "Paid so far", value: escapeHtml(input.amountPaid) }] : []),
    { label: "Amount due", value: escapeHtml(input.amountDue), accent: true },
  ]

  const html = layout({
    preheader: `${overdue ? "Overdue" : "Reminder"}: Invoice ${input.number}, ${input.amountDue} due`,
    heading,
    paragraphs: [`Hi ${escapeHtml(input.clientName || "there")},`, statusLine],
    summary,
    footnote: `${input.hasAttachment ? "A copy of the invoice is attached as a PDF. " : ""}If you have already made this payment, please disregard this message.`,
    sender: input.sender,
  })

  const text = textLayout({
    heading,
    lines: [
      `Hi ${input.clientName || "there"},`,
      "",
      overdue
        ? `Invoice ${input.number} is now ${input.daysOverdue} day${input.daysOverdue === 1 ? "" : "s"} overdue.`
        : `This is a friendly reminder that invoice ${input.number} is due${input.dueDateLabel ? ` on ${input.dueDateLabel}` : " soon"}.`,
    ],
    summary: [
      ["Invoice number", input.number],
      ...(input.dueDateLabel ? [["Due date", input.dueDateLabel] as [string, string]] : []),
      ...(input.amountPaid ? [["Paid so far", input.amountPaid] as [string, string]] : []),
      ["Amount due", input.amountDue],
    ],
    footnote: `${input.hasAttachment ? "A copy of the invoice is attached as a PDF. " : ""}If you have already made this payment, please disregard this message.`,
    sender: input.sender,
  })

  return {
    subject: `${overdue ? "Overdue" : "Reminder"}: Invoice ${input.number} · ${input.amountDue} due`,
    html,
    text,
  }
}
