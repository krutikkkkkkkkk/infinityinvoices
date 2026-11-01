"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, asc, clients, db, documents, eq, lineItems, products, sql } from "@infinity/db"
import { requireUser } from "@/lib/auth/server"
import { isTemplateType } from "@/lib/generate-document-html"
import { parseTemplateColors } from "@/lib/document-style"
import { getPlanForUser } from "@/lib/plan-server"
import { CURRENCIES, type DocumentFormData, type DocumentStatus, type Product } from "@/lib/types"
import { checkAndIncrementUsage } from "@/lib/usage"

type DocumentRow = typeof documents.$inferSelect
type LineItemRow = typeof lineItems.$inferSelect

/** Totals and the document columns shared by create and update. */
function documentValues(formData: DocumentFormData) {
  // Calculate totals based on include_tax toggle
  const includeTax = formData.include_tax !== false
  const lineItemsWithTotals = formData.line_items.map((item) => ({
    ...item,
    tax_percent: includeTax ? item.tax_percent : 0,
    line_total: item.quantity * item.rate * (includeTax ? (1 + item.tax_percent / 100) : 1),
  }))

  const subtotal = lineItemsWithTotals.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  )

  const taxTotal = includeTax
    ? lineItemsWithTotals.reduce(
        (sum, item) => sum + (item.quantity * item.rate * item.tax_percent) / 100,
        0
      )
    : 0

  let discountAmount = 0
  if (formData.discount_type === "percentage") {
    discountAmount = (subtotal * formData.discount_value) / 100
  } else if (formData.discount_type === "fixed") {
    discountAmount = formData.discount_value
  }

  const grandTotal = subtotal + taxTotal - discountAmount

  const values = {
    type: formData.type,
    number: formData.number,
    issue_date: formData.issue_date,
    due_date: formData.due_date || null,
    valid_until: formData.valid_until || null,
    status: formData.status,
    currency: formData.currency,
    client_id: formData.client_id || null,
    client_name: formData.client_name || null,
    client_email: formData.client_email || null,
    client_address: formData.client_address || null,
    client_gst_id: formData.client_gst_id || null,
    subtotal,
    tax_total: taxTotal,
    discount_type: formData.discount_type,
    discount_value: formData.discount_value,
    grand_total: grandTotal,
    notes: formData.notes || null,
    terms: formData.terms || null,
    payment_methods: formData.payment_methods || [],
    payment_method_type: formData.payment_methods?.[0] || null,
    payment_method: formData.payment_method || null,
    upi_id: formData.upi_id || null,
    paypal_email: formData.paypal_email || null,
    bank_name: formData.bank_name || null,
    bank_account_name: formData.bank_account_name || null,
    bank_account_number: formData.bank_account_number || null,
    bank_routing_number: formData.bank_routing_number || null,
    bank_swift_code: formData.bank_swift_code || null,
    include_tax: includeTax,
  }

  const items = (documentId: string) =>
    lineItemsWithTotals.map((item, index) => ({
      document_id: documentId,
      name: item.name,
      description: item.description || null,
      quantity: item.quantity,
      rate: item.rate,
      tax_percent: item.tax_percent,
      line_total: item.line_total,
      sort_order: index,
    }))

  return { values, items }
}

const DOCUMENT_TYPES: DocumentRow["type"][] = ["invoice", "quotation"]
const DOCUMENT_STATUSES: DocumentStatus[] = ["draft", "sent", "paid", "overdue", "cancelled"]

/**
 * Server-side checks on form input before it is saved: the enum columns are plain text in the
 * database, and client_id must be one of the user's own clients (it is a bare FK, so any user's
 * client id would otherwise be accepted and later joined on).
 */
async function assertValidDocumentInput(userId: string, formData: DocumentFormData) {
  if (!DOCUMENT_TYPES.includes(formData.type)) throw new Error("Invalid document type")
  if (!DOCUMENT_STATUSES.includes(formData.status)) throw new Error("Invalid status")
  if (!CURRENCIES.some((c) => c.value === formData.currency)) throw new Error("Invalid currency")
  if (formData.discount_type != null && formData.discount_type !== "percentage" && formData.discount_type !== "fixed") {
    throw new Error("Invalid discount type")
  }
  if (formData.client_id) {
    const [client] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.id, formData.client_id), eq(clients.user_id, userId)))
      .limit(1)
    if (!client) throw new Error("Client not found")
  }
}

