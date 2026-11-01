import { NextResponse, type NextRequest } from "next/server"
import { db, eq, subscriptions } from "@infinity/db"
import { getCurrentUser } from "@/lib/auth/server"
import { getDodo } from "@/lib/dodo"

// GET /api/portal — opens the Dodo Payments customer portal for the signed-in user.
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  const [subscription] = await db
    .select({ dodo_customer_id: subscriptions.dodo_customer_id })
    .from(subscriptions)
    .where(eq(subscriptions.user_id, user.id))
    .limit(1)

  if (!subscription?.dodo_customer_id) {
    return NextResponse.redirect(new URL("/dashboard/plan", req.url))
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin
  try {
    const session = await getDodo().customers.customerPortal.create(subscription.dodo_customer_id, {
      return_url: `${siteUrl}/dashboard/plan`,
    })
    return NextResponse.redirect(session.link)
  } catch (error) {
    console.error("[Dodo] Error creating customer portal session:", error)
    return NextResponse.redirect(new URL("/dashboard/plan?error=portal_failed", req.url))
  }
}
