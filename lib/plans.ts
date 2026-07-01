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
    description: "3 invoices per month",
    priceInCents: 0,
    features: [
      "3 invoices per month",
      "Unlimited quotations",
      "Unlimited clients",
      "Email invoices to clients",
      "All templates unlocked",
      "PDF downloads",
      "Custom branding",
      "Multi-currency support",
      "Share invoices via link",
    ],
    limits: {
      invoicesPerMonth: 3,
      quotationsPerMonth: -1, // -1 means unlimited
      emailsPerMonth: 10,
      clients: -1,
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    priceInCents: 99900, // $999/month - can be adjusted
    priceBillingCycle: "month",
    polarProductId: "prod_pro", // Will be set after creating in Polar
    features: [
      "Unlimited invoices per month",
      "Unlimited quotations",
      "Unlimited clients",
      "Unlimited email sending",
    ],
    limits: {
      invoicesPerMonth: -1,
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

// Direct exports for convenience
export const FREE_PLAN = PLANS.find((p) => p.id === "free")!
export const PRO_PLAN = PLANS.find((p) => p.id === "pro")!

export function getProPlan(): Plan {
  return PLANS.find((p) => p.id === "pro")!
}