/** Copies a document's content into a new draft (duplicate / quotation → invoice). */
function copyOf(source: DocumentRow, userId: string, type: DocumentRow["type"], number: string) {
  return {
    user_id: userId,
    type,
    number,
    issue_date: new Date().toISOString().split("T")[0],
    due_date: source.due_date,
    status: "draft" as const,
    currency: source.currency,
    client_id: source.client_id,
    client_name: source.client_name,
    client_email: source.client_email,
    client_address: source.client_address,
    client_gst_id: source.client_gst_id,
    subtotal: source.subtotal,
    tax_total: source.tax_total,
    discount_type: source.discount_type,
    discount_value: source.discount_value,
    grand_total: source.grand_total,
    notes: source.notes,
    terms: source.terms,
    payment_method: source.payment_method,
    upi_id: source.upi_id,
    payment_methods: source.payment_methods ?? [],
    payment_method_type: source.payment_method_type ?? null,
    paypal_email: source.paypal_email ?? null,
    bank_name: source.bank_name ?? null,
    bank_account_name: source.bank_account_name ?? null,
    bank_account_number: source.bank_account_number ?? null,
    bank_routing_number: source.bank_routing_number ?? null,
    bank_swift_code: source.bank_swift_code ?? null,
  }
}

function copyLineItems(items: LineItemRow[], documentId: string) {
  return items.map((item, index) => ({
    document_id: documentId,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    tax_percent: item.tax_percent,
    line_total: item.line_total || item.quantity * item.rate * (1 + item.tax_percent / 100),
    sort_order: item.sort_order ?? index,
  }))
}

/** Next sequential number for a document type, e.g. INV-0007. */
async function nextNumber(userId: string, type: DocumentRow["type"]) {
  const count = await db.$count(documents, and(eq(documents.type, type), eq(documents.user_id, userId)))
  const prefix = type === "invoice" ? "INV" : "QUO"
  return `${prefix}-${String(count + 1).padStart(4, "0")}`
}

/** The user's active catalogue items, for adding line items in the document form. */
export async function listActiveProducts(): Promise<Product[]> {
  const user = await requireUser()
  return db
    .select()
    .from(products)
    .where(and(eq(products.user_id, user.id), eq(products.is_active, true)))
    .orderBy(asc(products.name))
}

export async function createDocument(formData: DocumentFormData) {
  const user = await requireUser()
  await assertValidDocumentInput(user.id, formData)

  // Check usage limits
  const usageType = formData.type === "invoice" ? "invoice" : "quotation"
  const { allowed, limit } = await checkAndIncrementUsage(usageType)

  if (!allowed) {
    throw new Error(`USAGE_LIMIT_EXCEEDED:You've reached your monthly limit of ${limit} ${usageType}s. Upgrade to Pro for unlimited ${usageType}s.`)
  }

  const { values, items } = documentValues(formData)

  // Create document
  const [document] = await db
    .insert(documents)
    .values({ ...values, user_id: user.id })
    .returning({ id: documents.id })

  // Create line items
  if (formData.line_items.length > 0) {
    try {
      await db.insert(lineItems).values(items(document.id))
    } catch (error) {
      // Rollback document creation
      await db.delete(documents).where(and(eq(documents.id, document.id), eq(documents.user_id, user.id)))
      throw error
    }
  }

  revalidatePath("/dashboard")
  redirect(`/dashboard/documents/${document.id}`)
}

