import { CURRENCIES } from "@/lib/types"

export function currencySymbol(currency: string) {
  return CURRENCIES.find((c) => c.value === currency)?.symbol ?? ""
}

/** Full money value, e.g. ₹1,23,456.00 */
export function formatMoney(amount: number, currency: string, fractionDigits = 2) {
  return `${currencySymbol(currency)}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`
}

/** Short money value for axes and tight spaces, e.g. ₹1.2L / $12K */
export function formatMoneyCompact(amount: number, currency: string) {
  return `${currencySymbol(currency)}${amount.toLocaleString(currency === "INR" ? "en-IN" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  })}`
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const [y, m, d] = value.slice(0, 10).split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}
