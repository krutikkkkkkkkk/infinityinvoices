import {
  Analytics01Icon,
  CreditCardIcon,
  DashboardSquare01Icon,
  File01Icon,
  MoneyReceive01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"

export const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: DashboardSquare01Icon },
  { href: "/users", label: "Users", icon: UserMultipleIcon },
  { href: "/revenue", label: "Revenue", icon: MoneyReceive01Icon },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCardIcon },
  { href: "/documents", label: "Documents", icon: File01Icon },
  { href: "/analytics", label: "Analytics", icon: Analytics01Icon },
]

export function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
