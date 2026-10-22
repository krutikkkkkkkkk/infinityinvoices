"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  generateDocumentHTML,
  type DocumentWithItems,
  type TemplateColors,
  type TemplateProfile,
  type TemplateType,
} from "@/lib/generate-document-html"

/** A4 width in CSS pixels (210mm at 96dpi). */
const PAGE_WIDTH_PX = 794
/** A4 height in CSS pixels (297mm at 96dpi). */
const PAGE_HEIGHT_PX = 1123

interface DocumentPrintPreviewProps {
  document: DocumentWithItems
  profile: TemplateProfile | null
  template: TemplateType
  /** Primary/accent overrides for the template; omit for the template's defaults. */
  colors?: Partial<TemplateColors> | null
  className?: string
}

/**
 * Renders the exact HTML used for the PDF export inside a sandboxed iframe, scaled
 * to fit its container. Because it is the same generator output, what you see here
 * is what the downloaded PDF and the emailed attachment look like.
 */
export function DocumentPrintPreview({ document, profile, template, colors, className }: DocumentPrintPreviewProps) {
  const primary = colors?.primary
  const accent = colors?.accent
  const html = useMemo(
    () => generateDocumentHTML(document, profile, template, { primary, accent }),
    [document, profile, template, primary, accent]
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [scale, setScale] = useState(1)
  const [contentHeight, setContentHeight] = useState(PAGE_HEIGHT_PX)

  // Scale the fixed-width page down to the available width.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / PAGE_WIDTH_PX))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Grow the frame to the document's full height so nothing is clipped.
  const measure = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const height = Math.max(doc.documentElement?.scrollHeight ?? 0, doc.body?.scrollHeight ?? 0, PAGE_HEIGHT_PX)
    setContentHeight(height)
  }

  useEffect(() => {
    // Re-measure once web fonts and images have settled.
    const timers = [300, 1200, 2500].map((ms) => window.setTimeout(measure, ms))
    return () => timers.forEach(clearTimeout)
  }, [html])

  return (
    <div ref={containerRef} className={className} id="document-preview">
      <div
        className="mx-auto overflow-hidden rounded-md shadow-lg ring-1 ring-black/10"
        style={{ width: PAGE_WIDTH_PX * scale, height: contentHeight * scale }}
      >
        <iframe
          ref={iframeRef}
          title={`${document.type === "quotation" ? "Quotation" : "Invoice"} preview`}
          srcDoc={html}
          sandbox="allow-same-origin"
          onLoad={measure}
          scrolling="no"
          style={{
            width: PAGE_WIDTH_PX,
            height: contentHeight,
            border: 0,
            display: "block",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background: "white",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  )
}
