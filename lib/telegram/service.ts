import { createHash, randomBytes } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { escapeTelegramHtml, type InlineButton } from "./api"

export type TelegramAccount = {
  user_id: string
  telegram_user_id: number
  telegram_chat_id: number
  telegram_username: string | null
  first_name: string | null
}

export function hashTelegramToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function createTelegramLink(userId: string) {
  const admin = createAdminClient()
  const token = randomBytes(24).toString("base64url")
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  await admin.from("telegram_link_tokens").delete().eq("user_id", userId)
  const { error } = await admin.from("telegram_link_tokens").insert({
    user_id: userId,
    token_hash: hashTelegramToken(token),
    expires_at: expiresAt,
  })
  if (error) throw error

  const username = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "")
  if (!username) throw new Error("TELEGRAM_BOT_USERNAME is not configured")
  return { url: `https://t.me/${username}?start=${token}`, expiresAt }
}

export async function consumeTelegramLink(token: string, telegramUser: { id: number; username?: string; first_name?: string }, chatId: number) {
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const { data: link } = await admin
    .from("telegram_link_tokens")
    .select("id,user_id,expires_at,used_at")
    .eq("token_hash", hashTelegramToken(token))
    .is("used_at", null)
    .gt("expires_at", now)
    .maybeSingle()
  if (!link) return null

  const { error } = await admin.from("telegram_accounts").upsert({
    user_id: link.user_id,
    telegram_user_id: telegramUser.id,
    telegram_chat_id: chatId,
    telegram_username: telegramUser.username || null,
    first_name: telegramUser.first_name || null,
    linked_at: now,
    last_seen_at: now,
    is_active: true,
  }, { onConflict: "user_id" })
  if (error) throw error
  await admin.from("telegram_link_tokens").update({ used_at: now }).eq("id", link.id)
  await auditTelegramAction(link.user_id, telegramUser.id, "account.link", "success")
  return link.user_id as string
}

export async function getTelegramAccount(telegramUserId: number) {
  const admin = createAdminClient()
  const { data } = await admin
    .from("telegram_accounts")
    .select("user_id,telegram_user_id,telegram_chat_id,telegram_username,first_name")
    .eq("telegram_user_id", telegramUserId)
    .eq("is_active", true)
    .maybeSingle()
  return data as TelegramAccount | null
}

export async function auditTelegramAction(userId: string | null, telegramUserId: number, action: string, status: "success" | "failed" | "pending", metadata: Record<string, unknown> = {}, resourceType?: string, resourceId?: string) {
  const admin = createAdminClient()
  await admin.from("telegram_audit_logs").insert({
    user_id: userId,
    telegram_user_id: telegramUserId,
    action,
    status,
    metadata,
    resource_type: resourceType || null,
    resource_id: resourceId || null,
  })
}

export async function claimTelegramUpdate(updateId: number) {
  const admin = createAdminClient()
  const { error } = await admin.from("telegram_processed_updates").insert({ update_id: updateId })
  return !error
}

export async function listDocuments(userId: string, type: "invoice" | "quotation") {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("documents")
    .select("id,number,client_name,status,currency,grand_total,amount_paid,due_date,valid_until")
    .eq("user_id", userId)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(8)
  if (error) throw error
  return data || []
}

export async function listClients(userId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("clients").select("id,name,email,phone").eq("user_id", userId).order("name").limit(10)
  if (error) throw error
  return data || []
}

export async function listProducts(userId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("products").select("id,name,rate,unit").eq("user_id", userId).eq("is_active", true).order("name").limit(10)
  if (error) throw error
  return data || []
}

export async function getDashboardSummary(userId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("documents").select("type,status,grand_total,amount_paid,currency").eq("user_id", userId)
  if (error) throw error
  const documents = data || []
  return {
    invoices: documents.filter((item) => item.type === "invoice").length,
    quotations: documents.filter((item) => item.type === "quotation").length,
    overdue: documents.filter((item) => item.type === "invoice" && item.status === "overdue").length,
    outstanding: documents.filter((item) => item.type === "invoice").reduce((sum, item) => sum + Math.max(0, Number(item.grand_total) - Number(item.amount_paid || 0)), 0),
  }
}

