import { CustomerPortal } from "@polar-sh/nextjs"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDodo } from "@/lib/dodo"

// Legacy portal for customers who subscribed through Polar before the move to Dodo Payments
const polarPortal = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return ""

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("polar_customer_id")
      .eq("user_id", user.id)
      .single()

    return subscription?.polar_customer_id || ""
  },
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("dodo_customer_id, polar_customer_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (subscription?.dodo_customer_id) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin
    try {
      const session = await getDodo().customers.customerPortal.create(subscription.dodo_customer_id, {
        return_url: `${siteUrl}/dashboard/pricing`,
      })
      return NextResponse.redirect(session.link)
    } catch (error) {
      console.error("[Dodo] Error creating customer portal session:", error)
      return NextResponse.redirect(new URL("/dashboard/pricing?error=portal_failed", req.url))
    }
  }

  if (subscription?.polar_customer_id) {
    return polarPortal(req)
  }

  return NextResponse.redirect(new URL("/dashboard/pricing", req.url))
}
