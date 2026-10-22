import { CURRENCIES, type Document, type LineItem, type PaymentMethodType } from "./types"
import { escapeHtml, safeHttpUrl } from "./escape-html"

/**
 * Print-ready HTML generator for invoices and quotations.
 *
 * Every template shares the same page shell:
 *  - A4 with zero @page margins so full-bleed designs work.
 *  - A table-based shell whose <thead>/<tfoot> spacer rows repeat on every
 *    printed page, giving consistent top/bottom breathing room on multi-page
 *    documents without clipping backgrounds.
 *  - `position: fixed` decorations (sidebars, frames) repeat on each page.
 *  - Line-item rows never split across pages and the table header repeats.
 *
 * All user-supplied strings are HTML-escaped before they reach the markup.
 */

export type TemplateType = "classic" | "minimal" | "tax" | "dark" | "executive" | "bold"

export const TEMPLATE_TYPES: readonly TemplateType[] = [
  "classic",
  "minimal",
  "tax",
  "dark",
  "executive",
  "bold",
] as const

export function isTemplateType(value: unknown): value is TemplateType {
  return typeof value === "string" && (TEMPLATE_TYPES as readonly string[]).includes(value)
}

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

/** The two colours a template is built from. Both are 6-digit lowercase hex. */
export interface TemplateColors {
  /** Dominant colour: headers, bands, sidebars, table heads, totals. */
  primary: string
  /** Highlight colour: rules, due dates, balance due, markers. */
  accent: string
}

export const TEMPLATE_DEFAULT_COLORS: Record<TemplateType, TemplateColors> = {
  classic: { primary: "#111827", accent: "#b45309" },
  minimal: { primary: "#1a1a1a", accent: "#8a8a80" },
  tax: { primary: "#1f2937", accent: "#b91c1c" },
  dark: { primary: "#1c1c1e", accent: "#fbbf24" },
  executive: { primary: "#1e3a5f", accent: "#d4af37" },
  bold: { primary: "#0d0d0d", accent: "#fbbf24" },
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Returns the colour as 6-digit lowercase hex, or null when it isn't a plain hex
 * colour. Colours are interpolated into CSS, so nothing else may get through.
 */
export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!HEX_COLOR.test(trimmed)) return null
  const hex = trimmed.slice(1).toLowerCase()
  return `#${hex.length === 3 ? hex.split("").map((ch) => ch + ch).join("") : hex}`
}

/** The template's defaults with any valid overrides applied. */
export function resolveTemplateColors(
  template: TemplateType,
  overrides?: Partial<TemplateColors> | null
): TemplateColors {
  const defaults = TEMPLATE_DEFAULT_COLORS[template]
  return {
    primary: normalizeHexColor(overrides?.primary) ?? defaults.primary,
    accent: normalizeHexColor(overrides?.accent) ?? defaults.accent,
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`
}

/** Mixes `from` towards `to` by `amount` (0 = from, 1 = to). Inputs must be normalised hex. */
export function mixColors(from: string, to: string, amount: number): string {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  return rgbToHex([a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount, a[2] + (b[2] - a[2]) * amount])
}

const tint = (hex: string, amount: number) => mixColors(hex, "#ffffff", amount)
const shade = (hex: string, amount: number) => mixColors(hex, "#000000", amount)

/** The colour as text on white: itself when dark enough to read, otherwise darkened. */
function ink(hex: string): string {
  return contrastText(hex) === "#ffffff" ? hex : shade(hex, 0.5)
}

/** The accent as text on a primary-coloured surface: darkened when that surface is light. */
function accentOn(surface: string, accent: string): string {
  return contrastText(surface) === "#ffffff" ? accent : ink(accent)
}

/** White or near-black, whichever reads better on the given background. */
export function contrastText(background: string): "#ffffff" | "#111827" {
  const [r, g, b] = hexToRgb(background).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.4 ? "#111827" : "#ffffff"
}

export interface TemplateProfile {
  company_name?: string | null
  company_address?: string | null
  gst_id?: string | null
  email?: string | null
  phone?: string | null
  logo_url?: string | null
  upi_id?: string | null
  paypal_email?: string | null
  bank_name?: string | null
  bank_account_name?: string | null
  bank_account_number?: string | null
  bank_routing_number?: string | null
  bank_swift_code?: string | null
}

export type DocumentWithItems = Document & { line_items?: LineItem[] | null }

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = escapeHtml

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function formatMoney(amount: number, currency: string): string {
  const symbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? ""
  const abs = Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${amount < 0 ? "-" : ""}${symbol}${abs}`
}

function formatQty(value: number): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 3 })
}

type DateStyle = "long" | "short" | "numeric"

export function formatDate(value: string | null | undefined, style: DateStyle = "long"): string {
  if (!value) return ""
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value)
  if (Number.isNaN(date.getTime())) return esc(value)
  if (style === "numeric") {
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  })
}

