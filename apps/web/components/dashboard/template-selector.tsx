"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import Link from "next/link"
import { CheckIcon, LockIcon, SparklesIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSubscription } from "@/hooks/use-subscription"
import { canUseTemplate } from "@/lib/plans"
import { cn } from "@/lib/utils"
import {
  TEMPLATE_LABELS,
  generateDocumentHTML,
  suggestGstSplit,
  type DocumentWithItems,
  type TemplateColors,
  type TemplateProfile,
  type TemplateType,
} from "@/lib/generate-document-html"
import type { TemplateColorMap } from "@/lib/document-style"
import type { DocumentType } from "@/lib/types"

export type { TemplateType }

export type TemplateCategory = "standard" | "gst"

export interface TemplateMeta {
  id: TemplateType
  label: string
  description: string
  category: TemplateCategory
}

export const TEMPLATE_CATEGORIES: readonly { id: TemplateCategory; label: string; hint: string }[] = [
  { id: "standard", label: "Standard", hint: "Designs for any country and tax." },
  {
    id: "gst",
    label: "GST (India)",
    hint: "Tax invoices with an HSN/SAC column. Pick the one that matches where your client is.",
  },
]

export const INVOICE_TEMPLATES: readonly TemplateMeta[] = [
  { id: "classic", label: TEMPLATE_LABELS.classic, description: "Clean, modern, accent bar", category: "standard" },
  { id: "minimal", label: TEMPLATE_LABELS.minimal, description: "Cream paper, typographic", category: "standard" },
  { id: "dark", label: TEMPLATE_LABELS.dark, description: "Charcoal, high contrast", category: "standard" },
  { id: "executive", label: TEMPLATE_LABELS.executive, description: "Navy sidebar, gold accents", category: "standard" },
  { id: "bold", label: TEMPLATE_LABELS.bold, description: "Black header, amber accent", category: "standard" },
  { id: "cgst_sgst", label: TEMPLATE_LABELS.cgst_sgst, description: "Client in your state", category: "gst" },
  { id: "igst", label: TEMPLATE_LABELS.igst, description: "Client in another state", category: "gst" },
  { id: "cgst_utgst", label: TEMPLATE_LABELS.cgst_utgst, description: "Within a union territory", category: "gst" },
  { id: "tax", label: TEMPLATE_LABELS.tax, description: "Total GST, not split", category: "gst" },
]

// Quotations can use the same template designs.
export const QUOTATION_TEMPLATES: readonly TemplateMeta[] = INVOICE_TEMPLATES

// Merged list kept for callers that don't care about the document type.
export const TEMPLATES = INVOICE_TEMPLATES

export function getTemplatesForDocumentType(type: DocumentType): readonly TemplateMeta[] {
  return type === "quotation" ? QUOTATION_TEMPLATES : INVOICE_TEMPLATES
}

/** A4 at 96dpi, matching the print preview and PDF export. */
const PAGE_WIDTH_PX = 794
const PAGE_HEIGHT_PX = 1123

interface TemplateThumbnailProps {
  document: DocumentWithItems
  profile: TemplateProfile | null
  template: TemplateType
  colors?: Partial<TemplateColors>
}

/**
 * First page of the real document rendered with the given template, scaled down to
 * fit its tile. It uses the same HTML generator as the PDF, so the thumbnail is an
 * honest preview rather than a hand-drawn approximation.
 */
function TemplateThumbnail({ document, profile, template, colors }: TemplateThumbnailProps) {
  const primary = colors?.primary
  const accent = colors?.accent
  const html = useMemo(
    () => generateDocumentHTML(document, profile, template, { primary, accent }),
    [document, profile, template, primary, accent]
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setScale(el.clientWidth / PAGE_WIDTH_PX)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative aspect-210/297 w-full overflow-hidden bg-white">
      {scale > 0 && (
        <iframe
          title=""
          aria-hidden
          tabIndex={-1}
          srcDoc={html}
          sandbox="allow-same-origin"
          loading="lazy"
          scrolling="no"
          style={{
            width: PAGE_WIDTH_PX,
            height: PAGE_HEIGHT_PX,
            border: 0,
            display: "block",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            pointerEvents: "none",
            background: "white",
          }}
        />
      )}
    </div>
  )
}

interface TemplateSelectorProps {
  value: TemplateType
  onChange: (template: TemplateType) => void
  documentType?: DocumentType
  /** The document being viewed; each tile renders it with that template. */
  document: DocumentWithItems
  /** Profile with the plan's branding rules already applied, so tiles match the main preview. */
  profile: TemplateProfile | null
  /** Each template's chosen colours, so every tile shows how that template is currently set up. */
  colors?: TemplateColorMap
}

const ARROW_DIRECTION: Record<string, 1 | -1> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
}

