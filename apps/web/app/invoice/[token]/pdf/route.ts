import { NextRequest, NextResponse } from "next/server"
import { renderDocumentPdf } from "@/lib/pdf/render"
import { loadSharedDocument } from "@/lib/shared-document"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * GET /invoice/<share token>/pdf
 *
 * Public PDF download for a shared document, rendered exactly like the share page: the template and
 * colours saved with the link, limited by the owner's plan. Same `{ fallback: true, html }` answer
 * as /api/documents/pdf when no Chromium binary is available.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const shared = await loadSharedDocument((await params).token)
    if (!shared) {
      return NextResponse.json({ error: "This link is no longer available" }, { status: 404 })
    }

    const rendered = await renderDocumentPdf(shared.document, shared.profile, shared.template, shared.colors)
    const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex" }

    if (!rendered.pdf) {
      return NextResponse.json(
        { fallback: true, html: rendered.html, fileName: rendered.fileName, reason: rendered.error ?? "Rendering failed" },
        { headers }
      )
    }

    return new NextResponse(new Uint8Array(rendered.pdf), {
      headers: {
        ...headers,
        "Content-Type": "application/pdf",
        "Content-Length": String(rendered.pdf.byteLength),
        "Content-Disposition": `attachment; filename="${rendered.fileName}"`,
      },
    })
  } catch (error) {
    console.error("[share pdf] Unexpected error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