function qrImageUrl(data: string, size: number): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${encodeURIComponent(data)}`
}

// ---------------------------------------------------------------------------
// Render context
// ---------------------------------------------------------------------------

interface Party {
  name: string
  address: string
  email: string
  phone: string
  gst: string
}

interface Totals {
  subtotal: number
  tax: number
  discountAmount: number
  discountLabel: string
  total: number
  amountPaid: number
  credited: number
  balanceDue: number
}

interface PaymentInfo {
  show: boolean
  bank: {
    name: string
    accountName: string
    accountNumber: string
    routing: string
    swift: string
  } | null
  upi: { id: string; qr: string } | null
  paypal: string | null
  other: string | null
}

interface Ctx {
  doc: DocumentWithItems
  items: LineItem[]
  isQuote: boolean
  label: string
  number: string
  currency: string
  includeTax: boolean
  money: (amount: number) => string
  issueDate: (style?: DateStyle) => string
  secondaryDate: { label: string; value: string | null }
  status: string
  statusBadge: string
  company: Party
  logo: string
  client: Party
  totals: Totals
  payment: PaymentInfo
  notes: string
  terms: string
  termsLabel: string
  colors: TemplateColors
}

function buildContext(
  doc: DocumentWithItems,
  profile: TemplateProfile | null | undefined,
  colors: TemplateColors
): Ctx {
  const p = profile ?? {}
  const items = [...(doc.line_items ?? [])].sort(
    (a, b) => (num(a.sort_order) ?? 0) - (num(b.sort_order) ?? 0)
  )
  const isQuote = doc.type === "quotation"
  const includeTax = doc.include_tax !== false
  const currency = doc.currency || "INR"
  const money = (amount: number) => formatMoney(amount, currency)

  const computedSubtotal = items.reduce(
    (sum, item) => sum + (num(item.quantity) ?? 0) * (num(item.rate) ?? 0),
    0
  )
  const computedTax = includeTax
    ? items.reduce(
        (sum, item) =>
          sum +
          ((num(item.quantity) ?? 0) * (num(item.rate) ?? 0) * (num(item.tax_percent) ?? 0)) / 100,
        0
      )
    : 0

  const subtotal = num(doc.subtotal) ?? computedSubtotal
  const tax = includeTax ? (num(doc.tax_total) ?? computedTax) : 0
  const discountValue = num(doc.discount_value) ?? 0
  const discountAmount =
    discountValue > 0
      ? doc.discount_type === "percentage"
        ? (subtotal * discountValue) / 100
        : discountValue
      : 0
  const discountLabel =
    doc.discount_type === "percentage" && discountValue > 0
      ? `Discount (${formatQty(discountValue)}%)`
      : "Discount"
  const total = num(doc.grand_total) ?? subtotal + tax - discountAmount
  const amountPaid = !isQuote ? Math.max(num(doc.amount_paid) ?? 0, 0) : 0
  const credited = !isQuote ? Math.max(num(doc.credit_total) ?? 0, 0) : 0
  const balanceDue = Math.max(total - amountPaid - credited, 0)

  // Only the payment methods ticked on the document go on the page. Documents saved
  // before the selector existed have no list and fall back to whatever the profile holds.
  const selected = Array.isArray(doc.payment_methods) ? new Set<string>(doc.payment_methods) : null
  const enabled = (method: PaymentMethodType) => (selected ? selected.has(method) : true)
  const pick = (docValue: unknown, profileValue: unknown) =>
    String(docValue ?? "").trim() || String(profileValue ?? "").trim()

  const upiId = enabled("upi") ? pick(doc.upi_id, p.upi_id) : ""
  const paypalEmail = enabled("paypal") ? pick(doc.paypal_email, p.paypal_email) : ""
  const otherInstructions = enabled("other") ? String(doc.payment_method ?? "").trim() : ""
  const bank = enabled("bank")
    ? {
        name: pick(doc.bank_name, p.bank_name),
        accountName: pick(doc.bank_account_name, p.bank_account_name),
        accountNumber: pick(doc.bank_account_number, p.bank_account_number),
        routing: pick(doc.bank_routing_number, p.bank_routing_number),
        swift: pick(doc.bank_swift_code, p.bank_swift_code),
      }
    : null
  const companyName = (p.company_name || "").trim()
  const upiParams = new URLSearchParams({ pa: upiId, pn: companyName || "Payee" })
  if (currency === "INR" && balanceDue > 0) {
    upiParams.set("am", balanceDue.toFixed(2))
    upiParams.set("cu", "INR")
  }
  const upiUri = `upi://pay?${upiParams.toString()}`

  const hasBank = Boolean(bank && (bank.name || bank.accountNumber))
  const payment: PaymentInfo = {
    show: !isQuote && Boolean(hasBank || upiId || paypalEmail || otherInstructions),
    bank:
      hasBank && bank
        ? {
            name: esc(bank.name),
            accountName: esc(bank.accountName),
            accountNumber: esc(bank.accountNumber),
            routing: esc(bank.routing),
            swift: esc(bank.swift),
          }
        : null,
    upi: upiId ? { id: esc(upiId), qr: qrImageUrl(upiUri, 240) } : null,
    paypal: paypalEmail ? esc(paypalEmail) : null,
    other: otherInstructions ? esc(otherInstructions) : null,
  }

  const status = String(doc.status || "")
  const badgeStatuses: Record<string, string> = {
    paid: "Paid",
    overdue: "Overdue",
    cancelled: "Cancelled",
  }
  const statusBadge =
    !isQuote && badgeStatuses[status]
      ? `<span class="status-badge status-${esc(status)}">${badgeStatuses[status]}</span>`
      : ""

  const logoUrl = safeHttpUrl(p.logo_url)

  return {
    doc,
    items,
    isQuote,
    label: isQuote ? "Quotation" : "Invoice",
    number: esc(doc.number || "DRAFT"),
    currency,
    includeTax,
    money,
    issueDate: (style: DateStyle = "long") => formatDate(doc.issue_date, style),
    secondaryDate: isQuote
      ? { label: "Valid Until", value: doc.valid_until || doc.due_date || null }
      : { label: "Due Date", value: doc.due_date || null },
    status,
    statusBadge,
    company: {
      name: esc(companyName || "Your Company"),
      address: esc(p.company_address),
      email: esc(p.email),
      phone: esc(p.phone),
      gst: esc(p.gst_id),
    },
    logo: logoUrl ? esc(logoUrl) : "",
    client: {
      name: esc(doc.client_name || "Client"),
      address: esc(doc.client_address),
      email: esc(doc.client_email),
      phone: "",
      gst: esc(doc.client_gst_id),
    },
    totals: { subtotal, tax, discountAmount, discountLabel, total, amountPaid, credited, balanceDue },
    payment,
    notes: esc(doc.notes),
    terms: esc(doc.terms),
    termsLabel: isQuote ? "Quote Terms & Validity" : "Terms & Conditions",
    colors,
  }
}

// ---------------------------------------------------------------------------
// Shared partials
// ---------------------------------------------------------------------------

function partyLines(party: Party, opts: { gstLabel?: string } = {}): string {
  const gstLabel = opts.gstLabel ?? "GSTIN"
  return [
    party.address ? `<div class="party-line pre">${party.address}</div>` : "",
    party.email ? `<div class="party-line">${party.email}</div>` : "",
    party.phone ? `<div class="party-line">${party.phone}</div>` : "",
    party.gst ? `<div class="party-line party-gst">${gstLabel}: ${party.gst}</div>` : "",
  ].join("")
}

interface ItemsOptions {
  index?: boolean
  /** Narrower numeric columns for layouts with a reduced content width (e.g. sidebars). */
  compact?: boolean
  labels?: Partial<Record<"index" | "item" | "qty" | "rate" | "tax" | "amount", string>>
}

function itemsTable(ctx: Ctx, opts: ItemsOptions = {}): string {
  const labels = {
    index: "#",
    item: "Item",
    qty: "Qty",
    rate: "Rate",
    tax: "Tax",
    amount: "Amount",
    ...opts.labels,
  }
  const showIndex = opts.index === true

  const rows = ctx.items
    .map((item, i) => {
      const qty = num(item.quantity) ?? 0
      const rate = num(item.rate) ?? 0
      const taxPct = num(item.tax_percent) ?? 0
      const amount =
        num(item.line_total) ?? qty * rate * (ctx.includeTax ? 1 + taxPct / 100 : 1)
      const name = esc(item.name || item.description || "")
      const description = item.name && item.description ? esc(item.description) : ""
      return `<tr>
        ${showIndex ? `<td class="c-index">${i + 1}</td>` : ""}
        <td class="c-item"><div class="item-name">${name}</div>${
          description ? `<div class="item-desc pre">${description}</div>` : ""
        }</td>
        <td class="num">${formatQty(qty)}</td>
        <td class="num">${ctx.money(rate)}</td>
        ${ctx.includeTax ? `<td class="num">${formatQty(taxPct)}%</td>` : ""}
        <td class="num c-amount">${ctx.money(amount)}</td>
      </tr>`
    })
    .join("")

  const emptyRow = `<tr><td class="c-empty" colspan="${
    (showIndex ? 1 : 0) + 4 + (ctx.includeTax ? 1 : 0)
  }">No line items</td></tr>`

  const widths = opts.compact
    ? { index: "8mm", qty: "13mm", rate: "26mm", tax: "13mm", amount: "29mm" }
    : { index: "9mm", qty: "17mm", rate: "31mm", tax: "15mm", amount: "34mm" }

  return `<table class="items">
    <colgroup>
      ${showIndex ? `<col style="width:${widths.index}">` : ""}
      <col>
      <col style="width:${widths.qty}">
      <col style="width:${widths.rate}">
      ${ctx.includeTax ? `<col style="width:${widths.tax}">` : ""}
      <col style="width:${widths.amount}">
    </colgroup>
    <thead><tr>
      ${showIndex ? `<th class="c-index">${labels.index}</th>` : ""}
      <th class="c-item">${labels.item}</th>
      <th class="num">${labels.qty}</th>
      <th class="num">${labels.rate}</th>
      ${ctx.includeTax ? `<th class="num">${labels.tax}</th>` : ""}
      <th class="num">${labels.amount}</th>
    </tr></thead>
    <tbody>${rows || emptyRow}</tbody>
  </table>`
}

function totalsRows(ctx: Ctx, opts: { taxLabel?: string } = {}): string {
  const t = ctx.totals
  const rows: string[] = []
  rows.push(`<div class="tr"><span>Subtotal</span><span class="num">${ctx.money(t.subtotal)}</span></div>`)
  if (ctx.includeTax && t.tax > 0) {
    rows.push(
      `<div class="tr tr-tax"><span>${opts.taxLabel ?? "Tax"}</span><span class="num">${ctx.money(t.tax)}</span></div>`
    )
  }
  if (t.discountAmount > 0) {
    rows.push(
      `<div class="tr tr-discount"><span>${t.discountLabel}</span><span class="num">-${ctx.money(t.discountAmount)}</span></div>`
    )
  }
  rows.push(`<div class="tr tr-total"><span>Total</span><span class="num">${ctx.money(t.total)}</span></div>`)
  if (t.amountPaid > 0) {
    rows.push(
      `<div class="tr tr-paid"><span>Amount Paid</span><span class="num">-${ctx.money(t.amountPaid)}</span></div>`
    )
  }
  if (t.credited > 0) {
    rows.push(
      `<div class="tr tr-paid tr-credit"><span>Credit Applied</span><span class="num">-${ctx.money(t.credited)}</span></div>`
    )
  }
  if (t.amountPaid > 0 || t.credited > 0) {
    rows.push(
      `<div class="tr tr-balance"><span>Balance Due</span><span class="num">${ctx.money(t.balanceDue)}</span></div>`
    )
  }
  return rows.join("")
}

