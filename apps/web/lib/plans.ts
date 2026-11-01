import type { TemplateType } from "./generate-document-html"

export interface Plan {
  id: string
  name: string
  description: string
  priceInCents: number
  priceBillingCycle?: string // For non-recurring plans
  features: string[]
  /** Features this plan does not include, shown struck through on pricing pages. */
  excludedFeatures?: string[]
  limits: {
    invoicesPerMonth: number
    quotationsPerMonth: number
    emailsPerMonth: number
    clients: number // -1 means unlimited
  }
  /** Templates this plan may use; "all" means every template. */
  templates: readonly TemplateType[] | "all"
  /** Company logo on documents. */
  customBranding: boolean
  /** Public share links for documents. */
  shareLinks: boolean
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
      "Up to 10 clients",
      "4 of 6 templates",
      "PDF downloads",
      "UPI QR codes",
      "Multi-currency support",
    ],
    excludedFeatures: ["Custom branding (your logo & colours)", "Share invoices via link", "Email sending & payment reminders"],
    limits: {
      invoicesPerMonth: 5,
      quotationsPerMonth: 5,
      emailsPerMonth: 0, // email sending is Pro-only (enforced in the send routes)
      clients: 10, // enforced on the server by addClient (app/dashboard/clients/actions.ts)
    },
    templates: ["classic", "minimal", "tax", "dark"],
    customBranding: false,
    shareLinks: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    priceInCents: 500, // $5/month — must match the Dodo product price
    priceBillingCycle: "month",
    features: [
      "Unlimited invoices per month",
      "Unlimited quotations",
      "Unlimited clients",
      "All 6 templates",
      "Custom branding (your logo & colours)",
      "Share invoices via link",
      "Unlimited email sending",
    ],
    limits: {
      invoicesPerMonth: -1,
      quotationsPerMonth: -1,
      emailsPerMonth: -1,
      clients: -1,
    },
    templates: "all",
    customBranding: true,
    shareLinks: true,
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

// Pro billed yearly: a separate Dodo product, but the same "pro" plan and limits.
export const PRO_YEARLY = {
  priceInCents: 3000, // $30/year — must match the Dodo yearly product price
  compareAtPriceInCents: 3600, // the pre-discount price, shown struck through
  billingCycle: "year",
} as const

/** "$5" for whole dollars, "$2.50" otherwise. */
export function formatUsd(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`
}

export function getProPlan(): Plan {
  return PLANS.find((p) => p.id === "pro")!
}

export function canUseTemplate(plan: Plan, template: string): boolean {
  return plan.templates === "all" || (plan.templates as readonly string[]).includes(template)
}

/** The template to render for this plan: the requested one if allowed, otherwise Classic. */
export function allowedTemplate<T extends TemplateType>(plan: Plan, template: T): T | "classic" {
  return canUseTemplate(plan, template) ? template : "classic"
}

/** Strips branding the plan doesn't include, so documents render the same in previews, PDFs and emails. */
export function applyBranding<T extends { logo_url?: string | null }>(plan: Plan, profile: T | null): T | null {
  if (!profile || plan.customBranding) return profile
  return { ...profile, logo_url: null }
}

/** Custom template colours are part of custom branding: Free plans get the template defaults. */
export function allowedColors<T>(plan: Plan, colors: T | null | undefined): T | null {
  return plan.customBranding && colors ? colors : null
}

export function canAddClient(plan: Plan, currentCount: number): boolean {
  return plan.limits.clients === -1 || currentCount < plan.limits.clients
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
