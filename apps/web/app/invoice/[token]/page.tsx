import type { Metadata } from "next"
import { cache } from "react"
import { notFound } from "next/navigation"
import { DocumentPrintPreview } from "@/components/dashboard/document-print-preview"
import { SharedDocumentDownload } from "@/components/share/shared-document-download"
import { Toaster } from "@/components/ui/sonner"
import { loadSharedDocument } from "@/lib/shared-document"

// One load per request, shared by generateMetadata and the page
const getSharedDocument = cache(loadSharedDocument)

type Props = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shared = await getSharedDocument((await params).token)
  const label = shared?.document.type === "quotation" ? "Quotation" : "Invoice"
  return {
    title: shared ? `${label} ${shared.document.number}` : "Document not found",
    // Share links are private by obscurity: keep them out of search engines and Referer headers
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  }
}

export default async function SharedDocumentPage({ params }: Props) {
  const { token } = await params
  const shared = await getSharedDocument(token)
  if (!shared) notFound()

  const { document, profile, template, colors } = shared
  const label = document.type === "quotation" ? "Quotation" : "Invoice"

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {label} {document.number}
            </p>
            {profile?.company_name && <p className="truncate font-semibold">{profile.company_name}</p>}
          </div>
          <SharedDocumentDownload token={token} fileName={`${label}-${document.number}.pdf`} />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <DocumentPrintPreview document={document} profile={profile} template={template} colors={colors} />
      </main>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  )
}
