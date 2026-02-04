import { Webhooks } from "@polar-sh/nextjs"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  
  onSubscriptionCreated: async (payload) => {
    const { data: subscription } = payload
    
    // Find user by email
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const user = users.users.find(u => u.email === subscription.customer.email)
    
    if (!user) {
      console.error("[Polar] No user found for email:", subscription.customer.email)
      return
    }

    // Upsert subscription record
    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      user_id: user.id,
      polar_customer_id: subscription.customer.id,
      polar_subscription_id: subscription.id,
      plan: "pro",
      status: "active",
      current_period_start: subscription.currentPeriodStart,
      current_period_end: subscription.currentPeriodEnd,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id"
    })
    
    if (error) {
      console.error("[Polar] Error upserting subscription:", error)
    }

    console.log("[Polar] Subscription created for user:", user.id)
  },

  onSubscriptionUpdated: async (payload) => {
    const { data: subscription } = payload

    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_start: subscription.currentPeriodStart,
        current_period_end: subscription.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("polar_subscription_id", subscription.id)

    console.log("[Polar] Subscription updated:", subscription.id)
  },

  onSubscriptionCanceled: async (payload) => {
    const { data: subscription } = payload

    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("polar_subscription_id", subscription.id)

    console.log("[Polar] Subscription canceled:", subscription.id)
  },

  onSubscriptionRevoked: async (payload) => {
    const { data: subscription } = payload

    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "revoked",
        plan: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("polar_subscription_id", subscription.id)

    console.log("[Polar] Subscription revoked:", subscription.id)
  },
})
