export function formatDate(date: string | null | undefined) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}

export function formatMoney(amount: number | string | null | undefined, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export function monthKey(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

/** Labels for the last `count` months, oldest first. */
export function lastMonths(count: number) {
  const months: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    months.push(monthKey(d))
  }
  return months
}
