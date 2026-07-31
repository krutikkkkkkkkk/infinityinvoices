import { NextResponse } from "next/server"
import { answerCallbackQuery, escapeTelegramHtml, sendTelegramMessage } from "@/lib/telegram/api"
import {
  auditTelegramAction,
  claimTelegramUpdate,
  consumeTelegramLink,
  createPendingPayment,
  getDashboardSummary,
  getTelegramAccount,
  listClients,
  listDocuments,
  listProducts,
  mainMenu,
  renderDocuments,
  resolvePendingAction,
  sendInvoiceReminder,
} from "@/lib/telegram/service"
import { createAdminClient } from "@/lib/supabase/admin"

type TelegramUser = { id: number; username?: string; first_name?: string }
type TelegramMessage = { text?: string; chat: { id: number; type: string }; from?: TelegramUser }
type TelegramCallback = { id: string; data?: string; from: TelegramUser; message?: { chat: { id: number } } }
type TelegramUpdate = { update_id: number; message?: TelegramMessage; callback_query?: TelegramCallback }

const appUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "")

function assertWebhook(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET
  const actual = request.headers.get("x-telegram-bot-api-secret-token")
  return Boolean(expected && actual === expected)
}

async function showMenu(chatId: number, name?: string) {
  await sendTelegramMessage(chatId, `<b>Infinity Invoices</b>\n${name ? `Welcome, ${escapeTelegramHtml(name)}. ` : ""}Choose what you want to manage.`, { replyMarkup: { inline_keyboard: mainMenu(appUrl) } })
}

async function showInvoiceActions(chatId: number, userId: string, documentId: string) {
  const admin = createAdminClient()
  const { data: document } = await admin.from("documents").select("id,number,client_name,status,currency,grand_total,amount_paid,client_email").eq("id", documentId).eq("user_id", userId).eq("type", "invoice").single()
  if (!document) throw new Error("Invoice not found")
  const remaining = Math.max(0, Number(document.grand_total) - Number(document.amount_paid || 0))
  await sendTelegramMessage(chatId, `<b>${escapeTelegramHtml(document.number)}</b>\nClient: ${escapeTelegramHtml(document.client_name)}\nStatus: ${escapeTelegramHtml(document.status)}\nBalance: ${escapeTelegramHtml(document.currency)} ${remaining.toLocaleString()}`, {
    replyMarkup: { inline_keyboard: [
      [{ text: "Send email reminder", callback_data: `remind:${document.id}` }],
      [{ text: "Mark full balance paid", callback_data: `payfull:${document.id}` }],
      [{ text: "Record partial payment", callback_data: `payhelp:${document.id}` }],
      [{ text: "Open invoice", url: `${appUrl}/dashboard/documents/${document.id}` }, { text: "PDF", url: `${appUrl}/api/documents/pdf?id=${document.id}` }],
      [{ text: "Back", callback_data: "list:invoice" }],
    ] },
  })
}

async function handleCommand(message: TelegramMessage) {
  if (!message.from || message.chat.type !== "private") return
  const text = message.text?.trim() || ""
  const startToken = text.match(/^\/start(?:@\w+)?\s+([A-Za-z0-9_-]+)$/)?.[1]
  if (startToken) {
    const linkedUser = await consumeTelegramLink(startToken, message.from, message.chat.id)
    if (!linkedUser) {
      await sendTelegramMessage(message.chat.id, "This link is invalid or expired. Generate a new link from Settings.")
      return
    }
    await showMenu(message.chat.id, message.from.first_name)
    return
  }

  const account = await getTelegramAccount(message.from.id)
  if (!account) {
    await sendTelegramMessage(message.chat.id, "Link Telegram from Infinity Invoices Settings before using this bot.")
    return
  }

  if (/^\/(start|menu|help)(?:@\w+)?$/i.test(text)) {
    await showMenu(message.chat.id, account.first_name || undefined)
    return
  }

  const payment = text.match(/^\/pay(?:@\w+)?\s+(\S+)\s+(\d+(?:\.\d{1,2})?)(?:\s+(\w+))?$/i)
  if (payment) {
    const admin = createAdminClient()
    const { data: document } = await admin.from("documents").select("id").eq("user_id", account.user_id).eq("type", "invoice").ilike("number", payment[1]).maybeSingle()
    if (!document) throw new Error("Invoice number not found")
    const pending = await createPendingPayment(account.user_id, message.chat.id, document.id, Number(payment[2]), payment[3] || "other")
    await sendTelegramMessage(message.chat.id, `<b>Confirm payment</b>\nInvoice: ${escapeTelegramHtml(pending.document.number)}\nAmount: ${escapeTelegramHtml(pending.document.currency)} ${Number(payment[2]).toLocaleString()}\nMethod: ${escapeTelegramHtml(payment[3] || "other")}`, { replyMarkup: { inline_keyboard: [[{ text: "Confirm", callback_data: `confirm:${pending.actionId}` }, { text: "Cancel", callback_data: `cancel:${pending.actionId}` }]] } })
    return
  }

  await sendTelegramMessage(message.chat.id, "I did not understand that. Use /menu, or record a payment with:\n<code>/pay INVOICE-NUMBER AMOUNT METHOD</code>")
}

