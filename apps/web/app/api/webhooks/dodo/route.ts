import { Webhooks } from "@dodopayments/nextjs"
import type { NextRequest } from "next/server"
import { authUsers, db, eq, sql, subscriptions } from "@infinity/db"
import { getPlanFromProductId } from "@/lib/dodo"

type DodoCustomer = { customer_id: string; email: string }
type DodoDate = Date | string | null | undefined

// The fields of Dodo's webhook payloads this route reads
type DodoSubscription = {
  subscription_id: string
  status: "pending" | "active" | "on_hold" | "paused" | "cancelled" | "failed" | "expired"
  product_id: string
  customer: DodoCustomer
  metadata?: Record<string, unknown>
  previous_billing_date: DodoDate
  next_billing_date: DodoDate
  cancel_at_next_billing_date: boolean
}

type DodoPayment = {
  payment_id: string
  subscription_id?: string | null
  product_cart?: { product_id: string; quantity: number }[] | null
  customer: DodoCustomer
  metadata?: Record<string, unknown>
}

function toIso(date: DodoDate): string | null {
  return date ? new Date(date).toISOString() : null
}

// Dodo uses "cancelled"; the rest of the app uses "canceled"
function toAppStatus(status: DodoSubscription["status"]): string {
  return status === "cancelled" ? "canceled" : status
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Find the Neon Auth user for a purchase: checkout metadata first, then the customer's email
async function resolveUserId(metadata: Record<string, unknown> | undefined, email: string): Promise<string | null> {
  const metadataUserId = typeof metadata?.user_id === "string" && UUID.test(metadata.user_id) ? metadata.user_id : null
  if (metadataUserId) return metadataUserId

  const [user] = await db
    .select({ id: authUsers.id })
    .from(authUsers)
    .where(sql`lower(${authUsers.email}) = lower(${email})`)
    .limit(1)

  return user?.id ?? null
}

async function getSubscription(userId: string) {
  const [existing] = await db
    .select({ plan: subscriptions.plan, status: subscriptions.status, dodo_subscription_id: subscriptions.dodo_subscription_id })
    .from(subscriptions)
    .where(eq(subscriptions.user_id, userId))
    .limit(1)
  return existing
}

async function syncSubscription(subscription: DodoSubscription) {
  // Events for products other than our plans must not change anyone's plan
  const product = getPlanFromProductId(subscription.product_id)
  if (!product) {
    console.warn("[Dodo] Ignoring subscription for unknown product:", subscription.product_id, subscription.subscription_id)
    return
  }

  const userId = await resolveUserId(subscription.metadata, subscription.customer.email)
  if (!userId) {
    console.error("[Dodo] No user found for subscription:", subscription.subscription_id, subscription.customer.email)
    return
  }

  // Never let a subscription event downgrade an active lifetime plan
  const existing = await getSubscription(userId)

  if (
    existing?.plan === "lifetime" &&
    existing.status === "active" &&
    existing.dodo_subscription_id !== subscription.subscription_id
  ) {
    console.log("[Dodo] Ignoring subscription event for lifetime user:", userId)
    return
  }

  const status = toAppStatus(subscription.status)
  const plan = subscription.status === "expired" ? "free" : product.plan

  const values = {
    dodo_customer_id: subscription.customer.customer_id,
    dodo_subscription_id: subscription.subscription_id,
    plan,
    status,
    current_period_start: toIso(subscription.previous_billing_date),
    current_period_end: toIso(subscription.next_billing_date),
    cancel_at_period_end: subscription.cancel_at_next_billing_date,
    billing_interval: product.billingInterval,
  }

  try {
    await db
      .insert(subscriptions)
      .values({ user_id: userId, ...values })
      .onConflictDoUpdate({ target: subscriptions.user_id, set: values })
  } catch (error) {
    console.error("[Dodo] Error upserting subscription:", error)
    return
  }

  console.log("[Dodo] Subscription synced:", subscription.subscription_id, "user:", userId, "plan:", plan, "interval:", product.billingInterval, "status:", status)
}

// One-time purchases (lifetime plan) arrive as payments without a subscription
async function handleOneTimePayment(payment: DodoPayment) {
  if (payment.subscription_id) return

  const lifetimeProductId = process.env.NEXT_PUBLIC_DODO_LIFETIME_PRODUCT_ID
  const isLifetime = !!lifetimeProductId && !!payment.product_cart?.some((item) => item.product_id === lifetimeProductId)
  if (!isLifetime) return

  const userId = await resolveUserId(payment.metadata, payment.customer.email)
  if (!userId) {
    console.error("[Dodo] No user found for payment:", payment.payment_id, payment.customer.email)
    return
  }

  const existing = await getSubscription(userId)

  if (existing?.plan === "lifetime") {
    console.log("[Dodo] User already has lifetime plan:", userId)
    return
  }

  const values = {
    dodo_customer_id: payment.customer.customer_id,
    dodo_subscription_id: payment.payment_id, // Use payment ID for one-time purchases
    plan: "lifetime",
    status: "active",
    current_period_start: new Date().toISOString(),
    current_period_end: null, // Lifetime has no end
    cancel_at_period_end: false,
    billing_interval: null,
  }

  try {
    await db
      .insert(subscriptions)
      .values({ user_id: userId, ...values })
      .onConflictDoUpdate({ target: subscriptions.user_id, set: values })
    console.log("[Dodo] Lifetime subscription created for user:", userId)
  } catch (error) {
    console.error("[Dodo] Error creating lifetime subscription:", error)
  }
}

const createHandler = () => Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,

  // The adapter has already verified the signature and validated the payload against the event's schema.
  // The casts are needed because Dodo's payload type includes a catch-all member that `type` can't narrow out.
  onPayload: async (payload) => {
    switch (payload.type) {
      case "subscription.active":
      case "subscription.renewed":
      case "subscription.updated":
      case "subscription.plan_changed":
      case "subscription.on_hold":
      case "subscription.paused":
      case "subscription.unpaused":
      case "subscription.cancelled":
      case "subscription.failed":
      case "subscription.expired":
        await syncSubscription(payload.data as DodoSubscription)
        break

      case "payment.succeeded":
        await handleOneTimePayment(payload.data as DodoPayment)
        break
    }
  },
})

// Created on the first request: Webhooks() throws on an empty key, which would break `next build`
let handler: ReturnType<typeof createHandler> | null = null

export async function POST(req: NextRequest) {
  handler ??= createHandler()
  return handler(req)
}
