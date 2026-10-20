import type { DocumentType } from "./types"

export function getDocumentLabel(type: DocumentType): string {
  return type === "quotation" ? "Quotation" : "Invoice"
}

export function getPaymentTermsLabel(type: DocumentType): string {
  return type === "quotation" ? "Quote Validity" : "Payment Terms"
}

export function getDueDateLabel(type: DocumentType): string {
  return type === "quotation" ? "Valid Until" : "Due Date"
}

export function getDocumentActionLabel(type: DocumentType): string {
  return type === "quotation" ? "Accept Quote" : "Pay Invoice"
}

export function showPaymentMethods(type: DocumentType): boolean {
  return type === "invoice"
}

export function showPaymentReminders(type: DocumentType): boolean {
  return type === "invoice"
}

export const QUOTATION_LABELS = {
  title: "Quotation",
  validUntil: "Valid Until",
  acceptanceStatus: "Acceptance Status",
  acceptedDate: "Accepted Date",
  rejectedDate: "Rejected Date",
}

export const INVOICE_LABELS = {
  title: "Invoice",
  dueDate: "Due Date",
  paymentStatus: "Payment Status",
  paidDate: "Paid Date",
  overdue: "Overdue",
}
