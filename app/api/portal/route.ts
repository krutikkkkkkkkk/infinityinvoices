import { CustomerPortal } from "@polar-sh/nextjs"
import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async (req: NextRequest) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return ""
    
    // Get the Polar customer ID from our database
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("polar_customer_id")
      .eq("user_id", user.id)
      .single()
    
    return subscription?.polar_customer_id || ""
  },
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
})
