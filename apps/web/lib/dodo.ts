import "server-only"
import DodoPayments from "dodopayments"

export type DodoEnvironment = "live_mode" | "test_mode"

// Defaults to live in production builds and test mode elsewhere.
export function getDodoEnvironment(): DodoEnvironment {
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT
  if (env === "live_mode" || env === "test_mode") return env
  return process.env.NODE_ENV === "production" ? "live_mode" : "test_mode"
}

let client: DodoPayments | null = null

// Created lazily so a missing API key doesn't break `next build`.
export function getDodo(): DodoPayments {
  if (!client) {
    client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: getDodoEnvironment(),
    })
  }
  return client
}

/** What's stored in `subscriptions.plan` for paying users. */
export type PaidPlan = "pro" | "lifetime"
export type BillingInterval = "month"
/** What a user can start checkout for: monthly Pro or the one-time Lifetime product. */
export type CheckoutPlan = PaidPlan

export function getProductIdForPlan(plan: CheckoutPlan): string | undefined {
  switch (plan) {
    case "lifetime":
      return process.env.NEXT_PUBLIC_DODO_LIFETIME_PRODUCT_ID
    case "pro":
      return process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID
  }
}

// Returns null for products that aren't one of our configured plans, so they never grant access.
export function getPlanFromProductId(
  productId: string | null | undefined,
): { plan: PaidPlan; billingInterval: BillingInterval | null } | null {
  if (!productId) return null
  if (productId === getProductIdForPlan("lifetime")) return { plan: "lifetime", billingInterval: null }
  if (productId === getProductIdForPlan("pro")) return { plan: "pro", billingInterval: "month" }
  return null
}