export function TemplateSelector({
  value,
  onChange,
  documentType = "invoice",
  document,
  profile,
  colors,
}: TemplateSelectorProps) {
  const allTemplates = getTemplatesForDocumentType(documentType)
  const { plan, isLoading: isPlanLoading } = useSubscription()
  const groupRef = useRef<HTMLDivElement>(null)

  // Until the plan has loaded, treat every template as allowed so Pro users don't see a flash of locks.
  const isLocked = (id: TemplateType) => !isPlanLoading && !canUseTemplate(plan, id)
  const lockedCount = allTemplates.filter((tpl) => isLocked(tpl.id)).length
  const current = allTemplates.find((tpl) => tpl.id === value) ?? allTemplates[0]

  // The tab follows the selected template, so applying a preset or reopening a document shows its category.
  const [category, setCategory] = useState<TemplateCategory>(current.category)
  useEffect(() => setCategory(current.category), [current.category])
  const templates = allTemplates.filter((tpl) => tpl.category === category)
  const activeCategory = TEMPLATE_CATEGORIES.find((entry) => entry.id === category) ?? TEMPLATE_CATEGORIES[0]

  // Both GSTINs start with a state code, which is enough to tell which GST split applies.
  const suggested = suggestGstSplit(profile?.gst_id, document.client_gst_id)

  // Roving tabindex: arrow keys move the selection between unlocked templates.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = ARROW_DIRECTION[event.key]
    if (!direction) return
    event.preventDefault()
    const selectable = templates.filter((tpl) => !isLocked(tpl.id))
    if (selectable.length === 0) return
    // -1 when the selected template is on the other tab: the first arrow press then lands on this tab's first.
    const index = selectable.findIndex((tpl) => tpl.id === current.id)
    const next = selectable[(Math.max(index, direction === 1 ? -1 : 0) + direction + selectable.length) % selectable.length]
    onChange(next.id)
    groupRef.current?.querySelector<HTMLButtonElement>(`[data-template="${next.id}"]`)?.focus()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Template</CardTitle>
        <CardDescription>
          Using <span className="font-medium text-foreground">{current.label}</span>. Your choice is remembered for
          your next document.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div role="tablist" aria-label="Template category" className="mb-2 flex gap-1 rounded-lg bg-muted p-1">
          {TEMPLATE_CATEGORIES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={category === entry.id}
              onClick={() => setCategory(entry.id)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring",
                category === entry.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {entry.label}
              <span className="ml-1.5 tabular-nums opacity-60">
                {allTemplates.filter((tpl) => tpl.category === entry.id).length}
              </span>
            </button>
          ))}
        </div>
        <p className="mb-3 text-xs text-muted-foreground">{activeCategory.hint}</p>

        <div
          ref={groupRef}
          role="radiogroup"
          aria-label="Document template"
          onKeyDown={handleKeyDown}
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3"
        >
          {templates.map((tpl, tileIndex) => {
            const isSelected = current.id === tpl.id
            const locked = isLocked(tpl.id)
            const isSuggested = suggested === tpl.id
            const isTabStop = isSelected || (current.category !== category && tileIndex === 0)

            const tile = (
              <button
                key={tpl.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={locked || undefined}
                aria-label={`${tpl.label}${locked ? " (Pro template)" : ""}${isSuggested ? " (matches the GSTINs on this document)" : ""}`}
                tabIndex={isTabStop ? 0 : -1}
                data-template={tpl.id}
                onClick={() => {
                  if (!locked) onChange(tpl.id)
                }}
                className={cn(
                  "group relative flex w-full flex-col rounded-xl border-2 p-1.5 text-left outline-none transition-all",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-background hover:border-primary/50 hover:shadow-sm",
                  locked && "cursor-not-allowed hover:border-border hover:shadow-none"
                )}
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-lg ring-1 ring-black/10 transition-transform",
                    !locked && !isSelected && "group-hover:-translate-y-0.5"
                  )}
                >
                  <TemplateThumbnail document={document} profile={profile} template={tpl.id} colors={colors?.[tpl.id]} />

                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-background shadow">
                        <LockIcon className="size-3" aria-hidden />
                        Pro
                      </span>
                    </div>
                  )}

                  {isSelected && (
                    <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-background">
                      <CheckIcon className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                  )}
                </div>

                <div className="px-0.5 pb-0.5 pt-2">
                  <p className={cn("truncate text-xs font-semibold leading-tight", locked && "text-muted-foreground")}>
                    {tpl.label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                    {tpl.description}
                  </p>
                  {isSuggested && (
                    <p className="mt-1 inline-flex rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-primary">
                      Matches GSTINs
                    </p>
                  )}
                </div>
              </button>
            )

            if (!locked) return tile

            return (
              <Tooltip key={tpl.id}>
                <TooltipTrigger asChild>{tile}</TooltipTrigger>
                <TooltipContent side="top">Available on the Pro plan</TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {lockedCount > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed p-3">
            <SparklesIcon className="size-4 shrink-0 text-primary" aria-hidden />
            <p className="flex-1 text-xs text-muted-foreground">
              {lockedCount === 1 ? "1 more template" : `${lockedCount} more templates`} on Pro, plus your logo and
              share links.
            </p>
            <Link
              href="/dashboard/plan"
              className="shrink-0 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Upgrade
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
