import { Webhooks } from "@dodopayments/nextjs"
import type { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
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

// Find the Supabase user for a purchase: checkout metadata first, then the customer's email
async function resolveUserId(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  metadata: Record<string, unknown> | undefined,
  email: string,
): Promise<string | null> {
  const metadataUserId = typeof metadata?.user_id === "string" ? metadata.user_id : null
  if (metadataUserId) return metadataUserId

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .limit(1)
    .maybeSingle()

  return profile?.id ?? null
}

async function syncSubscription(subscription: DodoSubscription) {
  // Events for products other than our plans must not change anyone's plan
  const product = getPlanFromProductId(subscription.product_id)
  if (!product) {
    console.warn("[Dodo] Ignoring subscription for unknown product:", subscription.product_id, subscription.subscription_id)
    return
  }

  const supabaseAdmin = createAdminClient()

  const userId = await resolveUserId(supabaseAdmin, subscription.metadata, subscription.customer.email)
  if (!userId) {
    console.error("[Dodo] No user found for subscription:", subscription.subscription_id, subscription.customer.email)
    return
  }

  // Never let a subscription event downgrade an active lifetime plan
  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status, dodo_subscription_id")
    .eq("user_id", userId)
    .maybeSingle()

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

  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      dodo_customer_id: subscription.customer.customer_id,
      dodo_subscription_id: subscription.subscription_id,
      plan,
      status,
      current_period_start: toIso(subscription.previous_billing_date),
      current_period_end: toIso(subscription.next_billing_date),
      cancel_at_period_end: subscription.cancel_at_next_billing_date,
      billing_interval: product.billingInterval,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  if (error) {
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

  const supabaseAdmin = createAdminClient()

  const userId = await resolveUserId(supabaseAdmin, payment.metadata, payment.customer.email)
  if (!userId) {
    console.error("[Dodo] No user found for payment:", payment.payment_id, payment.customer.email)
    return
  }

  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle()

  if (existing?.plan === "lifetime") {
    console.log("[Dodo] User already has lifetime plan:", userId)
    return
  }

  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      dodo_customer_id: payment.customer.customer_id,
      dodo_subscription_id: payment.payment_id, // Use payment ID for one-time purchases
      plan: "lifetime",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: null, // Lifetime has no end
      cancel_at_period_end: false,
      billing_interval: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  if (error) {
    console.error("[Dodo] Error creating lifetime subscription:", error)
  } else {
    console.log("[Dodo] Lifetime subscription created for user:", userId)
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
