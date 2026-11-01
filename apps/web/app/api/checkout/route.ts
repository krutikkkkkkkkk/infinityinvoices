import { NextRequest, NextResponse } from "next/server"
import { db, eq, subscriptions } from "@infinity/db"
import { getCurrentUser } from "@/lib/auth/server"
import { getDodo, getProductIdForPlan, type CheckoutPlan } from "@/lib/dodo"

// GET /api/checkout?plan=pro|lifetime
// Creates a Dodo Payments checkout session for the signed-in user and redirects to it.
export async function GET(request: NextRequest) {
  const pricingUrl = (query: string) => new URL(`/dashboard/plan?${query}`, request.url)

  const plan = request.nextUrl.searchParams.get("plan") as CheckoutPlan | null
  if (plan !== "pro" && plan !== "lifetime") {
    return NextResponse.redirect(pricingUrl("error=invalid_plan"))
  }

  const productId = getProductIdForPlan(plan)
  if (!productId) {
    console.error("[Dodo] Missing product ID for plan:", plan)
    return NextResponse.redirect(pricingUrl("error=checkout_failed"))
  }

  const user = await getCurrentUser()
  if (!user?.email) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Reuse the Dodo customer if this user has bought before
  const [subscription] = await db
    .select({ dodo_customer_id: subscriptions.dodo_customer_id })
    .from(subscriptions)
    .where(eq(subscriptions.user_id, user.id))
    .limit(1)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

  try {
    const session = await getDodo().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: subscription?.dodo_customer_id
        ? { customer_id: subscription.dodo_customer_id }
        : { email: user.email, name: user.name || user.email },
      // Read back by the webhook to link the purchase to this user
      metadata: { user_id: user.id, plan },
      return_url: `${siteUrl}/dashboard/plan?success=true`,
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
