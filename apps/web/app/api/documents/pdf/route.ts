import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { isTemplateType, type TemplateType } from "@/lib/generate-document-html"
import { parseTemplateColors } from "@/lib/document-style"
import { renderDocumentPdf } from "@/lib/pdf/render"
import { getPlanForUser } from "@/lib/plan-server"
import { allowedColors, allowedTemplate, applyBranding } from "@/lib/plans"

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
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await isAdmin()
    let query = supabase.from("documents").select("*, line_items(*)").eq("id", documentId)
    if (!admin) query = query.eq("user_id", user.id)
    const { data: document, error: docError } = await query.single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "company_name, company_address, gst_id, email, phone, logo_url, upi_id, paypal_email, bank_name, bank_account_name, bank_account_number, bank_routing_number, bank_swift_code"
      )
      .eq("id", document.user_id)
      .single()

    // Free plans can't use every template, show a logo or pick colours: render what the owner's plan allows
    const plan = await getPlanForUser(document.user_id)
    const template = allowedTemplate(plan, wantedTemplate)
    const rendered = await renderDocumentPdf(
      document,
      applyBranding(plan, profile),
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
