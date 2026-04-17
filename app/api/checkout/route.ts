import { Checkout } from "@polar-sh/nextjs"
import { NextRequest, NextResponse } from "next/server"
import { getLifetimePlanAvailability } from "@/app/actions/lifetime"

// Middleware to validate lifetime plan availability before checkout
async function validateLifetimePlan(request: NextRequest): Promise<NextResponse | null> {
  const searchParams = request.nextUrl.searchParams
  const productId = searchParams.get("products")
  const lifetimeProductId = process.env.NEXT_PUBLIC_POLAR_LIFETIME_PRODUCT_ID

  // If this is a lifetime product purchase, validate availability
  if (productId && lifetimeProductId && productId === lifetimeProductId) {
    const availability = await getLifetimePlanAvailability()
    if (!availability.available) {
      return NextResponse.redirect(
        new URL("/dashboard/pricing?error=lifetime_sold_out", request.url)
      )
    }
  }
  return null // Continue with checkout
}

// Wrap the Polar Checkout handler with validation
const polarCheckout = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/pricing?success=true`
    : "/dashboard/pricing?success=true",
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
})

export async function GET(request: NextRequest) {
  // First validate lifetime plan availability
  const redirectResponse = await validateLifetimePlan(request)
  if (redirectResponse) {
    return redirectResponse
  }

  // Proceed with Polar checkout
  return polarCheckout(request)
}
