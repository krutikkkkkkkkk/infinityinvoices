"use server"

import { revalidatePath } from "next/cache"
import { and, clients, db, eq } from "@infinity/db"
import { requireUser } from "@/lib/auth/server"
import { getPlanForUser } from "@/lib/plan-server"
import { canAddClient, PRO_PLAN, type Plan } from "@/lib/plans"

export interface ClientInput {
  name: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  address: string
  gst_id: string
  pan_number: string
  auto_reminder: boolean
}

type Result = { error?: string }

const AUTO_REMINDER_PRO_ERROR = "Auto reminders are a Pro feature. Upgrade to Pro to email clients before and after the due date."

/** Auto reminders send email, which is Pro / Lifetime only. */
function canUseAutoReminders(plan: Plan) {
  return plan.id === PRO_PLAN.id
}

function toRow(input: ClientInput) {
  return {
    name: input.name.trim(),
    company_name: input.company_name || null,
    contact_person: input.contact_person || null,
    email: input.email || null,
    phone: input.phone || null,
    address: input.address || null,
    gst_id: input.gst_id || null,
    pan_number: input.pan_number || null,
    auto_reminder: Boolean(input.auto_reminder),
  }
}

function revalidateClients(clientId?: string) {
  revalidatePath("/dashboard/clients")
  if (clientId) revalidatePath(`/dashboard/clients/${clientId}`)
}

export async function addClient(input: ClientInput): Promise<Result> {
  const user = await requireUser()
  if (!input.name?.trim()) return { error: "Client name is required" }

  // The Free plan caps how many clients you can have (Pro/Lifetime are unlimited)
  const plan = await getPlanForUser(user.id)
  const count = await db.$count(clients, eq(clients.user_id, user.id))
  if (!canAddClient(plan, count)) {
    return {
      error: `The ${plan.name} plan includes up to ${plan.limits.clients} clients. Upgrade to Pro for unlimited clients.`,
    }
  }

  // Free plans can't turn auto reminders on (the cron also skips them, but don't store a dead setting)
  const row = { ...toRow(input), auto_reminder: canUseAutoReminders(plan) && Boolean(input.auto_reminder) }
  await db.insert(clients).values({ ...row, user_id: user.id })
  revalidateClients()
  return {}
}

export async function updateClient(clientId: string, input: ClientInput): Promise<Result> {
  const user = await requireUser()
  if (!input.name?.trim()) return { error: "Client name is required" }

  // On a Free plan the reminder setting is left as it was, so editing details can't turn it on
  const plan = await getPlanForUser(user.id)
  const { auto_reminder, ...details } = toRow(input)
  const updated = await db
    .update(clients)
    .set(canUseAutoReminders(plan) ? { ...details, auto_reminder } : details)
    .where(and(eq(clients.id, clientId), eq(clients.user_id, user.id)))
    .returning({ id: clients.id })
  if (!updated.length) return { error: "Client not found" }

  revalidateClients(clientId)
  return {}
}

export async function setClientAutoReminder(clientId: string, enabled: boolean): Promise<Result> {
  const user = await requireUser()
  // Turning reminders off is always allowed, so a downgraded user can still clear the setting
  if (enabled && !canUseAutoReminders(await getPlanForUser(user.id))) return { error: AUTO_REMINDER_PRO_ERROR }

  const updated = await db
    .update(clients)
    .set({ auto_reminder: Boolean(enabled) })
    .where(and(eq(clients.id, clientId), eq(clients.user_id, user.id)))
    .returning({ id: clients.id })
  if (!updated.length) return { error: "Client not found" }

  revalidateClients(clientId)
  return {}
}

export async function deleteClient(clientId: string): Promise<Result> {
  const user = await requireUser()

  // Documents keep the client details printed on them; client_id is set to null by the FK
  const deleted = await db
    .delete(clients)
    .where(and(eq(clients.id, clientId), eq(clients.user_id, user.id)))
    .returning({ id: clients.id })
  if (!deleted.length) return { error: "Client not found" }

  revalidateClients(clientId)
  return {}
}