export async function createPendingPayment(userId: string, chatId: number, documentId: string, amount: number, method: string) {
  const admin = createAdminClient()
  const { data: document } = await admin.from("documents").select("id,number,grand_total,amount_paid,currency,status").eq("id", documentId).eq("user_id", userId).eq("type", "invoice").single()
  if (!document) throw new Error("Invoice not found")
  const remaining = Math.max(0, Number(document.grand_total) - Number(document.amount_paid || 0))
  if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) throw new Error("Payment must be greater than zero and no more than the remaining balance")
  const { data, error } = await admin.from("telegram_pending_actions").insert({
    user_id: userId,
    telegram_chat_id: chatId,
    action_type: "record_payment",
    payload: { documentId, amount, method },
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  }).select("id").single()
  if (error) throw error
  return { actionId: data.id as string, document, remaining }
}

export async function resolvePendingAction(userId: string, chatId: number, actionId: string, confirm: boolean) {
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const { data: action } = await admin.from("telegram_pending_actions").select("*").eq("id", actionId).eq("user_id", userId).eq("telegram_chat_id", chatId).is("confirmed_at", null).is("cancelled_at", null).gt("expires_at", now).maybeSingle()
  if (!action) throw new Error("This confirmation expired or was already used")
  if (!confirm) {
    await admin.from("telegram_pending_actions").update({ cancelled_at: now }).eq("id", action.id)
    return { cancelled: true }
  }
  if (action.action_type !== "record_payment") throw new Error("Unsupported action")
  const payload = action.payload as { documentId: string; amount: number; method: string }
  const { data: document } = await admin.from("documents").select("id,number,grand_total,amount_paid").eq("id", payload.documentId).eq("user_id", userId).single()
  if (!document) throw new Error("Invoice not found")
  const paid = Number(document.amount_paid || 0)
  const remaining = Math.max(0, Number(document.grand_total) - paid)
  if (payload.amount > remaining) throw new Error("Payment is now greater than the remaining balance")
  const { error: paymentError } = await admin.from("payments").insert({ user_id: userId, document_id: document.id, amount: payload.amount, payment_date: now.slice(0, 10), payment_method: payload.method, notes: "Recorded from Telegram" })
  if (paymentError) throw paymentError
  const newPaid = paid + payload.amount
  const { error: documentError } = await admin.from("documents").update({ amount_paid: newPaid, status: newPaid >= Number(document.grand_total) ? "paid" : "sent" }).eq("id", document.id).eq("user_id", userId)
  if (documentError) throw documentError
  await admin.from("telegram_pending_actions").update({ confirmed_at: now }).eq("id", action.id)
  return { cancelled: false, number: document.number, amount: payload.amount }
}

export function mainMenu(appUrl: string): InlineButton[][] {
  return [
    [{ text: "Invoices", callback_data: "list:invoice" }, { text: "Quotations", callback_data: "list:quotation" }],
    [{ text: "Clients", callback_data: "list:clients" }, { text: "Products", callback_data: "list:products" }],
    [{ text: "Reports", callback_data: "summary" }, { text: "Recurring", url: `${appUrl}/dashboard/recurring` }],
    [{ text: "Credit notes", url: `${appUrl}/dashboard/credit-notes` }, { text: "Presets", url: `${appUrl}/dashboard/presets` }],
    [{ text: "Create invoice", url: `${appUrl}/dashboard/documents/new?type=invoice` }, { text: "Create quote", url: `${appUrl}/dashboard/documents/new?type=quotation` }],
  ]
}

export function renderDocuments(documents: Array<Record<string, unknown>>, type: "invoice" | "quotation", appUrl: string) {
  if (!documents.length) return { text: `No ${type}s found.`, keyboard: [[{ text: `Create ${type}`, url: `${appUrl}/dashboard/documents/new?type=${type}` }]] as InlineButton[][] }
  const lines = documents.map((item) => {
    const balance = Math.max(0, Number(item.grand_total) - Number(item.amount_paid || 0))
    return `<b>${escapeTelegramHtml(item.number)}</b> · ${escapeTelegramHtml(item.client_name)}\n${escapeTelegramHtml(item.status)} · ${escapeTelegramHtml(item.currency)} ${Number(item.grand_total).toLocaleString()}${type === "invoice" ? ` · due ${balance.toLocaleString()}` : ""}`
  })
  const keyboard = documents.map((item) => type === "invoice"
    ? [{ text: `${String(item.number)} actions`, callback_data: `invoice:${String(item.id)}` }]
    : [{ text: `Open ${String(item.number)}`, url: `${appUrl}/dashboard/documents/${String(item.id)}` }])
  return { text: `<b>Recent ${type === "invoice" ? "invoices" : "quotations"}</b>\n\n${lines.join("\n\n")}`, keyboard }
}
