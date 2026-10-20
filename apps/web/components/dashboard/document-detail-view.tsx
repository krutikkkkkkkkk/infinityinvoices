"use client"

import { useState } from "react"
import { DocumentPreview } from "./document-preview"
import { DocumentPreviewMinimal } from "./document-preview-minimal"
import { DocumentPreviewTax } from "./document-preview-tax"
import { DocumentPreviewDark } from "./document-preview-dark"
import { DocumentPreviewExecutive } from "./document-preview-executive"
import { DocumentPreviewBold } from "./document-preview-bold"
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

  const renderPreview = () => {
    switch (template) {
      case "minimal":
        return <DocumentPreviewMinimal document={document} profile={profile} />
      case "tax":
        return <DocumentPreviewTax document={document} profile={profile} />
      case "dark":
        return <DocumentPreviewDark document={document} profile={profile} />
      case "executive":
        return <DocumentPreviewExecutive document={document} profile={profile} />
      case "bold":
        return <DocumentPreviewBold document={document} profile={profile} />
      default:
        return <DocumentPreview document={document} profile={profile} />
    }
  }

  return (
    <div className="space-y-4">
      {showActions && (
        <div className="flex justify-end">
          <DocumentActions document={document} template={template} />
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 print:block">
          {renderPreview()}
        </div>
        <div className="lg:col-span-1 space-y-4 print:hidden">
          <TemplateSelector value={template} onChange={setTemplate} documentType={document.type} />
        </div>
      </div>
    </div>
  )
}