async function handleCallback(callback: TelegramCallback) {
  const chatId = callback.message?.chat.id
  if (!chatId || !callback.data) return
  const account = await getTelegramAccount(callback.from.id)
  if (!account) {
    await answerCallbackQuery(callback.id, "Link your account first")
    await sendTelegramMessage(chatId, "Link Telegram from Settings first.")
    return
  }
  await answerCallbackQuery(callback.id)
  const [action, value] = callback.data.split(":", 2)

  if (action === "list" && (value === "invoice" || value === "quotation")) {
    const result = renderDocuments(await listDocuments(account.user_id, value), value, appUrl)
    await sendTelegramMessage(chatId, result.text, { replyMarkup: { inline_keyboard: [...result.keyboard, [{ text: "Main menu", callback_data: "menu" }]] } })
  } else if (action === "list" && value === "clients") {
    const clients = await listClients(account.user_id)
    await sendTelegramMessage(chatId, `<b>Clients</b>\n\n${clients.length ? clients.map((client) => `<b>${escapeTelegramHtml(client.name)}</b>\n${escapeTelegramHtml(client.email || client.phone || "No contact details")}`).join("\n\n") : "No clients found."}`, { replyMarkup: { inline_keyboard: [[{ text: "Manage clients", url: `${appUrl}/dashboard/clients` }], [{ text: "Main menu", callback_data: "menu" }]] } })
  } else if (action === "list" && value === "products") {
    const products = await listProducts(account.user_id)
    await sendTelegramMessage(chatId, `<b>Products & services</b>\n\n${products.length ? products.map((product) => `${escapeTelegramHtml(product.name)} · ${Number(product.rate).toLocaleString()}/${escapeTelegramHtml(product.unit)}`).join("\n") : "No active products found."}`, { replyMarkup: { inline_keyboard: [[{ text: "Manage products", url: `${appUrl}/dashboard/products` }], [{ text: "Main menu", callback_data: "menu" }]] } })
  } else if (action === "invoice" && value) {
    await showInvoiceActions(chatId, account.user_id, value)
  } else if (action === "payfull" && value) {
    const admin = createAdminClient()
    const { data: document } = await admin.from("documents").select("grand_total,amount_paid").eq("id", value).eq("user_id", account.user_id).single()
    if (!document) throw new Error("Invoice not found")
    const amount = Math.max(0, Number(document.grand_total) - Number(document.amount_paid || 0))
    if (!amount) throw new Error("Invoice is already paid")
    const pending = await createPendingPayment(account.user_id, chatId, value, amount, "other")
    await sendTelegramMessage(chatId, `<b>Confirm full payment</b>\nAmount: ${amount.toLocaleString()}\nThis will update the invoice balance and status.`, { replyMarkup: { inline_keyboard: [[{ text: "Confirm", callback_data: `confirm:${pending.actionId}` }, { text: "Cancel", callback_data: `cancel:${pending.actionId}` }]] } })
  } else if (action === "payhelp" && value) {
    await sendTelegramMessage(chatId, `Send this command with the amount and method:\n<code>/pay INVOICE-NUMBER 500 bank</code>\n\nOpen the invoice below to copy its number.`, { replyMarkup: { inline_keyboard: [[{ text: "Open invoice", url: `${appUrl}/dashboard/documents/${value}` }]] } })
  } else if ((action === "confirm" || action === "cancel") && value) {
    const result = await resolvePendingAction(account.user_id, chatId, value, action === "confirm")
    await auditTelegramAction(account.user_id, callback.from.id, "payment.resolve", "success", { cancelled: result.cancelled })
    await sendTelegramMessage(chatId, result.cancelled ? "Payment cancelled. No changes were made." : `Payment recorded for <b>${escapeTelegramHtml(result.number)}</b>: ${Number(result.amount).toLocaleString()}.`)
  } else if (action === "summary") {
    const summary = await getDashboardSummary(account.user_id)
    await sendTelegramMessage(chatId, `<b>Business summary</b>\nInvoices: ${summary.invoices}\nQuotations: ${summary.quotations}\nOverdue: ${summary.overdue}\nOutstanding (all currencies combined): ${summary.outstanding.toLocaleString()}`, { replyMarkup: { inline_keyboard: [[{ text: "Full reports", url: `${appUrl}/dashboard/reports` }], [{ text: "Main menu", callback_data: "menu" }]] } })
  } else if (action === "remind" && value) {
    const result = await sendInvoiceReminder(account.user_id, value)
    await auditTelegramAction(account.user_id, callback.from.id, "reminder.send", "success", { email: result.email }, "document", value)
    await sendTelegramMessage(chatId, `Reminder sent for <b>${escapeTelegramHtml(result.number)}</b> to ${escapeTelegramHtml(result.email)}.`, {
      replyMarkup: { inline_keyboard: [[{ text: "Back to invoices", callback_data: "list:invoice" }], [{ text: "Main menu", callback_data: "menu" }]] },
    })
  } else {
    await showMenu(chatId, account.first_name || undefined)
  }
}

export async function POST(request: Request) {
  if (!assertWebhook(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const update = (await request.json()) as TelegramUpdate
    if (!(await claimTelegramUpdate(update.update_id))) return NextResponse.json({ ok: true })
    if (update.message) await handleCommand(update.message)
    if (update.callback_query) {
      try {
        await handleCallback(update.callback_query)
      } catch (error) {
        const chatId = update.callback_query.message?.chat.id
        if (chatId) {
          const message = error instanceof Error
            ? error.message
            : typeof error === "object" && error && "message" in error
              ? String(error.message)
              : "The action could not be completed"
          console.error("Telegram callback error", { action: update.callback_query.data, error })
          await sendTelegramMessage(chatId, `Unable to complete that action: ${escapeTelegramHtml(message)}`)
        }
      }
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error", error)
    return NextResponse.json({ ok: true })
  }
}
