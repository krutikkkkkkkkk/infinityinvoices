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

export type PaidPlan = "pro" | "lifetime"

export function getProductIdForPlan(plan: PaidPlan): string | undefined {
  return plan === "lifetime"
    ? process.env.NEXT_PUBLIC_DODO_LIFETIME_PRODUCT_ID
    : process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID
}

export function getPlanFromProductId(productId: string | null | undefined): PaidPlan {
  const lifetimeProductId = process.env.NEXT_PUBLIC_DODO_LIFETIME_PRODUCT_ID
  if (lifetimeProductId && productId === lifetimeProductId) {
    return "lifetime"
  }
  return "pro"
}
