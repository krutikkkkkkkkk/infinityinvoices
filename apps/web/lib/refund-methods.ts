// Refund method labels, shared by the dashboard (client) and the refund note PDF / email (server).

export const REFUND_METHOD_LABELS: Record<string, string> = {
  original: "Original payment method",
  bank: "Bank transfer",
  upi: "UPI",
  cash: "Cash",
  card: "Card",
  cheque: "Cheque",
  other: "Other",
}

export function refundMethodLabel(method: string | null | undefined): string {
  if (!method) return ""
  return REFUND_METHOD_LABELS[method] || method
}
