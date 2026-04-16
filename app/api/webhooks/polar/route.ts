import { Webhooks } from "@polar-sh/nextjs"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper to determine plan from product ID
function getPlanFromProductId(productId: string): string {
  const lifetimeProductId = process.env.NEXT_PUBLIC_POLAR_LIFETIME_PRODUCT_ID
  if (lifetimeProductId && productId === lifetimeProductId) {
    return "lifetime"
  }
  return "pro"
}

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

    // Determine plan based on product ID
    const productId = subscription.productId || subscription.product?.id
    const plan = productId ? getPlanFromProductId(productId) : "pro"

    // Upsert subscription record
    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      user_id: user.id,
      polar_customer_id: subscription.customer.id,
      polar_subscription_id: subscription.id,
      plan: plan,
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

    console.log("[Polar] Subscription created for user:", user.id, "plan:", plan)
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

  onCheckoutCreated: async (payload) => {
    console.log("[Polar] Checkout created:", payload.data.id)
  },

  onCheckoutUpdated: async (payload) => {
    const checkout = payload.data
    console.log("[Polar] Checkout updated:", checkout.id, checkout.status)
    
    // Handle successful one-time purchase (lifetime plan)
    if (checkout.status === "succeeded" && checkout.productId) {
      const plan = getPlanFromProductId(checkout.productId)
      
      // Only process lifetime (one-time) purchases here
      if (plan === "lifetime" && checkout.customerEmail) {
        // Find user by email
        const { data: users } = await supabaseAdmin.auth.admin.listUsers()
        const user = users.users.find(u => u.email === checkout.customerEmail)
        
        if (!user) {
          console.error("[Polar] No user found for email:", checkout.customerEmail)
          return
        }

        // Check if already has lifetime
        const { data: existing } = await supabaseAdmin
          .from("subscriptions")
          .select("plan")
          .eq("user_id", user.id)
          .single()

        if (existing?.plan === "lifetime") {
          console.log("[Polar] User already has lifetime plan:", user.id)
          return
        }

        // Create lifetime subscription record
        const { error } = await supabaseAdmin.from("subscriptions").upsert({
          user_id: user.id,
          polar_customer_id: checkout.customerId || null,
          polar_subscription_id: checkout.id, // Use checkout ID for one-time purchases
          plan: "lifetime",
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: null, // Lifetime has no end
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        })
        
        if (error) {
          console.error("[Polar] Error creating lifetime subscription:", error)
        } else {
          console.log("[Polar] Lifetime subscription created for user:", user.id)
        }
      }
    }
  },

  onOrderCreated: async (payload) => {
    const order = payload.data
    console.log("[Polar] Order created:", order.id)
    
    // Handle one-time purchase order (alternative webhook for lifetime plan)
    if (order.productId) {
      const plan = getPlanFromProductId(order.productId)
      
      if (plan === "lifetime" && order.customer?.email) {
        // Find user by email
        const { data: users } = await supabaseAdmin.auth.admin.listUsers()
        const user = users.users.find(u => u.email === order.customer?.email)
        
        if (!user) {
          console.error("[Polar] No user found for email:", order.customer?.email)
          return
        }

        // Check if already has lifetime
        const { data: existing } = await supabaseAdmin
          .from("subscriptions")
          .select("plan")
          .eq("user_id", user.id)
          .single()

        if (existing?.plan === "lifetime") {
          console.log("[Polar] User already has lifetime plan:", user.id)
          return
        }

        // Create lifetime subscription record
        const { error } = await supabaseAdmin.from("subscriptions").upsert({
          user_id: user.id,
          polar_customer_id: order.customerId || null,
          polar_subscription_id: order.id,
          plan: "lifetime",
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        })
        
        if (error) {
          console.error("[Polar] Error creating lifetime subscription:", error)
        } else {
          console.log("[Polar] Lifetime subscription created for user:", user.id)
        }
      }
    }
  },
})
