import "server-only"
import {
  generateDocumentHTML,
  documentFileName,
  type DocumentWithItems,
  type TemplateColors,
  type TemplateProfile,
  type TemplateType,
} from "@/lib/generate-document-html"
import { launchBrowser } from "./browser"
import { inlineRemoteImages } from "./inline-images"

const RENDER_TIMEOUT_MS = 30_000

/** Renders print-ready HTML to an A4 PDF with headless Chromium. */
export async function renderHtmlToPdf(html: string): Promise<Uint8Array> {
  const { browser, target } = await launchBrowser()
  try {
    const page = await browser.newPage()

    // The HTML contains user data: no scripts, and only https/data resources
    // (logo, QR code, web fonts) so the renderer can't reach internal or file:// URLs.
    await page.setJavaScriptEnabled(false)
    await page.setRequestInterception(true)
    page.on("request", (req) => {
      const url = req.url()
      if (url.startsWith("https://") || url.startsWith("data:") || url === "about:blank") {
        void req.continue()
      } else {
        void req.abort()
      }
    })

    await page.emulateMediaType("print")
    try {
      await page.setContent(html, {
        waitUntil: ["load", "networkidle0"],
        timeout: RENDER_TIMEOUT_MS,
      })
    } catch (error) {
      // A slow web font or image shouldn't cost the whole PDF: the content is in the page, print it
      // with whatever has loaded (fallback fonts at worst).
      if (!(error instanceof Error && error.name === "TimeoutError")) throw error
      console.warn("[pdf] Page resources still loading after timeout; rendering anyway")
    }

    // Give web fonts a moment to finish applying once their files are loaded.
    try {
      await page.evaluateHandle("document.fonts.ready")
    } catch {
      // JavaScript is disabled for the page; networkidle0 already waited for font files.
    }

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      timeout: RENDER_TIMEOUT_MS,
    })

    if (process.env.NODE_ENV !== "production") {
      console.info(`[pdf] Rendered ${pdf.byteLength} bytes with ${target.source} Chromium`)
    }
    return pdf
  } finally {
    await browser.close().catch(() => undefined)
  }
}

export interface RenderedDocument {
  html: string
  fileName: string
  /** `null` when no Chromium binary is available on this host. */
  pdf: Buffer | null
  error?: string
}

/**
 * Builds the print HTML for a document (with remote images inlined) and renders it
 * to PDF. PDF rendering failures are reported through `pdf: null` + `error` so
 * callers can fall back to the HTML or a portal link instead of failing outright.
 */
export async function renderDocumentPdf(
  document: DocumentWithItems,
  profile: TemplateProfile | null | undefined,
  template: TemplateType = "classic",
  colors?: Partial<TemplateColors> | null
): Promise<RenderedDocument> {
  const html = await inlineRemoteImages(generateDocumentHTML(document, profile, template, colors))
  const fileName = documentFileName(document)
  let lastError: unknown
  // One retry: browser launches occasionally fail on a cold or busy host
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const pdf = await renderHtmlToPdf(html)
      return { html, fileName, pdf: Buffer.from(pdf) }
    } catch (error) {
      lastError = error
      console.error(`[pdf] Rendering failed (attempt ${attempt}/2):`, error)
    }
  }
  return {
    html,
    fileName,
    pdf: null,
    error: lastError instanceof Error ? lastError.message : "Rendering failed",
  }
}
