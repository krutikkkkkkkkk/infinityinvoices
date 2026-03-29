import { NextRequest, NextResponse } from "next/server"
import { chromium } from "playwright"
import { createClient } from "@/lib/supabase/server"

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

    // Fetch document with line items
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*, line_items(*), profiles(company_name, company_address, gst_id, email, phone, logo_url)")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Generate preview URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const previewUrl = `${appUrl}/invoice-preview?documentId=${documentId}`

    // Launch Playwright browser
    const browser = await chromium.launch({
      headless: true,
    })

    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 }, // A4 in pixels at 96 DPI
    })

    // Navigate to preview page
    await page.goto(previewUrl, {
      waitUntil: "networkidle",
      timeout: 30000,
    })

    // Wait for content to fully render
    await page.waitForLoadState("domcontentloaded")
    await page.waitForTimeout(500)

    // Generate PDF with A4 format
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    })

    await browser.close()

    // Return PDF as file download
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.number || document.type}-${Date.now()}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
