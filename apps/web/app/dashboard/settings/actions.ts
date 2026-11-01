"use server"

import { revalidatePath } from "next/cache"
import { db, eq, profiles } from "@infinity/db"
import { requireUser } from "@/lib/auth/server"
import { CURRENCIES } from "@/lib/types"
import { isLogoSize } from "@/lib/generate-document-html"

export interface ProfileInput {
  company_name: string
  company_address: string
  gst_id: string
  email: string
  phone: string
  logo_url: string
  upi_id: string
  paypal_email: string
  bank_name: string
  bank_account_name: string
  bank_account_number: string
  bank_routing_number: string
  bank_swift_code: string
  financial_year_start: string
  default_currency: string
}

/** Saves the signed-in user's business profile. */
export async function updateProfile(input: ProfileInput): Promise<{ error?: string }> {
  const user = await requireUser()

  const financialYearStart = parseInt(input.financial_year_start)
  if (!(financialYearStart >= 1 && financialYearStart <= 12)) return { error: "Choose a valid financial year start month" }
  if (!CURRENCIES.some((c) => c.value === input.default_currency)) return { error: "Choose a valid currency" }

  const values = {
    company_name: input.company_name || null,
    company_address: input.company_address || null,
    gst_id: input.gst_id || null,
    email: input.email || null,
    phone: input.phone || null,
    logo_url: input.logo_url || null,
    upi_id: input.upi_id || null,
    paypal_email: input.paypal_email || null,
    bank_name: input.bank_name || null,
    bank_account_name: input.bank_account_name || null,
    bank_account_number: input.bank_account_number || null,
    bank_routing_number: input.bank_routing_number || null,
    bank_swift_code: input.bank_swift_code || null,
    financial_year_start: financialYearStart,
    default_currency: input.default_currency,
  }

  await db
    .insert(profiles)
    .values({ id: user.id, ...values })
    .onConflictDoUpdate({ target: profiles.id, set: values })

  revalidatePath("/dashboard", "layout")
  return {}
}

/** Saves how large the logo is drawn on the user's documents (preview, PDF, email and share link). */
export async function updateLogoSize(size: string): Promise<{ error?: string }> {
  const user = await requireUser()
  if (!isLogoSize(size)) return { error: "Choose a valid logo size" }

  await db
    .insert(profiles)
    .values({ id: user.id, logo_size: size })
    .onConflictDoUpdate({ target: profiles.id, set: { logo_size: size } })

  revalidatePath("/dashboard", "layout")
  return {}
}
