// Marketing copy for the pricing section. Keep prices and limits in sync with apps/web/lib/plans.ts
// and the product prices in Dodo.
export const LIFETIME_PRICE = "$29"

export const LANDING_PLANS = [
  {
    id: "free",
    name: "Free",
    description: "For trying it, or for the very occasional invoice.",
    price: "$0",
    period: "forever",
    cta: "Start free",
    path: "/auth/sign-up",
    highlighted: false,
    features: ["5 invoices a month", "5 quotations a month", "Up to 10 clients", "1 invoice preset", "4 of 6 templates", "PDF download"],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For billing every month without thinking about limits.",
    price: "$5",
    period: "per month",
    cta: "Go Pro",
    path: "/pricing",
    highlighted: false,
    features: [
      "Unlimited invoices & quotations",
      "Unlimited clients",
      "All 6 templates",
      "Your logo & colors",
      "Email sending & reminders",
      "Share invoices via link",
      "Recurring invoices",
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    description: "Pay once and keep Pro for good.",
    price: LIFETIME_PRICE,
    period: "once",
    cta: "Get lifetime access",
    path: "/dashboard/plan",
    highlighted: true,
    features: ["Everything in Pro", "Pay once, keep it forever", "Future features included"],
  },
] as const
