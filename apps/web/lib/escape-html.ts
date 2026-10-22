/** Escapes a value for interpolation into HTML text or a quoted attribute. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

/** Returns a shallow copy of `record` with every string field HTML-escaped. */
export function escapeHtmlFields<T extends object>(record: T): T {
  const escaped: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(record)) {
    escaped[key] = typeof value === "string" ? escapeHtml(value) : value
  }
  return escaped as T
}

/** Allows only absolute http(s) URLs, e.g. for user-supplied image sources. */
export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null
  } catch {
    return null
  }
}
