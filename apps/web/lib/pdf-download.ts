// Browser-side PDF download shared by the dashboard and public share pages.

function saveBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob)
  const anchor = window.document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.rel = "noopener"
  window.document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}

function fileNameFromDisposition(header: string | null): string | null {
  const match = header?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

/** Opens the browser's print dialog for a print-ready HTML document via a hidden iframe. */
function printHtml(html: string): Promise<void> {
  return new Promise((resolve) => {
    const iframe = window.document.createElement("iframe")
    iframe.setAttribute("aria-hidden", "true")
    iframe.title = "Print preview"
    // The HTML holds user data (and on share links, another user's): never let it run scripts.
    // allow-same-origin lets this page call print() on the frame; allow-modals lets the dialog open.
    iframe.setAttribute("sandbox", "allow-same-origin allow-modals")
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:210mm;height:297mm;border:0;opacity:0;pointer-events:none;"
    let finished = false
    const cleanup = () => {
      if (finished) return
      finished = true
      iframe.remove()
      resolve()
    }
    iframe.onload = async () => {
      const frameWindow = iframe.contentWindow
      if (!frameWindow) return cleanup()
      try {
        await frameWindow.document.fonts?.ready
      } catch {
        // fonts are optional
      }
      frameWindow.addEventListener("afterprint", cleanup, { once: true })
      // Safety net for browsers that never fire afterprint.
      setTimeout(cleanup, 120_000)
      frameWindow.focus()
      frameWindow.print()
    }
    iframe.srcdoc = html
    window.document.body.appendChild(iframe)
  })
}

export type PdfDownloadResult =
  | { status: "downloaded" }
  | { status: "printed" }
  | { status: "error"; message: string }

/**
 * Fetches a PDF route and saves the file. Routes answer `{ fallback: true, html }` when the server
 * has no headless browser; then the browser's own print engine is used ("Save as PDF").
 * `onFallback` runs just before the print dialog opens.
 */
export async function downloadPdf(url: string, defaultFileName: string, onFallback?: () => void): Promise<PdfDownloadResult> {
  try {
    const response = await fetch(url)
    const contentType = response.headers.get("content-type") || ""

    if (response.ok && contentType.includes("application/pdf")) {
      const blob = await response.blob()
      saveBlob(blob, fileNameFromDisposition(response.headers.get("content-disposition")) || defaultFileName)
      return { status: "downloaded" }
    }

    const data = await response.json().catch(() => null)
    if (!response.ok || !data) {
      return { status: "error", message: data?.error || "Could not generate the PDF. Please try again." }
    }

    if (data.fallback && typeof data.html === "string") {
      onFallback?.()
      await printHtml(data.html)
      return { status: "printed" }
    }

    return { status: "error", message: "Unexpected response while generating the PDF." }
  } catch (error) {
    console.error("Error downloading PDF:", error)
    return { status: "error", message: "Could not download the PDF. Check your connection and try again." }
  }
}
