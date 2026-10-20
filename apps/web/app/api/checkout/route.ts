import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getLifetimePlanAvailability } from "@/app/actions/lifetime"
import { getDodo, getProductIdForPlan, type PaidPlan } from "@/lib/dodo"

// GET /api/checkout?plan=pro|lifetime
// Creates a Dodo Payments checkout session for the signed-in user and redirects to it.
export async function GET(request: NextRequest) {
  const pricingUrl = (query: string) => new URL(`/dashboard/pricing?${query}`, request.url)

  const plan = request.nextUrl.searchParams.get("plan") as PaidPlan | null
  if (plan !== "pro" && plan !== "lifetime") {
    return NextResponse.redirect(pricingUrl("error=invalid_plan"))
  }

  const productId = getProductIdForPlan(plan)
  if (!productId) {
    console.error("[Dodo] Missing product ID for plan:", plan)
    return NextResponse.redirect(pricingUrl("error=checkout_failed"))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Validate lifetime plan availability before checkout
  if (plan === "lifetime") {
    const availability = await getLifetimePlanAvailability()
    if (!availability.available) {
      return NextResponse.redirect(pricingUrl("error=lifetime_sold_out"))
    }
  }

  // Reuse the Dodo customer if this user has bought before
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("dodo_customer_id")
    .eq("user_id", user.id)
    .maybeSingle()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

  try {
    const session = await getDodo().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: subscription?.dodo_customer_id
        ? { customer_id: subscription.dodo_customer_id }
        : { email: user.email, name: user.user_metadata?.full_name || user.email },
      // Read back by the webhook to link the purchase to this user
      metadata: { user_id: user.id, plan },
      return_url: `${siteUrl}/dashboard/pricing?success=true`,
    })

    if (!session.checkout_url) {
      throw new Error(`No checkout URL returned for session ${session.session_id}`)
    }

    return NextResponse.redirect(session.checkout_url)
  } catch (error) {
    console.error("[Dodo] Error creating checkout session:", error)
    return NextResponse.redirect(pricingUrl("error=checkout_failed"))
  }
}
