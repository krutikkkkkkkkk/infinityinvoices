import { NextRequest, NextResponse } from "next/server"
import { and, asc, db, documents, eq, lineItems, profiles } from "@infinity/db"
import { getCurrentUser } from "@/lib/auth/server"
import { isAdmin } from "@/lib/admin"
import { isTemplateType, type TemplateType } from "@/lib/generate-document-html"
import { parseTemplateColors } from "@/lib/document-style"
import { renderDocumentPdf } from "@/lib/pdf/render"
import { getPlanForUser } from "@/lib/plan-server"
import { allowedColors, allowedTemplate, applyBranding } from "@/lib/plans"
import type { DocumentWithItems } from "@/lib/generate-document-html"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/documents/pdf?id=<uuid>&template=<classic|minimal|tax|dark|executive|bold>
 *
 * Query options:
 *  - `primary`, `accent` → hex colour overrides for the template (Pro plans only)
 *  - `inline=1`     → Content-Disposition: inline (open in the browser tab)
 *  - `format=html`  → return the print-ready HTML instead of a PDF
 *
 * When no Chromium binary is available the route responds with JSON
 * `{ fallback: true, html }` so the client can open the browser's print dialog.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const documentId = params.get("id")
  const requestedTemplate = params.get("template")
  const wantedTemplate: TemplateType = isTemplateType(requestedTemplate) ? requestedTemplate : "classic"
  // Only valid hex colours survive parsing: these values end up inside the document's CSS
  const wantedColors = parseTemplateColors({ primary: params.get("primary"), accent: params.get("accent") })
  const inline = params.get("inline") === "1"
  const wantsHtml = params.get("format") === "html"

  if (!documentId || !UUID_REGEX.test(documentId)) {
    return NextResponse.json({ error: "A valid document id is required" }, { status: 400 })
  }

  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Admins can render any user's document
    const admin = await isAdmin()
    const document = await db.query.documents.findFirst({
      where: admin ? eq(documents.id, documentId) : and(eq(documents.id, documentId), eq(documents.user_id, user.id)),
      with: { line_items: { orderBy: [asc(lineItems.sort_order)] } },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const [profile] = await db
      .select({
        company_name: profiles.company_name,
        company_address: profiles.company_address,
        gst_id: profiles.gst_id,
        email: profiles.email,
        phone: profiles.phone,
        logo_url: profiles.logo_url,
        upi_id: profiles.upi_id,
        paypal_email: profiles.paypal_email,
        bank_name: profiles.bank_name,
        bank_account_name: profiles.bank_account_name,
        bank_account_number: profiles.bank_account_number,
        bank_routing_number: profiles.bank_routing_number,
        bank_swift_code: profiles.bank_swift_code,
      })
      .from(profiles)
      .where(eq(profiles.id, document.user_id))
      .limit(1)

    // Free plans can't use every template, show a logo or pick colours: render what the owner's plan allows
    const plan = await getPlanForUser(document.user_id)
    const template = allowedTemplate(plan, wantedTemplate)
    const rendered = await renderDocumentPdf(
      document as DocumentWithItems,
      applyBranding(plan, profile ?? null),
      template,
      allowedColors(plan, wantedColors)
    )

    if (wantsHtml) {
      return new NextResponse(rendered.html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "private, no-store",
          "Content-Security-Policy":
            "default-src 'none'; img-src data: https:; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com",
        },
      })
    }

    if (!rendered.pdf) {
      return NextResponse.json(
        {
          fallback: true,
          html: rendered.html,
          fileName: rendered.fileName,
          reason: rendered.error ?? "Rendering failed",
        },
        { headers: { "Cache-Control": "private, no-store" } }
      )
    }

    return new NextResponse(new Uint8Array(rendered.pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(rendered.pdf.byteLength),
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${rendered.fileName}"`,
        "Cache-Control": "private, no-store",
        "X-Document-Template": template,
      },
    })
  } catch (error) {
    console.error("[pdf] Unexpected error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
