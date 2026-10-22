"use client"

import { useEffect } from "react"
import { writeStoredDocumentStyle, type DocumentStyle } from "@/lib/document-style"

/**
 * Makes a preset's saved look the current one, so a document created from that
 * preset opens with the preset's template and colours already selected.
 */
export function ApplyDocumentStyle({ style }: { style: DocumentStyle | null }) {
  const serialized = style ? JSON.stringify(style) : null
  useEffect(() => {
    if (serialized) writeStoredDocumentStyle(JSON.parse(serialized) as DocumentStyle)
  }, [serialized])
  return null
}
