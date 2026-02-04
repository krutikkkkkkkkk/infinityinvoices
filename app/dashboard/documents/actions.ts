"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { DocumentFormData, NewLineItem } from "@/lib/types"
import { checkAndIncrementUsage } from "@/lib/usage"

export async function createDocument(formData: DocumentFormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check usage limits
  const usageType = formData.type === "invoice" ? "invoice" : "quotation"
  const { allowed, limit } = await checkAndIncrementUsage(usageType)
  
  if (!allowed) {
    throw new Error(`USAGE_LIMIT_EXCEEDED:You've reached your monthly limit of ${limit} ${usageType}s. Upgrade to Pro for unlimited ${usageType}s.`)
  }

  // Calculate totals
  const lineItemsWithTotals = formData.line_items.map((item) => ({
    ...item,
    line_total: item.quantity * item.rate * (1 + item.tax_percent / 100),
  }))

  const subtotal = lineItemsWithTotals.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  )

  const taxTotal = lineItemsWithTotals.reduce(
    (sum, item) => sum + (item.quantity * item.rate * item.tax_percent) / 100,
    0
  )

  let discountAmount = 0
  if (formData.discount_type === "percentage") {
    discountAmount = (subtotal * formData.discount_value) / 100
  } else if (formData.discount_type === "fixed") {
    discountAmount = formData.discount_value
  }

  const grandTotal = subtotal + taxTotal - discountAmount

  // Create document
  const { data: document, error: docError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      type: formData.type,
      number: formData.number,
      issue_date: formData.issue_date,
      due_date: formData.due_date || null,
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
    })
    .select()
    .single()

  if (docError) {
    throw new Error(docError.message)
  }

  // Create line items
  if (formData.line_items.length > 0) {
    const { error: itemsError } = await supabase.from("line_items").insert(
      lineItemsWithTotals.map((item, index) => ({
        document_id: document.id,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        rate: item.rate,
        tax_percent: item.tax_percent,
        line_total: item.line_total,
        sort_order: index,
      }))
    )

    if (itemsError) {
      // Rollback document creation
      await supabase.from("documents").delete().eq("id", document.id)
      throw new Error(itemsError.message)
    }
  }

  revalidatePath("/dashboard")
  redirect(`/dashboard/documents/${document.id}`)
}

export async function updateDocument(id: string, formData: DocumentFormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Calculate totals
  const lineItemsWithTotals = formData.line_items.map((item) => ({
    ...item,
    line_total: item.quantity * item.rate * (1 + item.tax_percent / 100),
  }))

  const subtotal = lineItemsWithTotals.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  )

  const taxTotal = lineItemsWithTotals.reduce(
    (sum, item) => sum + (item.quantity * item.rate * item.tax_percent) / 100,
    0
  )

  let discountAmount = 0
  if (formData.discount_type === "percentage") {
    discountAmount = (subtotal * formData.discount_value) / 100
  } else if (formData.discount_type === "fixed") {
    discountAmount = formData.discount_value
  }

  const grandTotal = subtotal + taxTotal - discountAmount

  // Update document
  const { error: docError } = await supabase
    .from("documents")
    .update({
      type: formData.type,
      number: formData.number,
      issue_date: formData.issue_date,
      due_date: formData.due_date || null,
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
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (docError) {
    throw new Error(docError.message)
  }

  // Delete existing line items and recreate
  await supabase.from("line_items").delete().eq("document_id", id)

  if (formData.line_items.length > 0) {
    const { error: itemsError } = await supabase.from("line_items").insert(
      lineItemsWithTotals.map((item, index) => ({
        document_id: id,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        rate: item.rate,
        tax_percent: item.tax_percent,
        line_total: item.line_total,
        sort_order: index,
      }))
    )

    if (itemsError) {
      throw new Error(itemsError.message)
    }
  }

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/documents/${id}`)
  redirect(`/dashboard/documents/${id}`)
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function duplicateDocument(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get the original document first to check type
  const { data: originalDoc } = await supabase
    .from("documents")
    .select("type")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!originalDoc) {
    throw new Error("Document not found")
  }

  // Check usage limits before duplicating
  const usageType = originalDoc.type === "invoice" ? "invoice" : "quotation"
  const { allowed, limit } = await checkAndIncrementUsage(usageType)
  
  if (!allowed) {
    throw new Error(`USAGE_LIMIT_EXCEEDED:You've reached your monthly limit of ${limit} ${usageType}s. Upgrade to Pro for unlimited ${usageType}s.`)
  }

  // Get the original document with line items
  const { data: original, error: fetchError } = await supabase
    .from("documents")
    .select("*, line_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !original) {
    throw new Error("Document not found")
  }

  // Generate new number
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("type", original.type)
    .eq("user_id", user.id)

  const prefix = original.type === "invoice" ? "INV" : "QUO"
  const newNumber = `${prefix}-${String((count || 0) + 1).padStart(4, "0")}`

  // Create new document
  const { data: newDoc, error: createError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      type: original.type,
      number: newNumber,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: original.due_date,
      status: "draft",
      currency: original.currency,
      client_id: original.client_id,
      client_name: original.client_name,
      client_email: original.client_email,
      client_address: original.client_address,
      client_gst_id: original.client_gst_id,
      subtotal: original.subtotal,
      tax_total: original.tax_total,
      discount_type: original.discount_type,
      discount_value: original.discount_value,
      grand_total: original.grand_total,
      notes: original.notes,
      terms: original.terms,
      payment_method: original.payment_method,
      upi_id: original.upi_id,
    })
    .select()
    .single()

  if (createError || !newDoc) {
    throw new Error("Failed to duplicate document")
  }

  // Copy line items
  if (original.line_items && original.line_items.length > 0) {
    await supabase.from("line_items").insert(
      original.line_items.map((item: NewLineItem & { sort_order?: number; line_total?: number }, index: number) => ({
        document_id: newDoc.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        tax_percent: item.tax_percent,
        line_total: item.line_total || item.quantity * item.rate * (1 + item.tax_percent / 100),
        sort_order: item.sort_order ?? index,
      }))
    )
  }

  revalidatePath("/dashboard")
  redirect(`/dashboard/documents/${newDoc.id}/edit`)
}

