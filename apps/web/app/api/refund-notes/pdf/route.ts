import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { loadRefundNote, renderRefundNotePdf } from "@/lib/refund-note-pdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * GET /api/refund-notes/pdf?id=<uuid>
 *
 * Downloads a refund note as a PDF. Owners can always download refund notes they issued, even after
 * leaving Pro; issuing and emailing them is what the plan gates. Without a headless browser the
 * route answers `{ fallback: true, html }` like the document PDF route.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") || ""

  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const note = await loadRefundNote(user.id, id)
    if (!note) return NextResponse.json({ error: "Refund note not found" }, { status: 404 })

    const rendered = await renderRefundNotePdf(note)
    if (!rendered.pdf) {
      return NextResponse.json(
        { fallback: true, html: rendered.html, fileName: rendered.fileName },
        { headers: { "Cache-Control": "private, no-store" } }
      )
    }

    return new NextResponse(new Uint8Array(rendered.pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(rendered.pdf.byteLength),
        // fileName only contains [A-Za-z0-9._-]
        "Content-Disposition": `attachment; filename="${rendered.fileName}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("[pdf] Refund note error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
