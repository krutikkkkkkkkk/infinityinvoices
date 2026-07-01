export interface Plan {
  id: string
  name: string
  description: string
  priceInCents: number
  priceBillingCycle?: string // For non-recurring plans
  polarProductId?: string // Polar Product ID - set after creating in Polar dashboard
  features: string[]
  limits: {
    invoicesPerMonth: number
    quotationsPerMonth: number
    emailsPerMonth: number
    clients: number
  }
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Unlimited access",
    priceInCents: 0,
    features: [
      "Unlimited invoices",
      "Unlimited quotations",
      "Unlimited clients",
      "Email invoices to clients",
      "Unlimited email sending",
      "Automated payment reminders",
      "All templates unlocked",
      "PDF downloads",
      "Custom branding",
      "Custom invoice numbers",
      "Advanced analytics",
      "Bulk operations",
      "Share invoices via link",
      "Multi-currency support",
    ],
    limits: {
      invoicesPerMonth: -1, // -1 means unlimited
      quotationsPerMonth: -1,
      emailsPerMonth: -1,
      clients: -1,
    },
  },
]

export function getPlan(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId)
}

export function getFreePlan(): Plan {
  return PLANS.find((p) => p.id === "free")!
}

export function getProPlan(): Plan {
  return PLANS.find((p) => p.id === "pro")!
}

// Direct exports for convenience
export const FREE_PLAN = PLANS.find((p) => p.id === "free")!
