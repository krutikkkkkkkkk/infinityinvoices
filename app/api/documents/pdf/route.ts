import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateDocumentHTML } from "@/lib/generate-document-html"

export async function GET(request: NextRequest) {
  try {
    const documentId = request.nextUrl.searchParams.get("id")

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 })
    }

    // Verify authentication and ownership
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch document with line items and profile
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*, line_items(*)")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, company_address, gst_id, email, phone, logo_url, upi_id, paypal_email, bank_name, bank_account_name, bank_account_number, bank_routing_number, bank_swift_code")
      .eq("id", user.id)
      .single()

    // Generate HTML using shared generator
    const html = generateDocumentHTML(document, profile)

    // Use Browserless if available, otherwise return HTML for client-side rendering
    const browserlessUrl = process.env.BROWSERLESS_URL

    if (browserlessUrl) {
      // Use Browserless PDF API
      const response = await fetch(`${browserlessUrl}/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          options: {
            format: "A4",
            printBackground: true,
            margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Browserless PDF generation failed")
      }

      const pdf = await response.arrayBuffer()

      return new NextResponse(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${document.number || document.type}-${Date.now()}.pdf"`,
        },
      })
    }

    // Fallback: Return HTML with instructions to use client-side rendering
    // The client will use html2canvas as fallback
    return NextResponse.json({ html, fallback: true }, { status: 200 })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
