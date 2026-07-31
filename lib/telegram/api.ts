type InlineButton = { text: string; callback_data?: string; url?: string }

type SendMessageOptions = {
  replyMarkup?: { inline_keyboard: InlineButton[][] }
  parseMode?: "HTML"
}

const API_ROOT = "https://api.telegram.org"

function getToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured")
  return token
}

async function telegramRequest<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_ROOT}/bot${getToken()}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  const payload = (await response.json()) as { ok: boolean; result?: T; description?: string }
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description || `Telegram ${method} failed`)
  }
  return payload.result as T
}

export function sendTelegramMessage(chatId: number, text: string, options: SendMessageOptions = {}) {
  return telegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options.parseMode || "HTML",
    disable_web_page_preview: true,
    reply_markup: options.replyMarkup,
  })
}

export function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return telegramRequest("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  })
}

export function sendTelegramDocument(chatId: number, documentUrl: string, caption: string) {
  return telegramRequest("sendDocument", {
    chat_id: chatId,
    document: documentUrl,
    caption,
    parse_mode: "HTML",
  })
}

export function registerTelegramWebhook(appUrl: string) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret) throw new Error("TELEGRAM_WEBHOOK_SECRET is not configured")
  return telegramRequest("setWebhook", {
    url: `${appUrl.replace(/\/$/, "")}/api/telegram/webhook`,
    secret_token: secret,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: false,
  })
}

export function escapeTelegramHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export type { InlineButton }
