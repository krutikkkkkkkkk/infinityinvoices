import {
  TEMPLATE_TYPES,
  isTemplateType,
  normalizeHexColor,
  type TemplateColors,
  type TemplateType,
} from "./generate-document-html"

/**
 * A document "style" is the template plus the colours chosen for each template.
 *
 * Colours are kept per template because each design has its own defaults: a navy
 * sidebar and a cream minimal page want different starting points, and switching
 * templates shouldn't drag one design's colours onto another.
 *
 * The style is remembered in the browser (like the template choice was) and can be
 * stored inside an invoice preset's `data.style` so a preset carries its look.
 */

export type TemplateColorMap = Partial<Record<TemplateType, Partial<TemplateColors>>>

export interface DocumentStyle {
  template: TemplateType
  colors: TemplateColorMap
}

export const DEFAULT_DOCUMENT_STYLE: DocumentStyle = { template: "classic", colors: {} }

export const DOCUMENT_STYLE_STORAGE_KEY = "infinityinvoices:document-style"
/** Key used before colours existed; read once so the remembered template survives the upgrade. */
const LEGACY_TEMPLATE_STORAGE_KEY = "infinityinvoices:document-template"

/** Keeps only valid hex values; returns undefined when nothing valid is left. */
export function parseTemplateColors(value: unknown): Partial<TemplateColors> | undefined {
  if (!value || typeof value !== "object") return undefined
  const input = value as Record<string, unknown>
  const primary = normalizeHexColor(input.primary)
  const accent = normalizeHexColor(input.accent)
  if (!primary && !accent) return undefined
  return { ...(primary ? { primary } : {}), ...(accent ? { accent } : {}) }
}

/** Validates untrusted JSON (localStorage, preset data) into a DocumentStyle, or null. */
export function parseDocumentStyle(value: unknown): DocumentStyle | null {
  if (!value || typeof value !== "object") return null
  const input = value as Record<string, unknown>
  if (!isTemplateType(input.template)) return null
  const colors: TemplateColorMap = {}
  const rawColors = input.colors && typeof input.colors === "object" ? (input.colors as Record<string, unknown>) : {}
  for (const template of TEMPLATE_TYPES) {
    const parsed = parseTemplateColors(rawColors[template])
    if (parsed) colors[template] = parsed
  }
  return { template: input.template, colors }
}

export function hasCustomColors(style: DocumentStyle, template: TemplateType = style.template): boolean {
  const colors = style.colors[template]
  return Boolean(colors && (colors.primary || colors.accent))
}

export function readStoredDocumentStyle(): DocumentStyle | null {
  try {
    const raw = window.localStorage.getItem(DOCUMENT_STYLE_STORAGE_KEY)
    if (raw) return parseDocumentStyle(JSON.parse(raw))
    const legacy = window.localStorage.getItem(LEGACY_TEMPLATE_STORAGE_KEY)
    if (isTemplateType(legacy)) return { template: legacy, colors: {} }
  } catch {
    // localStorage unavailable (private mode, blocked storage) or corrupt JSON
  }
  return null
}

export function writeStoredDocumentStyle(style: DocumentStyle): void {
  try {
    window.localStorage.setItem(DOCUMENT_STYLE_STORAGE_KEY, JSON.stringify(style))
    window.localStorage.setItem(LEGACY_TEMPLATE_STORAGE_KEY, style.template)
  } catch {
    // ignore storage failures
  }
}
