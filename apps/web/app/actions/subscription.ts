"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function refreshSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get current subscription
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single()

  revalidatePath("/dashboard/usage")
  revalidatePath("/dashboard/pricing")
  
  return { subscription, error: error?.message }
}

export async function createFreeSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if subscription already exists
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (existing) {
    return { error: "Subscription already exists" }
  }

  // Create free subscription
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      plan: "free",
      status: "active",
    })
    .select()
    .single()

  revalidatePath("/dashboard/usage")
  revalidatePath("/dashboard/pricing")
  
  return { subscription: data, error: error?.message }
}
