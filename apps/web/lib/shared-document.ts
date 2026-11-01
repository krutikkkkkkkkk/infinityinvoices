import "server-only"

import { asc, documents, eq, inArray, lineItems, profiles, subscriptions } from "@infinity/db"
import { getShareDb, setShareToken } from "@infinity/db/share"
import { isTemplateType, type DocumentWithItems, type TemplateColors, type TemplateProfile, type TemplateType } from "@/lib/generate-document-html"
import { parseTemplateColors } from "@/lib/document-style"
import { allowedColors, allowedTemplate, applyBranding, getPlanForSubscription, hasPaidPlan } from "@/lib/plans"
import type { Document } from "@/lib/types"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface SharedDocument {
  document: DocumentWithItems
  profile: TemplateProfile | null
  template: TemplateType
  colors: Partial<TemplateColors> | null
}

/**
 * The document behind a public share link, ready to render, or null when the link doesn't work:
 * unknown token, sharing turned off, or the owner no longer on a paid plan.
 *
 * Reads as `share_reader`, so row-level security limits every query to this token's document even
 * if a WHERE clause below were wrong.
 */
export async function loadSharedDocument(token: string): Promise<SharedDocument | null> {
  if (!UUID_REGEX.test(token)) return null

  const db = getShareDb()
  const owner = db.select({ id: documents.user_id }).from(documents).where(eq(documents.share_token, token))
  const [, document, [profile], [subscription]] = await db.batch([
    setShareToken(db, token),
    db.query.documents.findFirst({
      where: eq(documents.share_token, token),
      with: { line_items: { orderBy: [asc(lineItems.sort_order)] } },
    }),
    db
      .select({
        company_name: profiles.company_name,
        company_address: profiles.company_address,
        gst_id: profiles.gst_id,
        email: profiles.email,
        phone: profiles.phone,
        logo_url: profiles.logo_url,
        logo_size: profiles.logo_size,
        upi_id: profiles.upi_id,
        paypal_email: profiles.paypal_email,
        bank_name: profiles.bank_name,
        bank_account_name: profiles.bank_account_name,
        bank_account_number: profiles.bank_account_number,
        bank_routing_number: profiles.bank_routing_number,
        bank_swift_code: profiles.bank_swift_code,
      })
      .from(profiles)
      .where(inArray(profiles.id, owner))
      .limit(1),
    db
      .select({ plan: subscriptions.plan, status: subscriptions.status })
      .from(subscriptions)
      .where(inArray(subscriptions.user_id, owner))
      .limit(1),
  ])

  // Sharing is a Pro feature: a lapsed plan turns the link off until the owner upgrades again
  if (!document || !document.share_enabled || !hasPaidPlan(subscription)) return null

  const plan = getPlanForSubscription(subscription)
  const wantedTemplate = isTemplateType(document.share_template) ? document.share_template : "classic"

  return {
    document: toPublicDocument(document),
    profile: applyBranding(plan, profile ?? null),
    template: allowedTemplate(plan, wantedTemplate),
    colors: allowedColors(plan, parseTemplateColors(document.share_colors)),
  }
}

/** Only the fields the templates render: this object is sent to the visitor's browser. */
function toPublicDocument(row: typeof documents.$inferSelect & { line_items: (typeof lineItems.$inferSelect)[] }): DocumentWithItems {
  return {
    id: "",
    user_id: "",
    client_id: null,
    type: row.type,
    number: row.number,
    issue_date: row.issue_date,
    due_date: row.due_date,
    valid_until: row.valid_until,
    status: row.status,
    currency: row.currency as Document["currency"],
    subtotal: row.subtotal,
    tax_total: row.tax_total,
    discount_type: row.discount_type,
    discount_value: row.discount_value,
    grand_total: row.grand_total,
    include_tax: row.include_tax,
    notes: row.notes,
    terms: row.terms,
    payment_method: row.payment_method,
    payment_methods: row.payment_methods as Document["payment_methods"],
    upi_id: row.upi_id,
    paypal_email: row.paypal_email,
    bank_name: row.bank_name,
    bank_account_name: row.bank_account_name,
    bank_account_number: row.bank_account_number,
    bank_routing_number: row.bank_routing_number,
    bank_swift_code: row.bank_swift_code,
    client_name: row.client_name,
    client_email: row.client_email,
    client_address: row.client_address,
    client_gst_id: row.client_gst_id,
    amount_paid: row.amount_paid,
    credit_total: row.credit_total,
    created_at: row.created_at,
    updated_at: row.updated_at,
    line_items: row.line_items,
  }
}
