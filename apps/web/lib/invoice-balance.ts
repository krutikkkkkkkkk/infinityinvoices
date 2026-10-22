// Balance maths shared by server and client code (no server-only imports).
// `amount_paid` is the sum of recorded payments and `credit_total` the sum of issued
// credit notes; both are denormalised onto the document by syncInvoiceSettlement.

export type InvoiceBalanceInput = {
  grand_total: number | string | null
  amount_paid?: number | string | null
  credit_total?: number | string | null
}

export function roundMoney(value: number | string | null | undefined) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

export function getInvoiceBalance(doc: InvoiceBalanceInput) {
  const total = roundMoney(doc.grand_total)
  const paid = Math.max(0, roundMoney(doc.amount_paid))
  const credited = Math.max(0, roundMoney(doc.credit_total))
  const settled = roundMoney(paid + credited)
  const remaining = Math.max(0, roundMoney(total - settled))
  return {
    total,
    paid,
    credited,
    settled,
    remaining,
    /** Nothing left to collect (payments and credits cover the total). */
    isSettled: remaining <= 0,
    /** Some money or credit has been applied but a balance is still open. */
    isPartial: settled > 0 && remaining > 0,
  }
}
