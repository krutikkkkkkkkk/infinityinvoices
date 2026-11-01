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
  generateDocumentHTML,
  type DocumentWithItems,
  type TemplateColors,
  type TemplateProfile,
  type TemplateType,
} from "@/lib/generate-document-html"
import type { TemplateColorMap } from "@/lib/document-style"
import type { DocumentType } from "@/lib/types"

export type { TemplateType }

export interface TemplateMeta {
  id: TemplateType
  label: string
  description: string
}

export const INVOICE_TEMPLATES: readonly TemplateMeta[] = [
  { id: "classic", label: "Classic", description: "Clean, modern, accent bar" },
  { id: "minimal", label: "Minimal", description: "Cream paper, typographic" },
  { id: "tax", label: "Tax Invoice", description: "GST layout, amount in words" },
  { id: "dark", label: "Dark Modern", description: "Charcoal, high contrast" },
  { id: "executive", label: "Executive", description: "Navy sidebar, gold accents" },
  { id: "bold", label: "Bold", description: "Black header, amber accent" },
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
  const templates = getTemplatesForDocumentType(documentType)
  const { plan, isLoading: isPlanLoading } = useSubscription()
  const groupRef = useRef<HTMLDivElement>(null)

  // Until the plan has loaded, treat every template as allowed so Pro users don't see a flash of locks.
  const isLocked = (id: TemplateType) => !isPlanLoading && !canUseTemplate(plan, id)
  const lockedCount = templates.filter((tpl) => isLocked(tpl.id)).length
  const current = templates.find((tpl) => tpl.id === value) ?? templates[0]

  // Roving tabindex: arrow keys move the selection between unlocked templates.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = ARROW_DIRECTION[event.key]
    if (!direction) return
    event.preventDefault()
    const selectable = templates.filter((tpl) => !isLocked(tpl.id))
    if (selectable.length === 0) return
    const index = selectable.findIndex((tpl) => tpl.id === current.id)
    const next = selectable[(index + direction + selectable.length) % selectable.length]
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
        <div
          ref={groupRef}
          role="radiogroup"
          aria-label="Document template"
          onKeyDown={handleKeyDown}
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3"
        >
          {templates.map((tpl) => {
            const isSelected = current.id === tpl.id
            const locked = isLocked(tpl.id)

            const tile = (
              <button
                key={tpl.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={locked || undefined}
                aria-label={`${tpl.label}${locked ? " (Pro template)" : ""}`}
                tabIndex={isSelected ? 0 : -1}
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
