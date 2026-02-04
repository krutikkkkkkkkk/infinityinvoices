import { NextResponse } from "next/server"
import { PRO_PLAN } from "@/lib/plans"

export async function GET() {
  const polarProductId = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID

  return NextResponse.json({
    plan: {
      id: PRO_PLAN.id,
      name: PRO_PLAN.name,
      description: PRO_PLAN.description,
      price: PRO_PLAN.priceInCents / 100,
      currency: "USD",
      interval: "month",
      features: PRO_PLAN.features,
      limits: PRO_PLAN.limits,
    },
    checkout: polarProductId
      ? `https://polar.sh/checkout/${polarProductId}`
      : null,
    portal: "/api/portal",
  })
}