export async function updateDocumentStatus(id: string, status: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const validStatuses = ["draft", "sent", "paid", "overdue", "cancelled"]
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status")
  }

  const { error } = await supabase
    .from("documents")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  // No revalidatePath here - using optimistic updates in the UI
}

export async function convertToInvoice(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check usage limits before converting
  const { allowed, limit } = await checkAndIncrementUsage("invoice")
  
  if (!allowed) {
    throw new Error(`USAGE_LIMIT_EXCEEDED:You've reached your monthly limit of ${limit} invoices. Upgrade to Pro for unlimited invoices.`)
  }

  // Get the quotation
  const { data: quotation, error: fetchError } = await supabase
    .from("documents")
    .select("*, line_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("type", "quotation")
    .single()

  if (fetchError || !quotation) {
    throw new Error("Quotation not found")
  }

  // Generate invoice number
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("type", "invoice")
    .eq("user_id", user.id)

  const newNumber = `INV-${String((count || 0) + 1).padStart(4, "0")}`

  // Create invoice
  const { data: invoice, error: createError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      type: "invoice",
      number: newNumber,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: quotation.due_date,
      status: "draft",
      currency: quotation.currency,
      client_id: quotation.client_id,
      client_name: quotation.client_name,
      client_email: quotation.client_email,
      client_address: quotation.client_address,
      client_gst_id: quotation.client_gst_id,
      subtotal: quotation.subtotal,
      tax_total: quotation.tax_total,
      discount_type: quotation.discount_type,
      discount_value: quotation.discount_value,
      grand_total: quotation.grand_total,
      notes: quotation.notes,
      terms: quotation.terms,
      payment_method: quotation.payment_method,
      upi_id: quotation.upi_id,
    })
    .select()
    .single()

  if (createError || !invoice) {
    throw new Error("Failed to convert to invoice")
  }

  // Copy line items
  if (quotation.line_items && quotation.line_items.length > 0) {
    await supabase.from("line_items").insert(
      quotation.line_items.map((item: NewLineItem & { sort_order?: number; line_total?: number }, index: number) => ({
        document_id: invoice.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        tax_percent: item.tax_percent,
        line_total: item.line_total || item.quantity * item.rate * (1 + item.tax_percent / 100),
        sort_order: item.sort_order ?? index,
      }))
    )
  }

  revalidatePath("/dashboard")
  redirect(`/dashboard/documents/${invoice.id}`)
}
