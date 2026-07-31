"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createTelegramLink } from "@/lib/telegram/service"
import { registerTelegramWebhook } from "@/lib/telegram/api"

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function generateTelegramLink() {
  const user = await requireUser()
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "")
  if (!appUrl) throw new Error("A public site URL is required to connect Telegram")
  await registerTelegramWebhook(appUrl)
  return createTelegramLink(user.id)
}

export async function disconnectTelegram() {
  const user = await requireUser()
  const admin = createAdminClient()
  const { error } = await admin.from("telegram_accounts").delete().eq("user_id", user.id)
  if (error) throw error
  await admin.from("telegram_link_tokens").delete().eq("user_id", user.id)
  revalidatePath("/dashboard/settings")
  return { success: true }
}
