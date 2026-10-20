import { Plan } from "./plans"

/**
 * Checks if a feature is available for the given plan
 * Currently all features are available for all users
 * This will be used to enforce limits once monetization is enabled
 */
export function canAccessFeature(
  plan: Plan | undefined,
  feature: "invoices" | "quotations" | "emails" | "clients" | "api" | "webhooks" | "team"
): boolean {
  // For now, all features are available to everyone
  // This structure is in place for future enforcement
  return true
}

/**
 * Checks if user has reached their limit for a feature
 * Currently returns false (no limits enforced) since everything is free
 */
export function hasReachedLimit(
  plan: Plan | undefined,
  feature: "invoices" | "quotations" | "emails" | "clients",
  currentCount: number
): boolean {
  if (!plan) return false

  const limits = plan.limits
  const limitValue = limits[`${feature}PerMonth` as keyof typeof limits] as number

  // -1 means unlimited
  if (limitValue === -1) return false

  // If limit is set and count exceeds it
  return currentCount >= limitValue
}

/**
 * Gets the limit for a feature
 * Returns -1 for unlimited
 */
export function getFeatureLimit(
  plan: Plan | undefined,
  feature: "invoices" | "quotations" | "emails" | "clients"
): number {
  if (!plan) return -1
  return plan.limits[`${feature}PerMonth` as keyof typeof plan.limits] as number
}

/**
 * Gets remaining count before hitting limit
 * Returns -1 if unlimited
 */
export function getRemainingCount(
  plan: Plan | undefined,
  feature: "invoices" | "quotations" | "emails" | "clients",
  currentCount: number
): number {
  if (!plan) return -1

  const limitValue = getFeatureLimit(plan, feature)

  // -1 means unlimited
  if (limitValue === -1) return -1

  return Math.max(0, limitValue - currentCount)
}
