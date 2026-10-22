"use client"

import { useEffect, useMemo, useState } from "react"
import { DocumentPrintPreview } from "./document-print-preview"
import { TemplateSelector, type TemplateType } from "./template-selector"
import { DocumentStyleControls } from "./document-style-controls"
import { DocumentActions } from "./document-actions"
import type { Document, LineItem, Profile } from "@/lib/types"
import { useSubscription } from "@/hooks/use-subscription"
import { applyBranding, canUseTemplate } from "@/lib/plans"
import type { TemplateColors } from "@/lib/generate-document-html"
import {
  DEFAULT_DOCUMENT_STYLE,
  readStoredDocumentStyle,
  writeStoredDocumentStyle,
  type DocumentStyle,
} from "@/lib/document-style"

interface DocumentDetailViewProps {
  document: Document & { line_items: LineItem[] }
  profile: Profile | null
  showActions?: boolean
}

export function DocumentDetailView({ document, profile, showActions = false }: DocumentDetailViewProps) {
  const [style, setStyleState] = useState<DocumentStyle>(DEFAULT_DOCUMENT_STYLE)
  const { plan, isLoading: isPlanLoading } = useSubscription()

  // A remembered Pro template on a Free plan falls back to Classic, matching what the PDF route renders
  const activeTemplate: TemplateType =
    isPlanLoading || canUseTemplate(plan, style.template) ? style.template : "classic"
  // Custom colours are part of custom branding; the PDF route ignores them on Free plans too
  const canCustomize = isPlanLoading || plan.customBranding
  const activeColors: Partial<TemplateColors> | undefined = canCustomize ? style.colors[activeTemplate] : undefined

  // Remember the look the user picked so exports stay consistent across documents.
  useEffect(() => {
    const stored = readStoredDocumentStyle()
    if (stored) setStyleState(stored)
  }, [])

  const updateStyle = (next: DocumentStyle) => {
    setStyleState(next)
    writeStoredDocumentStyle(next)
  }

  const setTemplate = (template: TemplateType) => updateStyle({ ...style, template })

  const setColors = (colors: Partial<TemplateColors> | undefined) => {
    const next = { ...style.colors }
    if (colors) next[activeTemplate] = colors
    else delete next[activeTemplate]
    updateStyle({ ...style, colors: next })
  }

  // A preset brings its template and the colours it saved; colours for other templates are kept.
  const applyPresetStyle = (preset: DocumentStyle) =>
    updateStyle({ template: preset.template, colors: { ...style.colors, ...preset.colors } })

  // The preview is the same HTML the PDF export and email attachment use, with the
  // plan's branding rules applied, so it always matches the downloaded file.
  // Memoised so the preview and the template thumbnails don't reload their iframes on every render.
  const previewProfile = useMemo(
    () => (isPlanLoading ? profile : applyBranding(plan, profile)),
    [isPlanLoading, plan, profile]
  )

  return (
    <div className="space-y-4">
      {showActions && (
        <div className="flex justify-end">
          <DocumentActions document={document} template={activeTemplate} colors={activeColors} />
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 print:block">
          <DocumentPrintPreview
            document={document}
            profile={previewProfile}
            template={activeTemplate}
            colors={activeColors}
          />
        </div>
        <div className="lg:col-span-1 space-y-4 print:hidden">
          <TemplateSelector
            value={activeTemplate}
            onChange={setTemplate}
            documentType={document.type}
            document={document}
            profile={previewProfile}
            colors={canCustomize ? style.colors : undefined}
          />
          <DocumentStyleControls
            template={activeTemplate}
            colors={activeColors}
            onChange={setColors}
            onApplyPreset={applyPresetStyle}
            locked={!isPlanLoading && !plan.customBranding}
          />
        </div>
      </div>
    </div>
  )
}
