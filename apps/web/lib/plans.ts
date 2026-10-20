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
    description: "For trying things out",
    priceInCents: 0,
    features: [
      "5 invoices per month",
      "5 quotations per month",
      "Unlimited clients",
      "All templates unlocked",
      "PDF downloads",
      "Custom branding",
      "Multi-currency support",
      "Share invoices via link",
    ],
    limits: {
      invoicesPerMonth: 5,
      quotationsPerMonth: 5,
      emailsPerMonth: 0, // email sending is Pro-only (enforced in the send routes)
      clients: -1, // -1 means unlimited
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    priceInCents: 500, // $5/month — must match the Dodo product price
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

type SubscriptionLike = { plan?: string | null; status?: string | null } | null | undefined

/** Pro and Lifetime count as paid only while the subscription is active. */
export function hasPaidPlan(subscription: SubscriptionLike): boolean {
  return (subscription?.plan === "pro" || subscription?.plan === "lifetime") && subscription?.status === "active"
}

/** The plan whose limits apply to this subscription; Lifetime gets Pro limits. */
export function getPlanForSubscription(subscription: SubscriptionLike): Plan {
  return hasPaidPlan(subscription) ? PRO_PLAN : FREE_PLAN
}
