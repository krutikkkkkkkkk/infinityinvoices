import "server-only"

/**
 * Replaces remote `<img src="https://…">` references with base64 data URIs so
 * the PDF renderer never depends on third-party hosts (logo CDN, QR service)
 * being reachable at print time. Failures leave the original URL in place.
 */

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
}

function decodeEntities(value: string): string {
  return value.replace(/&(amp|quot|#39|lt|gt);/g, (m) => ENTITY_MAP[m] ?? m)
}

interface InlineOptions {
  timeoutMs?: number
  maxBytes?: number
}

async function fetchAsDataUri(url: string, { timeoutMs, maxBytes }: Required<InlineOptions>): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { Accept: "image/*" },
    })
    if (!response.ok) return null
    const contentType = (response.headers.get("content-type") || "").split(";")[0].trim()
    if (!contentType.startsWith("image/")) return null
    const length = Number(response.headers.get("content-length") || 0)
    if (length > maxBytes) return null
    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.byteLength > maxBytes) return null
    return `data:${contentType};base64,${buffer.toString("base64")}`
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function inlineRemoteImages(html: string, options: InlineOptions = {}): Promise<string> {
  const opts: Required<InlineOptions> = {
    timeoutMs: options.timeoutMs ?? 6_000,
    maxBytes: options.maxBytes ?? 4 * 1024 * 1024,
  }

  const pattern = /<img\b[^>]*?\bsrc\s*=\s*"(https?:\/\/[^"]+)"/gi
  const sources = new Set<string>()
  for (const match of html.matchAll(pattern)) sources.add(match[1])
  if (sources.size === 0) return html

  const replacements = await Promise.all(
    [...sources].map(async (rawSrc) => {
      const dataUri = await fetchAsDataUri(decodeEntities(rawSrc), opts)
      return [rawSrc, dataUri] as const
    })
  )

  let output = html
  for (const [rawSrc, dataUri] of replacements) {
    if (!dataUri) continue
    output = output.split(`src="${rawSrc}"`).join(`src="${dataUri}"`)
  }
  return output
}