function kv(label: string, value: string, mono = false): string {
  if (!value) return ""
  return `<div class="kv"><span class="k">${label}</span><span class="v${mono ? " mono" : ""}">${value}</span></div>`
}

function bankDetails(ctx: Ctx): string {
  const b = ctx.payment.bank
  if (!b) return ""
  return `<div class="pay-method">
    <div class="pay-method-title">Bank Transfer</div>
    ${kv("Bank", b.name)}
    ${kv("Account Name", b.accountName)}
    ${kv("Account No.", b.accountNumber, true)}
    ${kv("IFSC / Routing", b.routing, true)}
    ${kv("SWIFT / BIC", b.swift, true)}
  </div>`
}

function upiDetails(ctx: Ctx, opts: { qr?: boolean } = { qr: true }): string {
  const u = ctx.payment.upi
  if (!u) return ""
  return `<div class="pay-method">
    <div class="pay-method-title">UPI</div>
    <div class="upi">
      ${opts.qr ? `<img class="qr" src="${u.qr}" alt="UPI QR code" width="88" height="88">` : ""}
      <div>
        ${kv("UPI ID", u.id, true)}
        ${opts.qr ? `<div class="hint">Scan the QR code with any UPI app to pay.</div>` : ""}
      </div>
    </div>
  </div>`
}

function paypalDetails(ctx: Ctx): string {
  const email = ctx.payment.paypal
  if (!email) return ""
  return `<div class="pay-method">
    <div class="pay-method-title">PayPal</div>
    ${kv("Email", email)}
  </div>`
}

function otherDetails(ctx: Ctx): string {
  const text = ctx.payment.other
  if (!text) return ""
  return `<div class="pay-method">
    <div class="pay-method-title">Other</div>
    <div class="pre">${text}</div>
  </div>`
}

function paymentBlock(ctx: Ctx, opts: { qr?: boolean; title?: string } = {}): string {
  if (!ctx.payment.show) return ""
  return `<section class="payment avoid-break">
    <div class="section-title">${opts.title ?? "Payment Information"}</div>
    <div class="pay-grid">
      ${bankDetails(ctx)}
      ${upiDetails(ctx, { qr: opts.qr !== false })}
      ${paypalDetails(ctx)}
      ${otherDetails(ctx)}
    </div>
  </section>`
}

function notesBlock(ctx: Ctx): string {
  const parts: string[] = []
  if (ctx.notes) {
    parts.push(
      `<section class="notes avoid-break"><div class="section-title">Notes</div><div class="pre notes-text">${ctx.notes}</div></section>`
    )
  }
  if (ctx.terms) {
    parts.push(
      `<section class="notes avoid-break"><div class="section-title">${ctx.termsLabel}</div><div class="pre notes-text">${ctx.terms}</div></section>`
    )
  }
  return parts.join("")
}