export async function updateDocument(id: string, formData: DocumentFormData) {
  const user = await requireUser()
  await assertValidDocumentInput(user.id, formData)
  const { values, items } = documentValues(formData)

  // Update document; the returned row proves it belongs to the user before line items are touched
  const updated = await db
    .update(documents)
    .set(values)
    .where(and(eq(documents.id, id), eq(documents.user_id, user.id)))
    .returning({ id: documents.id })

  if (updated.length === 0) {
    throw new Error("Document not found")
  }

  // Delete existing line items and recreate
  await db.delete(lineItems).where(eq(lineItems.document_id, id))

  if (formData.line_items.length > 0) {
    await db.insert(lineItems).values(items(id))
  }

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/documents/${id}`)
  redirect(`/dashboard/documents/${id}`)
}

export async function deleteDocument(id: string) {
  const user = await requireUser()

  await db.delete(documents).where(and(eq(documents.id, id), eq(documents.user_id, user.id)))

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function duplicateDocument(id: string) {
  const user = await requireUser()

  // Get the original document with line items
  const original = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.user_id, user.id)),
    with: { line_items: { orderBy: [asc(lineItems.sort_order)] } },
  })

  if (!original) {
    throw new Error("Document not found")
  }

  // Check usage limits before duplicating
  const usageType = original.type === "invoice" ? "invoice" : "quotation"
  const { allowed, limit } = await checkAndIncrementUsage(usageType)

  if (!allowed) {
    throw new Error(`USAGE_LIMIT_EXCEEDED:You've reached your monthly limit of ${limit} ${usageType}s. Upgrade to Pro for unlimited ${usageType}s.`)
  }

  const newNumber = await nextNumber(user.id, original.type)

  // Create new document
  const [newDoc] = await db
    .insert(documents)
    .values(copyOf(original, user.id, original.type, newNumber))
    .returning({ id: documents.id })

  if (!newDoc) {
    throw new Error("Failed to duplicate document")
  }

  // Copy line items
  if (original.line_items.length > 0) {
    await db.insert(lineItems).values(copyLineItems(original.line_items, newDoc.id))
  }

  revalidatePath("/dashboard")
  redirect(`/dashboard/documents/${newDoc.id}/edit`)
}

export async function updateDocumentStatus(id: string, status: string) {
  const user = await requireUser()

  if (!DOCUMENT_STATUSES.includes(status as DocumentStatus)) {
    throw new Error("Invalid status")
  }

  await db
    .update(documents)
    .set({ status: status as DocumentStatus })
    .where(and(eq(documents.id, id), eq(documents.user_id, user.id)))

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/documents/${id}`)
  revalidatePath("/dashboard/invoices")
  revalidatePath("/dashboard/quotations")
}

export async function convertToInvoice(id: string) {
  const user = await requireUser()

  // Check usage limits before converting
  const { allowed, limit } = await checkAndIncrementUsage("invoice")

  if (!allowed) {
    throw new Error(`USAGE_LIMIT_EXCEEDED:You've reached your monthly limit of ${limit} invoices. Upgrade to Pro for unlimited invoices.`)
  }

  // Get the quotation
  const quotation = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.user_id, user.id), eq(documents.type, "quotation")),
    with: { line_items: { orderBy: [asc(lineItems.sort_order)] } },
  })

  if (!quotation) {
    throw new Error("Quotation not found")
  }

  const newNumber = await nextNumber(user.id, "invoice")

  // Create invoice
  const [invoice] = await db
    .insert(documents)
    .values(copyOf(quotation, user.id, "invoice", newNumber))
    .returning({ id: documents.id })

  if (!invoice) {
    throw new Error("Failed to convert to invoice")
  }

  // Copy line items
  if (quotation.line_items.length > 0) {
    await db.insert(lineItems).values(copyLineItems(quotation.line_items, invoice.id))
  }

  revalidatePath("/dashboard")
  redirect(`/dashboard/documents/${invoice.id}`)
}

/**
 * Turns on the public link for a document (Pro only), or updates the template and colours it
 * renders with. Returns the token for /invoice/[token], or an error (returned rather than thrown so
 * production builds don't mask the message).
 */
export async function enableShareLink(
  id: string,
  style: { template?: unknown; colors?: unknown }
): Promise<{ token: string; error?: never } | { token?: never; error: string }> {
  const user = await requireUser()

  const plan = await getPlanForUser(user.id)
  if (!plan.shareLinks) {
    return { error: "PRO_REQUIRED:Share links are a Pro feature. Upgrade to Pro to share invoices via link." }
  }

  const [row] = await db
    .update(documents)
    .set({
      share_enabled: true,
      share_template: isTemplateType(style.template) ? style.template : "classic",
      share_colors: parseTemplateColors(style.colors) ?? null,
    })
    .where(and(eq(documents.id, id), eq(documents.user_id, user.id)))
    .returning({ share_token: documents.share_token })

  if (!row) {
    return { error: "Document not found" }
  }

  revalidatePath(`/dashboard/documents/${id}`)
  return { token: row.share_token }
}

/** Turns the public link off and replaces its token, so the old URL never works again. */
export async function disableShareLink(id: string) {
  const user = await requireUser()

  await db
    .update(documents)
    .set({ share_enabled: false, share_token: sql`gen_random_uuid()` })
    .where(and(eq(documents.id, id), eq(documents.user_id, user.id)))

  revalidatePath(`/dashboard/documents/${id}`)
}
