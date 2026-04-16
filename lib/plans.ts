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
    description: "Perfect for getting started",
    priceInCents: 0,
    features: [
      "3 invoices per month",
      "3 quotations per month",
      "5 clients",
      "PDF downloads",
      "Standard templates",
      "Share invoices via link",
    ],
    limits: {
      invoicesPerMonth: 3,
      quotationsPerMonth: 3,
      emailsPerMonth: 0, // Email is Pro-only
      clients: 5,
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    priceInCents: 500, // $5/month
    features: [
      "Unlimited invoices",
      "Unlimited quotations",
      "Unlimited clients",
      "Email invoices to clients",
      "Unlimited email sending",
      "Automated payment reminders",
      "Priority support",
      "Custom branding",
      "Custom invoice numbers",
      "Advanced analytics",
      "Bulk operations",
    ],
    limits: {
      invoicesPerMonth: -1, // -1 means unlimited
      quotationsPerMonth: -1,
      emailsPerMonth: -1,
      clients: -1,
    },
  },
  {
    id: "lifetime",
    name: "Lifetime",
    description: "One-time payment, forever",
    priceInCents: 4900, // $49 one-time
    priceBillingCycle: "one-time",
    features: [
      "Unlimited invoices forever",
      "Unlimited quotations forever",
      "Unlimited clients forever",
      "Email invoices to clients",
      "Unlimited email sending",
      "Automated payment reminders",
      "Priority support",
      "Custom branding",
      "Custom invoice numbers",
      "Advanced analytics",
      "Bulk operations",
      "Lifetime updates included",
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
export const PRO_PLAN = PLANS.find((p) => p.id === "pro")!
export const LIFETIME_PLAN = PLANS.find((p) => p.id === "lifetime")!