function metaRows(ctx: Ctx, style: DateStyle, opts: { numberLabel?: string } = {}): string {
  const numberLabel = opts.numberLabel ?? `${ctx.label} No.`
  const rows = [
    `<div class="meta-row"><span class="meta-k">${numberLabel}</span><span class="meta-v">${ctx.number}</span></div>`,
    `<div class="meta-row"><span class="meta-k">Date</span><span class="meta-v">${ctx.issueDate(style)}</span></div>`,
  ]
  if (ctx.secondaryDate.value) {
    rows.push(
      `<div class="meta-row meta-secondary"><span class="meta-k">${ctx.secondaryDate.label}</span><span class="meta-v">${formatDate(ctx.secondaryDate.value, style)}</span></div>`
    )
  }
  return rows.join("")
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

const BASE_CSS = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html { width: 210mm; }
body {
  width: 210mm;
  min-height: 297mm;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  font-size: 11.5px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
img { max-width: 100%; }
a { color: inherit; text-decoration: none; }
.pre { white-space: pre-line; overflow-wrap: anywhere; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 0.95em; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.avoid-break { break-inside: avoid; page-break-inside: avoid; }

/* Page shell: thead/tfoot spacers repeat on every printed page */
table.page-shell { width: 100%; border-collapse: collapse; border-spacing: 0; }
table.page-shell > thead > tr > td,
table.page-shell > tfoot > tr > td,
table.page-shell > tbody > tr > td { padding: 0; vertical-align: top; }
.page-top { height: 12mm; }
.page-bottom { height: 12mm; }
.page-body { width: 100%; }

/* Line items */
table.items { width: 100%; border-collapse: collapse; table-layout: fixed; }
table.items thead { display: table-header-group; }
table.items tr { break-inside: avoid; page-break-inside: avoid; }
table.items th, table.items td { vertical-align: top; overflow-wrap: anywhere; }
table.items th { font-weight: 600; text-align: left; }
table.items th.num, table.items td.num { text-align: right; }
table.items td.c-empty { text-align: center; font-style: italic; opacity: 0.6; padding: 12px; }
.item-name { font-weight: 600; }
.item-desc { font-size: 10.5px; opacity: 0.75; margin-top: 2px; }

/* Totals */
.totals { break-inside: avoid; page-break-inside: avoid; }
.totals .tr { display: flex; justify-content: space-between; gap: 16px; padding: 5px 0; }
.totals .tr-total { font-weight: 700; }

/* Payment & notes */
.pay-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(60mm, 1fr)); gap: 12px 24px; }
.pay-method-title { font-weight: 600; margin-bottom: 4px; }
.kv { display: flex; gap: 6px; line-height: 1.6; }
.kv .k { opacity: 0.65; flex: 0 0 auto; }
.kv .v { flex: 1; overflow-wrap: anywhere; }
.upi { display: flex; gap: 12px; align-items: flex-start; }
.upi .qr { width: 88px; height: 88px; flex: 0 0 auto; background: #fff; padding: 4px; border-radius: 4px; }
.hint { font-size: 10px; opacity: 0.6; margin-top: 4px; }
.notes-text { font-size: 11px; }

/* Meta rows */
.meta-row { display: flex; justify-content: flex-end; gap: 10px; }
.meta-k { opacity: 0.65; }
.meta-v { font-weight: 600; }

/* On screen (preview iframe) there are no pages: fixed decorations span the whole document */
@media screen {
  body { position: relative; }
  .screen-span { position: absolute !important; height: auto !important; bottom: 0 !important; }
}

/* Status badge */
.status-badge { display: inline-block; font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; vertical-align: middle; }
.status-paid { background: #dcfce7; color: #166534; }
.status-overdue { background: #fee2e2; color: #991b1b; }
.status-cancelled { background: #e5e7eb; color: #374151; }
`

interface ShellOptions {
  title: string
  css: string
  body: string
  /** Markup placed outside the page shell (fixed decorations). */
  fixed?: string
  bodyClass?: string
}

function shell({ title, css, body, fixed = "", bodyClass = "" }: ShellOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_URL}" rel="stylesheet">
<style>${BASE_CSS}${css}</style>
</head>
<body class="${bodyClass}">
${fixed}
<table class="page-shell">
  <thead><tr><td class="page-top"></td></tr></thead>
  <tfoot><tr><td class="page-bottom"></td></tr></tfoot>
  <tbody><tr><td class="page-body">${body}</td></tr></tbody>
</table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * @param colors Optional primary/accent overrides for the template. Invalid values
 *   fall back to the template's defaults, so callers can pass user input straight in.
 */
export function generateDocumentHTML(
  document: DocumentWithItems,
  profile: TemplateProfile | null | undefined,
  template: TemplateType = "classic",
  colors?: Partial<TemplateColors> | null
): string {
  const ctx = buildContext(document, profile, resolveTemplateColors(template, colors))
  switch (template) {
    case "minimal":
      return minimalTemplate(ctx)
    case "tax":
      return taxTemplate(ctx)
    case "dark":
      return darkTemplate(ctx)
    case "executive":
      return executiveTemplate(ctx)
    case "bold":
      return boldTemplate(ctx)
    default:
      return classicTemplate(ctx)
  }
}

export function documentFileName(document: Pick<Document, "type" | "number">): string {
  const label = document.type === "quotation" ? "Quotation" : "Invoice"
  const safeNumber = String(document.number || "draft").replace(/[^A-Za-z0-9._-]+/g, "-")
  return `${label}-${safeNumber}.pdf`
}

// ---------------------------------------------------------------------------
// Classic
// ---------------------------------------------------------------------------

function classicTemplate(ctx: Ctx): string {
  const c = ctx.colors
  const css = `
body { color: #1f2937; background: #ffffff; }
.wrap { padding: 0 16mm; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 26px; }
.logo { max-height: 56px; max-width: 160px; object-fit: contain; display: block; margin-bottom: 10px; }
.company-name { font-size: 17px; font-weight: 700; }
.party-line { font-size: 11px; color: #6b7280; }
.title { font-size: 30px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; line-height: 1.1; color: ${ink(c.primary)}; }
.title-row { display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-bottom: 8px; }
.meta { font-size: 11.5px; }
.meta-secondary .meta-v { color: ${ink(c.accent)}; }
.bill-to { background: #f9fafb; border: 1px solid #eef0f3; border-left: 3px solid ${c.accent}; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; }
.section-title { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
.client-name { font-size: 14px; font-weight: 600; }
table.items { margin-bottom: 18px; }
table.items th { padding: 9px 8px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid ${c.primary}; }
table.items td { padding: 10px 8px; border-bottom: 1px solid #eef0f3; }
table.items td.c-amount { font-weight: 600; }
.totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 26px; }
.totals { width: 74mm; }
.totals .tr { color: #4b5563; }
.totals .tr .num { color: #111827; }
.totals .tr-discount, .totals .tr-discount .num { color: #dc2626; }
.totals .tr-total { border-top: 2px solid ${c.primary}; margin-top: 6px; padding-top: 10px; font-size: 15px; color: ${ink(c.primary)}; }
.totals .tr-paid, .totals .tr-paid .num { color: #16a34a; }
.totals .tr-balance { font-weight: 700; color: #111827; background: #f9fafb; padding: 8px 10px; margin: 6px -10px 0; border-radius: 6px; }
.payment { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
.pay-method { font-size: 11px; }
.pay-method-title { color: #1f2937; }
.kv .k { color: #6b7280; }
.notes { margin-bottom: 16px; }
.notes-text { color: #374151; }
.footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10.5px; color: #9ca3af; }
`

  const body = `<div class="wrap">
  <header class="header">
    <div>
      ${ctx.logo ? `<img class="logo" src="${ctx.logo}" alt="Logo">` : ""}
      <div class="company-name">${ctx.company.name}</div>
      ${partyLines(ctx.company)}
    </div>
    <div>
      <div class="title-row">${ctx.statusBadge}<div class="title">${ctx.label}</div></div>
      <div class="meta">${metaRows(ctx, "long")}</div>
    </div>
  </header>

  <section class="bill-to avoid-break">
    <div class="section-title">Bill To</div>
    <div class="client-name">${ctx.client.name}</div>
    ${partyLines(ctx.client)}
  </section>

  ${itemsTable(ctx)}

  <div class="totals-wrap"><div class="totals">${totalsRows(ctx)}</div></div>

  ${paymentBlock(ctx)}
  ${notesBlock(ctx)}

  <footer class="footer">Thank you for your business!</footer>
</div>`

  return shell({ title: `${ctx.label} ${ctx.number}`, css, body })
}

// ---------------------------------------------------------------------------
// Minimal
// ---------------------------------------------------------------------------

function minimalTemplate(ctx: Ctx): string {
  const c = ctx.colors
  const css = `
html, body { background: #f5f5f0; }
body { color: #1a1a1a; }
.wrap { padding: 0 18mm; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 36px; }
.logo { max-height: 44px; max-width: 150px; object-fit: contain; display: block; margin-bottom: 14px; }
.title { font-size: 44px; font-weight: 900; letter-spacing: -1.5px; line-height: 1; color: ${ink(c.primary)}; }
.meta { font-size: 12px; color: #666; }
.meta-k { color: #999; opacity: 1; }
.meta-v { color: #1a1a1a; }
.parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
.party-card { background: #e8e8e0; border-radius: 8px; padding: 14px 16px; }
.section-title { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: ${ink(c.accent)}; margin-bottom: 8px; }
.party-name { font-weight: 600; font-size: 13px; }
.party-line { font-size: 11px; color: #666; }
table.items { margin-bottom: 20px; }
table.items th { padding: 10px 0; font-size: 11px; color: #666; border-bottom: 2px solid ${c.primary}; }
table.items th.num { padding-left: 10px; }
table.items td { padding: 12px 0; border-bottom: 1px solid #e0e0d6; }
table.items td.num { padding-left: 10px; color: #666; }
table.items td.c-amount { color: #1a1a1a; font-weight: 600; }
.item-desc { color: #999; opacity: 1; }
.totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 32px; }
.totals { width: 72mm; }
.totals .tr { color: #666; }
.totals .tr .num { color: #1a1a1a; }
.totals .tr-discount, .totals .tr-discount .num { color: #dc2626; }
.totals .tr-total { border-top: 2px solid ${c.primary}; margin-top: 8px; padding-top: 12px; font-size: 16px; color: ${ink(c.primary)}; }
.totals .tr-paid, .totals .tr-paid .num { color: #15803d; }
.totals .tr-balance { font-weight: 700; color: #1a1a1a; }
.payment { background: #e8e8e0; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
.payment .section-title { color: ${ink(c.primary)}; }
.pay-method { font-size: 11px; }
.kv .k { color: #999; opacity: 1; }
.kv .v { color: #444; }
.notes { margin-bottom: 16px; }
.notes .section-title { color: #666; }
.notes-text { color: #444; }
.footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #d4d4c8; display: flex; justify-content: space-between; font-size: 10.5px; color: #999; }
`

  const body = `<div class="wrap">
  <header class="header">
    <div>
      ${ctx.logo ? `<img class="logo" src="${ctx.logo}" alt="Logo">` : ""}
      <div class="title">${ctx.label}</div>
      ${ctx.statusBadge ? `<div style="margin-top:10px">${ctx.statusBadge}</div>` : ""}
    </div>
    <div class="meta">${metaRows(ctx, "long")}</div>
  </header>

  <section class="parties avoid-break">
    <div>
      <div class="section-title">From</div>
      <div class="party-name">${ctx.company.name}</div>
      ${partyLines(ctx.company, { gstLabel: "GST" })}
    </div>
    <div class="party-card">
      <div class="section-title">Billed To</div>
      <div class="party-name">${ctx.client.name}</div>
      ${partyLines(ctx.client, { gstLabel: "GST" })}
    </div>
  </section>

  ${itemsTable(ctx)}

  <div class="totals-wrap"><div class="totals">${totalsRows(ctx)}</div></div>

  ${paymentBlock(ctx)}
  ${notesBlock(ctx)}

  <footer class="footer"><span>Thank you for your business!</span><span>${ctx.company.name}</span></footer>
</div>`

  return shell({ title: `${ctx.label} ${ctx.number}`, css, body })
}

// ---------------------------------------------------------------------------
// Tax invoice (GST focused)
// ---------------------------------------------------------------------------

/** Taxable value and tax grouped by rate, for the GST summary on the tax template. */
function taxBreakdown(ctx: Ctx): { rate: number; taxable: number; tax: number }[] {
  if (!ctx.includeTax) return []
  const groups = new Map<number, { rate: number; taxable: number; tax: number }>()
  for (const item of ctx.items) {
    const rate = num(item.tax_percent) ?? 0
    if (rate <= 0) continue
    const taxable = (num(item.quantity) ?? 0) * (num(item.rate) ?? 0)
    const group = groups.get(rate) ?? { rate, taxable: 0, tax: 0 }
    group.taxable += taxable
    group.tax += (taxable * rate) / 100
    groups.set(rate, group)
  }
  return [...groups.values()].sort((a, b) => a.rate - b.rate)
}

function taxTemplate(ctx: Ctx): string {
  const c = ctx.colors
  const accentDark = shade(ink(c.accent), 0.2)
  const accentTint = tint(c.accent, 0.92)
  const accentBorder = tint(c.accent, 0.7)
  const primaryText = contrastText(c.primary)
  const css = `
body { color: #1f2937; background: #ffffff; }
.frame { position: fixed; top: 6mm; left: 6mm; right: 6mm; bottom: 6mm; border: 1.5px solid ${c.accent}; pointer-events: none; }
@media screen { .frame.screen-span { bottom: 6mm !important; } }
.page-top, .page-bottom { height: 14mm; }
.wrap { padding: 0 16mm; }

.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding-bottom: 14px; margin-bottom: 18px; border-bottom: 2px solid ${c.accent}; }
.brand { display: flex; gap: 14px; align-items: flex-start; }
.logo { max-height: 50px; max-width: 150px; object-fit: contain; display: block; }
.company-name { font-size: 20px; font-weight: 800; line-height: 1.2; letter-spacing: -0.2px; }
.company-line { font-size: 11px; color: #4b5563; }
.contact { text-align: right; font-size: 11px; color: #4b5563; }
.gst-chip { display: inline-block; font-size: 10.5px; font-weight: 700; letter-spacing: 0.5px; color: ${accentDark}; background: ${accentTint}; border: 1px solid ${accentBorder}; border-radius: 4px; padding: 4px 10px; margin-bottom: 6px; }
.gst-chip span { font-weight: 500; color: ${ink(c.accent)}; margin-right: 4px; }

.grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 16px; margin-bottom: 18px; }
.box { border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; }
.box-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; min-height: 28px; padding: 5px 12px; background: #f3f4f6; border-bottom: 1px solid #d1d5db; font-size: 9.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #374151; }
.box-head.dark { background: ${c.primary}; color: ${primaryText}; border-bottom-color: ${c.primary}; }
.box-body { padding: 10px 12px; }
.client-name { font-size: 14px; font-weight: 700; }
.party-line { font-size: 11px; color: #4b5563; }
.party-gst { color: #1f2937; font-weight: 600; margin-top: 3px; }
.details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.detail-k { font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; }
.detail-v { font-size: 12.5px; font-weight: 700; margin-top: 1px; }
.detail-v.due { color: ${ink(c.accent)}; }
.status-badge { padding: 2px 8px; font-size: 9px; }

table.items { margin-bottom: 18px; border: 1px solid #d1d5db; }
table.items th { padding: 8px 10px; font-size: 10.5px; font-weight: 700; color: #1f2937; background: #f3f4f6; border-bottom: 2px solid ${c.primary}; border-right: 1px solid #e5e7eb; }
table.items td { padding: 9px 10px; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
table.items tbody tr:nth-child(even) td { background: #fafafa; }
table.items th:last-child, table.items td:last-child { border-right: 0; }
table.items tbody tr:last-child td { border-bottom: 0; }
table.items td.c-index { text-align: center; color: #6b7280; }
table.items td.c-amount { font-weight: 700; }

.summary { display: grid; grid-template-columns: 1fr 78mm; gap: 24px; margin-bottom: 20px; }
.section-title { font-size: 10px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; }
.words { border: 1px dashed #d1d5db; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; }
.words .section-title { margin-bottom: 3px; }
.words-text { font-size: 11.5px; font-weight: 600; color: #111827; }
table.taxes { width: 100%; border-collapse: collapse; font-size: 10.5px; }
table.taxes th { font-weight: 700; color: #6b7280; text-align: left; padding: 4px 6px; border-bottom: 1px solid #d1d5db; font-size: 9.5px; letter-spacing: 0.8px; text-transform: uppercase; }
table.taxes td { padding: 4px 6px; border-bottom: 1px solid #f3f4f6; color: #374151; }
table.taxes th.num, table.taxes td.num { text-align: right; }
table.taxes tfoot td { font-weight: 700; color: #111827; border-top: 1px solid #d1d5db; border-bottom: 0; }
.totals .tr { font-size: 11.5px; color: #4b5563; padding: 5px 0; }
.totals .tr .num { color: #111827; }
.totals .tr-tax span:first-child { color: ${ink(c.accent)}; font-weight: 600; }
.totals .tr-discount, .totals .tr-discount .num { color: #4b5563; }
.totals .tr-total { margin-top: 6px; padding: 10px 0; border-top: 2px solid ${c.primary}; border-bottom: 2px solid ${c.primary}; font-size: 14px; color: #111827; }
.totals .tr-total span:first-child { text-transform: uppercase; letter-spacing: 1px; }
.totals .tr-paid, .totals .tr-paid .num { color: #15803d; }
.totals .tr-balance { font-weight: 800; color: ${accentDark}; background: ${accentTint}; padding: 8px 10px; margin-top: 6px; border-radius: 4px; }
.totals .tr-balance .num { color: ${accentDark}; }

.payment { border: 1px solid #d1d5db; border-radius: 6px; padding: 12px 14px; margin-bottom: 16px; }
.payment .section-title { color: #1f2937; }
.pay-method { font-size: 11px; }
.kv .k { color: #6b7280; }
.notes { margin-bottom: 14px; }
.notes-text { color: #374151; }

.footer { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: end; padding-top: 14px; border-top: 1px solid #d1d5db; margin-top: 20px; break-inside: avoid; page-break-inside: avoid; }
.declaration { font-size: 10px; color: #6b7280; line-height: 1.5; }
.declaration strong { color: #374151; }
.signatory { text-align: center; min-width: 60mm; }
.sign-for { font-size: 11px; font-weight: 700; color: #111827; }
.sign-space { height: 44px; }
.sign-line { border-top: 1px solid #6b7280; padding-top: 5px; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #4b5563; }
`

  const breakdown = taxBreakdown(ctx)
  const taxesTable =
    breakdown.length > 0
      ? `<table class="taxes">
      <thead><tr><th>GST rate</th><th class="num">Taxable value</th><th class="num">Tax</th></tr></thead>
      <tbody>${breakdown
        .map(
          (g) =>
            `<tr><td>${formatQty(g.rate)}%</td><td class="num">${ctx.money(g.taxable)}</td><td class="num">${ctx.money(g.tax)}</td></tr>`
        )
        .join("")}</tbody>
      ${
        breakdown.length > 1
          ? `<tfoot><tr><td>Total</td><td class="num">${ctx.money(breakdown.reduce((s, g) => s + g.taxable, 0))}</td><td class="num">${ctx.money(breakdown.reduce((s, g) => s + g.tax, 0))}</td></tr></tfoot>`
          : ""
      }
    </table>`
      : ""

  const details = [
    `<div><div class="detail-k">${ctx.label} No.</div><div class="detail-v">${ctx.number}</div></div>`,
    `<div><div class="detail-k">Date</div><div class="detail-v">${ctx.issueDate("numeric")}</div></div>`,
    ctx.secondaryDate.value
      ? `<div><div class="detail-k">${ctx.secondaryDate.label}</div><div class="detail-v due">${formatDate(ctx.secondaryDate.value, "numeric")}</div></div>`
      : "",
    `<div><div class="detail-k">Currency</div><div class="detail-v">${esc(ctx.currency)}</div></div>`,
  ].join("")

  const contactLines = [ctx.company.email, ctx.company.phone].filter(Boolean)

  const body = `<div class="wrap">
  <header class="header">
    <div class="brand">
      ${ctx.logo ? `<img class="logo" src="${ctx.logo}" alt="Logo">` : ""}
      <div>
        <div class="company-name">${ctx.company.name}</div>
        ${ctx.company.address ? `<div class="company-line pre">${ctx.company.address}</div>` : ""}
      </div>
    </div>
    <div class="contact">
      ${ctx.company.gst ? `<div class="gst-chip"><span>GSTIN</span>${ctx.company.gst}</div>` : ""}
      ${contactLines.map((line) => `<div>${line}</div>`).join("")}
    </div>
  </header>

  <section class="grid avoid-break">
    <div class="box">
      <div class="box-head">Bill To</div>
      <div class="box-body">
        <div class="client-name">${ctx.client.name}</div>
        ${partyLines(ctx.client)}
      </div>
    </div>
    <div class="box">
      <div class="box-head dark"><span>${ctx.label}</span>${ctx.statusBadge}</div>
      <div class="box-body details">${details}</div>
    </div>
  </section>

  ${itemsTable(ctx, { index: true, labels: { item: "Description", tax: "GST %" } })}

  <section class="summary avoid-break">
    <div>
      <div class="words">
        <div class="section-title">Amount in words</div>
        <div class="words-text">${amountInWords(ctx.totals.total, ctx.currency)}</div>
      </div>
      ${taxesTable}
    </div>
    <div class="totals">${totalsRows(ctx, { taxLabel: "Tax (GST)" })}</div>
  </section>

  ${paymentBlock(ctx, { title: "Payment Details" })}
  ${notesBlock(ctx)}

  <footer class="footer">
    <div class="declaration">
      <div><strong>Declaration:</strong> We declare that this ${ctx.isQuote ? "quotation" : "invoice"} shows the actual price of the goods/services described and that all particulars are true and correct.</div>
      <div style="margin-top:4px">This is a computer-generated document.</div>
    </div>
    <div class="signatory">
      <div class="sign-for">For ${ctx.company.name}</div>
      <div class="sign-space"></div>
      <div class="sign-line">Authorised Signatory</div>
    </div>
  </footer>
</div>`

  return shell({
    title: `${ctx.label} ${ctx.number}`,
    css,
    body,
    fixed: `<div class="frame screen-span"></div>`,
  })
}

// ---------------------------------------------------------------------------
// Dark
// ---------------------------------------------------------------------------

function darkTemplate(ctx: Ctx): string {
  const c = ctx.colors
  const text = contrastText(c.primary)
  const panel = mixColors(c.primary, text, 0.08)
  const border = mixColors(c.primary, text, 0.18)
  const dim = mixColors(c.primary, text, 0.45)
  const muted = mixColors(c.primary, text, 0.6)
  const soft = mixColors(c.primary, text, 0.85)
  const accent = accentOn(c.primary, c.accent)
  const css = `
html, body { background: ${c.primary}; }
body { color: ${text}; }
.wrap { padding: 0 16mm; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 26px; padding-bottom: 22px; border-bottom: 1px solid ${border}; }
.brand { display: flex; gap: 14px; align-items: flex-start; }
.logo-box { width: 56px; height: 56px; background: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 6px; flex: 0 0 auto; }
.logo-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
.company-name { font-size: 16px; font-weight: 700; color: ${text}; }
.party-line { font-size: 11px; color: ${muted}; }
.title { font-size: 34px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; line-height: 1; color: ${text}; margin-bottom: 10px; }
.title-row { display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
.meta { font-size: 11.5px; color: ${muted}; }
.meta-k { color: ${dim}; opacity: 1; }
.meta-v { color: ${soft}; }
.meta-secondary .meta-v { color: ${accent}; }
.parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 26px; }
.panel { background: ${panel}; border: 1px solid ${border}; border-radius: 8px; padding: 14px 16px; }
.section-title { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${dim}; margin-bottom: 8px; }
.party-name { font-size: 13.5px; font-weight: 600; color: ${text}; }
table.items { margin-bottom: 18px; }
table.items th { padding: 9px 8px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: ${muted}; border-bottom: 2px solid ${border}; }
table.items td { padding: 10px 8px; border-bottom: 1px solid ${panel}; color: ${soft}; }
table.items td.c-amount { color: ${text}; font-weight: 600; }
.item-name { color: ${text}; }
.item-desc { color: ${muted}; opacity: 1; }
.totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 26px; }
.totals { width: 76mm; }
.totals .tr { color: ${muted}; }
.totals .tr .num { color: ${soft}; }
.totals .tr-discount, .totals .tr-discount .num { color: #f87171; }
.totals .tr-total { border-top: 2px solid ${border}; margin-top: 6px; padding-top: 12px; font-size: 16px; color: ${text}; }
.totals .tr-total .num { color: ${text}; }
.totals .tr-paid, .totals .tr-paid .num { color: #4ade80; }
.totals .tr-balance { font-weight: 700; color: ${text}; }
.totals .tr-balance .num { color: ${accent}; }
.payment { background: ${panel}; border: 1px solid ${border}; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
.payment .section-title { color: ${soft}; }
.pay-method { font-size: 11px; color: ${soft}; }
.pay-method-title { color: ${soft}; }
.kv .k { color: ${dim}; opacity: 1; }
.kv .v { color: ${soft}; }
.hint { color: ${dim}; opacity: 1; }
.notes { margin-bottom: 16px; }
.notes-text { color: ${muted}; }
.footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid ${panel}; text-align: center; font-size: 10.5px; color: ${dim}; }
.status-paid { background: #14532d; color: #bbf7d0; }
.status-overdue { background: #7f1d1d; color: #fecaca; }
.status-cancelled { background: ${border}; color: ${soft}; }
`

  const settled = ctx.totals.amountPaid > 0 || ctx.totals.credited > 0
  const headline = settled ? "Balance Due" : "Total"
  const headlineAmount = settled ? ctx.totals.balanceDue : ctx.totals.total

  const body = `<div class="wrap">
  <header class="header">
    <div class="brand">
      ${ctx.logo ? `<div class="logo-box"><img src="${ctx.logo}" alt="Logo"></div>` : ""}
      <div>
        <div class="company-name">${ctx.company.name}</div>
        ${partyLines(ctx.company, { gstLabel: "GST" })}
      </div>
    </div>
    <div>
      <div class="title-row">${ctx.statusBadge}<div class="title">${ctx.label}</div></div>
      <div class="meta">${metaRows(ctx, "long")}</div>
    </div>
  </header>

  <section class="parties avoid-break">
    <div class="panel">
      <div class="section-title">Bill To</div>
      <div class="party-name">${ctx.client.name}</div>
      ${partyLines(ctx.client, { gstLabel: "GST" })}
    </div>
    <div class="panel">
      <div class="section-title">${ctx.label} Summary</div>
      <div class="kv"><span class="k">Items</span><span class="v">${ctx.items.length}</span></div>
      <div class="kv"><span class="k">Currency</span><span class="v">${esc(ctx.currency)}</span></div>
      <div class="kv"><span class="k">${headline}</span><span class="v" style="font-weight:700;color:${text}">${ctx.money(headlineAmount)}</span></div>
    </div>
  </section>

  ${itemsTable(ctx)}

  <div class="totals-wrap"><div class="totals">${totalsRows(ctx)}</div></div>

  ${paymentBlock(ctx)}
  ${notesBlock(ctx)}

  <footer class="footer">Thank you for your business!</footer>
</div>`

  return shell({ title: `${ctx.label} ${ctx.number}`, css, body })
}

// ---------------------------------------------------------------------------
// Executive (navy sidebar + gold accents)
// ---------------------------------------------------------------------------

function executiveTemplate(ctx: Ctx): string {
  const sidebarWidth = 54 // mm
  const c = ctx.colors
  const onPrimary = contrastText(c.primary)
  const onPrimarySoft = mixColors(onPrimary, c.primary, 0.2)
  const onPrimaryMuted = mixColors(onPrimary, c.primary, 0.3)
  const onPrimaryDim = mixColors(onPrimary, c.primary, 0.45)
  const css = `
body { color: #111827; background: #ffffff; }
.sidebar { position: fixed; top: 0; left: 0; width: ${sidebarWidth}mm; height: 297mm; background: linear-gradient(180deg, ${c.primary} 0%, ${shade(c.primary, 0.3)} 100%); color: ${onPrimary}; padding: 14mm 6mm 12mm; display: flex; flex-direction: column; border-right: 2px solid ${c.accent}; }
.sidebar .logo-strip { background: #ffffff; margin: -14mm -6mm 16px; padding: 10mm 6mm 7mm; border-bottom: 3px solid ${c.accent}; }
.sidebar .logo-strip img { display: block; max-height: 48px; max-width: 100%; object-fit: contain; margin: 0 auto; }
.sidebar .company-name { font-size: 12.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; line-height: 1.3; }
.sidebar .party-line { font-size: 10px; color: ${onPrimarySoft}; line-height: 1.55; }
.sidebar .party-gst { margin-top: 6px; color: ${onPrimary}; }
.sidebar .gold-rule { width: 28px; height: 2px; background: ${c.accent}; margin: 14px 0; }
.sidebar .side-section { font-size: 9px; letter-spacing: 1.8px; text-transform: uppercase; color: ${accentOn(c.primary, c.accent)}; font-weight: 700; margin-bottom: 6px; }
.sidebar .side-total { font-size: 19px; font-weight: 800; letter-spacing: -0.3px; line-height: 1.2; }
.sidebar .side-muted { font-size: 10px; color: ${onPrimaryMuted}; margin-top: 3px; }
.sidebar .side-pay { font-size: 10px; }
.sidebar .side-pay .pay-method { margin-bottom: 8px; }
.sidebar .side-pay .pay-method-title { font-size: 10px; font-weight: 700; color: ${onPrimary}; margin-bottom: 2px; }
.sidebar .side-pay .kv { flex-direction: column; gap: 0; line-height: 1.45; margin-bottom: 3px; }
.sidebar .side-pay .kv .k { font-size: 8.5px; letter-spacing: 0.6px; text-transform: uppercase; color: ${onPrimaryDim}; opacity: 1; }
.sidebar .side-pay .kv .v { color: ${onPrimary}; }
.sidebar .side-pay .upi { display: block; }
.sidebar .side-pay .hint { display: none; }
.sidebar .qr-wrap { margin-top: auto; padding-top: 12px; }
.sidebar .qr-box { background: #ffffff; padding: 6px; border-radius: 6px; width: 32mm; margin: 0 auto; }
.sidebar .qr-box img { display: block; width: 100%; height: auto; }
.sidebar .qr-caption { font-size: 9px; text-align: center; color: ${onPrimaryMuted}; margin-top: 6px; }

.wrap { margin-left: ${sidebarWidth}mm; padding: 0 12mm 0 10mm; }
.header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; padding-bottom: 14px; margin-bottom: 20px; border-bottom: 2px solid ${c.accent}; }
.title-row { display: flex; align-items: center; gap: 10px; }
.title { font-size: 28px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: ${ink(c.primary)}; line-height: 1.1; }
.subtitle { font-size: 11px; color: #6b7280; margin-top: 4px; }
.meta { font-size: 11px; text-align: right; }
.meta-row { gap: 12px; }
.meta-k { color: #6b7280; opacity: 1; }
.meta-v { color: #111827; min-width: 24mm; text-align: left; }
.meta-secondary .meta-v { color: ${shade(ink(c.accent), 0.15)}; }

.section-title { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${ink(c.primary)}; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.section-title::before { content: ""; display: inline-block; width: 3px; height: 12px; background: ${c.accent}; }
.bill-to { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 16px; margin-bottom: 20px; }
.client-name { font-size: 14px; font-weight: 700; }
.party-line { font-size: 11px; color: #6b7280; }

table.items { margin-bottom: 16px; }
table.items th { padding: 9px 8px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${onPrimary}; background: ${c.primary}; border-bottom: 2px solid ${c.accent}; }
table.items th:first-child { border-radius: 6px 0 0 0; }
table.items th:last-child { border-radius: 0 6px 0 0; }
table.items td { padding: 9px 8px; border-bottom: 1px solid #e5e7eb; color: #374151; }
table.items tbody tr:nth-child(even) td { background: #f9fafb; }
table.items td.c-amount { color: ${ink(c.primary)}; font-weight: 700; }

.summary { display: grid; grid-template-columns: 1fr 70mm; gap: 20px; align-items: start; margin-bottom: 20px; }
.words { padding-top: 4px; }
.words-text { font-size: 11px; color: #374151; }
.totals { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 14px; }
.totals .tr { color: #6b7280; font-size: 11.5px; }
.totals .tr .num { color: #111827; font-weight: 500; }
.totals .tr-discount, .totals .tr-discount .num { color: #dc2626; }
.totals .tr-total { border-top: 2px solid ${c.accent}; margin-top: 6px; padding-top: 10px; font-size: 15px; color: ${ink(c.primary)}; }
.totals .tr-total .num { color: ${ink(c.primary)}; font-weight: 800; }
.totals .tr-paid, .totals .tr-paid .num { color: #15803d; }
.totals .tr-balance { font-weight: 700; color: ${onPrimary}; background: ${c.primary}; padding: 8px 10px; margin: 6px -14px -12px; border-radius: 0 0 6px 6px; }
.totals .tr-balance .num { color: ${onPrimary}; }

.notes { margin-bottom: 14px; }
.notes .section-title { color: #6b7280; }
.notes .section-title::before { background: #d1d5db; }
.notes-text { color: #374151; }
.footer { margin-top: 22px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10.5px; color: #9ca3af; }
`

  const settled = ctx.totals.amountPaid > 0 || ctx.totals.credited > 0
  const headline = ctx.isQuote ? "Quoted Total" : settled ? "Balance Due" : "Amount Due"
  const headlineAmount = settled ? ctx.totals.balanceDue : ctx.totals.total

  const sidePayment = ctx.payment.show
    ? `<div class="gold-rule"></div>
  <div class="side-section">Pay To</div>
  <div class="side-pay">
    ${bankDetails(ctx)}
    ${upiDetails(ctx, { qr: false })}
    ${paypalDetails(ctx)}
  </div>`
    : ""

  const sidebar = `<aside class="sidebar screen-span">
  ${ctx.logo ? `<div class="logo-strip"><img src="${ctx.logo}" alt="Logo"></div>` : ""}
  <div class="company-name">${ctx.company.name}</div>
  ${partyLines(ctx.company, { gstLabel: "GST" })}
  <div class="gold-rule"></div>
  <div class="side-section">${headline}</div>
  <div class="side-total">${ctx.money(headlineAmount)}</div>
  ${ctx.secondaryDate.value ? `<div class="side-muted">${ctx.secondaryDate.label}: ${formatDate(ctx.secondaryDate.value, "short")}</div>` : ""}
  ${sidePayment}
  ${
    ctx.payment.show && ctx.payment.upi
      ? `<div class="qr-wrap"><div class="qr-box"><img src="${ctx.payment.upi.qr}" alt="UPI QR code"></div><div class="qr-caption">Scan to pay via UPI</div></div>`
      : ""
  }
</aside>`

  const body = `<div class="wrap">
  <header class="header">
    <div>
      <div class="title-row"><div class="title">${ctx.label}</div>${ctx.statusBadge}</div>
      <div class="subtitle">Issued by ${ctx.company.name}</div>
    </div>
    <div class="meta">${metaRows(ctx, "short", { numberLabel: "Number" })}</div>
  </header>

  <section class="bill-to avoid-break">
    <div class="section-title">Bill To</div>
    <div class="client-name">${ctx.client.name}</div>
    ${partyLines(ctx.client, { gstLabel: "GST" })}
  </section>

  ${itemsTable(ctx, { compact: true })}

  <section class="summary avoid-break">
    <div class="words">
      <div class="section-title">Amount in words</div>
      <div class="words-text">${amountInWords(ctx.totals.total, ctx.currency)}</div>
    </div>
    <div class="totals">${totalsRows(ctx)}</div>
  </section>

  ${notesBlock(ctx)}

  <footer class="footer"><span>Thank you for your business!</span><span>${ctx.company.name}</span></footer>
</div>`

  return shell({ title: `${ctx.label} ${ctx.number}`, css, body, fixed: sidebar })
}

// ---------------------------------------------------------------------------
// Bold (black header band + amber accent)
// ---------------------------------------------------------------------------

function boldTemplate(ctx: Ctx): string {
  const c = ctx.colors
  const onPrimary = contrastText(c.primary)
  const bandMuted = mixColors(onPrimary, c.primary, 0.4)
  const bandDim = mixColors(onPrimary, c.primary, 0.55)
  const onPrimaryAccent = accentOn(c.primary, c.accent)
  const css = `
body { color: #111827; background: #ffffff; }
.page-top { height: 10mm; background: ${c.primary}; }
.band { background: ${c.primary}; color: ${onPrimary}; padding: 2mm 16mm 9mm; }
.band-inner { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
.logo { max-height: 46px; max-width: 160px; object-fit: contain; display: block; margin-bottom: 12px; }
.company-name { font-size: 18px; font-weight: 700; letter-spacing: -0.2px; margin-bottom: 2px; }
.band .party-line { font-size: 10.5px; color: ${bandMuted}; }
.title { font-size: 50px; font-weight: 900; letter-spacing: -1.5px; text-transform: uppercase; line-height: 0.95; text-align: right; }
.band .meta { margin-top: 12px; font-size: 11px; color: ${bandMuted}; }
.band .meta-k { color: ${bandDim}; opacity: 1; }
.band .meta-v { color: ${onPrimary}; }
.band .meta-secondary .meta-v { color: ${onPrimaryAccent}; }
.accent { height: 4px; background: ${c.accent}; }
.wrap { padding: 10mm 16mm 0; }

.bill-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 24px; }
.section-title { font-size: 10px; font-weight: 900; letter-spacing: 2.5px; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
.client-name { font-size: 19px; font-weight: 900; letter-spacing: -0.3px; margin-bottom: 2px; }
.party-line { font-size: 11.5px; color: #6b7280; }
.hero { text-align: right; flex: 0 0 auto; padding-left: 20px; border-left: 4px solid ${c.accent}; }
.hero-amount { font-size: 30px; font-weight: 900; letter-spacing: -1px; line-height: 1; font-variant-numeric: tabular-nums; }
.hero-sub { font-size: 11px; color: #6b7280; margin-top: 6px; }
.hero-sub strong { color: #111827; font-weight: 700; }

table.items { margin-bottom: 20px; }
table.items th { padding: 10px 0; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #111827; border-top: 2px solid ${c.primary}; border-bottom: 2px solid ${c.primary}; }
table.items th.num, table.items td.num { padding-left: 10px; }
table.items td { padding: 11px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
table.items td.c-amount { color: #111827; font-weight: 800; }

.totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 26px; }
.totals { width: 78mm; }
.totals .tr { color: #6b7280; }
.totals .tr .num { color: #111827; font-weight: 500; }
.totals .tr-discount, .totals .tr-discount .num { color: #dc2626; }
.totals .tr-total { background: ${c.primary}; color: ${onPrimary}; padding: 11px 14px; margin-top: 8px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
.totals .tr-total .num { color: ${onPrimaryAccent}; font-size: 17px; }
.totals .tr-paid, .totals .tr-paid .num { color: #15803d; }
.totals .tr-balance { background: ${c.primary}; color: ${onPrimary}; padding: 11px 14px; margin-top: 8px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
.totals .tr-balance .num { color: ${onPrimaryAccent}; font-size: 17px; }
/* When a balance row follows, the total steps back so only one row is the hero. */
.totals .tr-total:has(~ .tr-balance) { background: transparent; color: #111827; padding: 10px 0 6px; border-top: 2px solid ${c.primary}; font-size: 13px; }
.totals .tr-total:has(~ .tr-balance) .num { color: #111827; font-size: 14px; }

.payment { border-top: 2px solid ${c.primary}; padding-top: 18px; margin-bottom: 20px; }
.payment .section-title { color: #111827; margin-bottom: 14px; }
.pay-method { font-size: 11px; }
.pay-method-title { color: #111827; font-weight: 800; }
.kv .k { color: #6b7280; }
.upi .qr { border: 2px solid ${c.primary}; border-radius: 0; padding: 3px; }
.notes { margin-bottom: 14px; padding-left: 12px; border-left: 4px solid ${c.accent}; }
.notes + .notes { border-left-color: #d1d5db; }
.notes .section-title { color: #111827; margin-bottom: 4px; }
.notes-text { color: #374151; }
.footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10.5px; color: #9ca3af; }
`

  const heroLabel = ctx.isQuote ? "Quoted Total" : ctx.totals.amountPaid > 0 ? "Balance Due" : "Amount Due"
  const heroAmount = ctx.totals.amountPaid > 0 ? ctx.totals.balanceDue : ctx.totals.total
  const heroSub = ctx.secondaryDate.value
    ? `${ctx.isQuote ? "Valid until" : "Due by"} <strong>${formatDate(ctx.secondaryDate.value, "long")}</strong>`
    : ctx.items.length > 0
      ? `${ctx.items.length} ${ctx.items.length === 1 ? "item" : "items"}`
      : ""

  const body = `<div class="band">
  <div class="band-inner">
    <div>
      ${ctx.logo ? `<img class="logo" src="${ctx.logo}" alt="Logo">` : ""}
      <div class="company-name">${ctx.company.name}</div>
      ${partyLines(ctx.company, { gstLabel: "GST" })}
    </div>
    <div>
      <div class="title">${ctx.label}</div>
      <div class="meta">${metaRows(ctx, "short", { numberLabel: "No." })}</div>
      ${ctx.statusBadge ? `<div style="text-align:right;margin-top:8px">${ctx.statusBadge}</div>` : ""}
    </div>
  </div>
</div>
<div class="accent"></div>
<div class="wrap">
  <section class="bill-row avoid-break">
    <div>
      <div class="section-title">Bill To</div>
      <div class="client-name">${ctx.client.name}</div>
      ${partyLines(ctx.client, { gstLabel: "GST" })}
    </div>
    <div class="hero">
      <div class="section-title">${heroLabel}</div>
      <div class="hero-amount">${ctx.money(heroAmount)}</div>
      ${heroSub ? `<div class="hero-sub">${heroSub}</div>` : ""}
    </div>
  </section>

  ${itemsTable(ctx)}

  <div class="totals-wrap"><div class="totals">${totalsRows(ctx)}</div></div>

  ${paymentBlock(ctx)}
  ${notesBlock(ctx)}

  <footer class="footer"><span>Thank you for your business!</span><span class="mono">${ctx.number}</span></footer>
</div>`

  return shell({ title: `${ctx.label} ${ctx.number}`, css, body })
}

// ---------------------------------------------------------------------------
// Amount in words (used by the tax and executive templates)
// ---------------------------------------------------------------------------

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
]
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

function belowThousand(n: number): string {
  const parts: string[] = []
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`)
    n %= 100
  }
  if (n >= 20) {
    parts.push(ONES[n % 10] ? `${TENS[Math.floor(n / 10)]}-${ONES[n % 10]}` : TENS[Math.floor(n / 10)])
  } else if (n > 0) {
    parts.push(ONES[n])
  }
  return parts.join(" ")
}

function integerToWords(n: number, indian: boolean): string {
  if (n === 0) return "Zero"
  const scales: [number, string][] = indian
    ? [
        [1e7, "Crore"],
        [1e5, "Lakh"],
        [1e3, "Thousand"],
      ]
    : [
        [1e12, "Trillion"],
        [1e9, "Billion"],
        [1e6, "Million"],
        [1e3, "Thousand"],
      ]
  const parts: string[] = []
  let rest = n
  for (const [value, name] of scales) {
    if (rest >= value) {
      const count = Math.floor(rest / value)
      parts.push(`${indian && count >= 1000 ? integerToWords(count, indian) : belowThousand(count)} ${name}`)
      rest %= value
    }
  }
  if (rest > 0) parts.push(belowThousand(rest))
  return parts.join(" ")
}

const CURRENCY_WORDS: Record<string, { major: string; minor: string }> = {
  INR: { major: "Rupees", minor: "Paise" },
  USD: { major: "Dollars", minor: "Cents" },
  EUR: { major: "Euros", minor: "Cents" },
  GBP: { major: "Pounds", minor: "Pence" },
  CAD: { major: "Canadian Dollars", minor: "Cents" },
  AUD: { major: "Australian Dollars", minor: "Cents" },
  JPY: { major: "Yen", minor: "Sen" },
  CNY: { major: "Yuan", minor: "Fen" },
  CHF: { major: "Swiss Francs", minor: "Rappen" },
  SGD: { major: "Singapore Dollars", minor: "Cents" },
  AED: { major: "Dirhams", minor: "Fils" },
  SAR: { major: "Riyals", minor: "Halalas" },
  MXN: { major: "Pesos", minor: "Centavos" },
  BRL: { major: "Reais", minor: "Centavos" },
  ZAR: { major: "Rand", minor: "Cents" },
}

export function amountInWords(amount: number, currency: string): string {
  if (!Number.isFinite(amount)) return ""
  const words = CURRENCY_WORDS[currency] ?? { major: currency, minor: "Cents" }
  const abs = Math.abs(amount)
  const major = Math.floor(abs)
  const minor = Math.round((abs - major) * 100)
  const indian = currency === "INR"
  let text = `${integerToWords(major, indian)} ${words.major}`
  if (minor > 0) text += ` and ${integerToWords(minor, indian)} ${words.minor}`
  return `${amount < 0 ? "Minus " : ""}${text} Only`
}
