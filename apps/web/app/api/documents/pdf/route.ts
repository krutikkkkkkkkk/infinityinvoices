import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateDocumentHTML, type TemplateType } from "@/lib/generate-document-html"
import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"

export async function GET(request: NextRequest) {
  try {
    const documentId = request.nextUrl.searchParams.get("id")
    const template = (request.nextUrl.searchParams.get("template") || "classic") as TemplateType

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

    // Generate HTML using shared generator with selected template
    const baseHtml = generateDocumentHTML(document, profile, template)
    
    // Inject print styles for proper color rendering and page breaks
    const html = baseHtml.replace(
      "</style>",
      `
    /* Print color rendering */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Page break utilities */
    .page-break {
      break-after: page;
      page-break-after: always;
    }
    
    .no-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    /* Ensure table rows don't break */
    tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    /* Ensure totals section stays together */
    .totals {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    /* Ensure payment info stays together */
    .payment-info {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>`
    )

    try {
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      })

      try {
        const page = await browser.newPage()

        await page.setContent(html, {
          waitUntil: "networkidle0",
        })

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

        return new NextResponse(pdf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${document.number || document.type}-${Date.now()}.pdf"`,
          },
        })
      } finally {
        await browser.close()
      }
    } catch (pdfError) {
      console.error("Server PDF generation failed, using fallback:", pdfError)
      return NextResponse.json({
        fallback: true,
        html,
      })
    }
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
