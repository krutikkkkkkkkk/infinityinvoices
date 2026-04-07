"use client"

import { useState } from "react"
import { DocumentPreview } from "./document-preview"
import { DocumentPreviewMinimal } from "./document-preview-minimal"
import { TemplateSelector, type TemplateType } from "./template-selector"
import { PaymentsPanel } from "./payments-panel"
import { DocumentActions } from "./document-actions"
import type { Document, LineItem, Profile, Currency } from "@/lib/types"

interface DocumentDetailViewProps {
  document: Document & { line_items: LineItem[] }
  profile: Profile | null
  showActions?: boolean
}

export function DocumentDetailView({ document, profile, showActions = false }: DocumentDetailViewProps) {
  const [template, setTemplate] = useState<TemplateType>("classic")

  return (
    <div className="space-y-4">
      {showActions && (
        <div className="flex justify-end">
          <DocumentActions document={document} template={template} />
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 print:block">
          {template === "classic" ? (
            <DocumentPreview document={document} profile={profile} />
          ) : (
            <DocumentPreviewMinimal document={document} profile={profile} />
          )}
        </div>
        <div className="lg:col-span-1 space-y-4">
          {document.type === "invoice" && (
            <PaymentsPanel
              documentId={document.id}
              grandTotal={Number(document.grand_total)}
              currency={document.currency as Currency}
            />
          )}
          <TemplateSelector value={template} onChange={setTemplate} />
        </div>
      </div>
    </div>
  )
}
