"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckIcon, LockIcon, RotateCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listInvoicePresets, type InvoicePresetSummary } from "@/app/dashboard/invoicing/actions"
import type { DocumentStyle } from "@/lib/document-style"
import {
  TEMPLATE_DEFAULT_COLORS,
  normalizeHexColor,
  resolveTemplateColors,
  type TemplateColors,
  type TemplateType,
} from "@/lib/generate-document-html"
import { cn } from "@/lib/utils"

/** Quick picks shown under each colour; the template's own default is always listed first. */
const SWATCHES = [
  "#111827",
  "#1e3a5f",
  "#1d4ed8",
  "#0f766e",
  "#15803d",
  "#b91c1c",
  "#c2410c",
  "#7c3aed",
  "#be185d",
  "#d4af37",
]

interface ColorFieldProps {
  id: string
  label: string
  hint: string
  value: string
  defaultValue: string
  disabled: boolean
  onChange: (hex: string) => void
}

function ColorField({ id, label, hint, value, defaultValue, disabled, onChange }: ColorFieldProps) {
  const [draft, setDraft] = useState(value)

  // Keep the text box in sync when the colour changes from elsewhere (swatch, reset, preset).
  useEffect(() => setDraft(value), [value])

  const commit = (input: string) => {
    const hex = normalizeHexColor(input)
    if (hex && hex !== value) onChange(hex)
  }

  const swatches = [defaultValue, ...SWATCHES.filter((hex) => hex !== defaultValue)]

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} colour picker`}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-background p-0.5 disabled:cursor-not-allowed [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
        />
        <Input
          id={id}
          value={draft}
          disabled={disabled}
          spellCheck={false}
          maxLength={7}
          className="font-mono uppercase"
          onChange={(event) => {
            setDraft(event.target.value)
            commit(event.target.value)
          }}
          onBlur={() => setDraft(value)}
        />
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${label} quick colours`}>
        {swatches.map((hex, index) => {
          const selected = hex === value
          return (
            <button
              key={hex}
              type="button"
              title={index === 0 ? `Template default (${hex})` : hex}
              aria-label={index === 0 ? `Template default ${hex}` : hex}
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(hex)}
              className={cn(
                "flex size-6 items-center justify-center rounded-full border border-black/10 transition-transform",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                !disabled && "hover:scale-110",
                selected && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                disabled && "cursor-not-allowed opacity-60"
              )}
              style={{ backgroundColor: hex }}
            >
              {selected && <CheckIcon className="size-3 text-white mix-blend-difference" strokeWidth={3} aria-hidden />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface DocumentStyleControlsProps {
  template: TemplateType
  /** Overrides for the current template; undefined means the template's defaults. */
  colors: Partial<TemplateColors> | undefined
  onChange: (colors: Partial<TemplateColors> | undefined) => void
  /** Applies a preset's saved template and colours. */
  onApplyPreset: (style: DocumentStyle) => void
  /** True on plans without custom branding: controls show but can't be used. */
  locked: boolean
}

/**
 * Primary and accent colour editing for the selected template. Colours feed the same
 * HTML generator as the preview, thumbnails, PDF and email attachment, so the preview
 * is an exact picture of what gets sent. Saved presets carry a look that can be
 * applied here, and "Save as preset" stores the current one.
 */
export function DocumentStyleControls({ template, colors, onChange, onApplyPreset, locked }: DocumentStyleControlsProps) {
  const defaults = TEMPLATE_DEFAULT_COLORS[template]
  const resolved = resolveTemplateColors(template, colors)
  const isCustom = resolved.primary !== defaults.primary || resolved.accent !== defaults.accent

  const [presets, setPresets] = useState<InvoicePresetSummary[]>([])
  const [selectedPreset, setSelectedPreset] = useState("")

  useEffect(() => {
    let cancelled = false
    listInvoicePresets()
      .then((rows) => {
        if (!cancelled) setPresets(rows.filter((row) => row.style))
      })
      .catch(() => {
        // Presets are optional here; the colour editor still works without them.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const update = (key: keyof TemplateColors, hex: string) => {
    const next: Partial<TemplateColors> = { ...colors, [key]: hex }
    // Dropping overrides that equal the default keeps "custom" meaning "differs from the template".
    if (next.primary === defaults.primary) delete next.primary
    if (next.accent === defaults.accent) delete next.accent
    onChange(next.primary || next.accent ? next : undefined)
  }

  const applyPreset = (id: string) => {
    const preset = presets.find((row) => row.id === id)
    if (preset?.style) onApplyPreset(preset.style)
    setSelectedPreset("")
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Colours</CardTitle>
            <CardDescription>
              {locked
                ? "Pick your own primary and accent colours on the Pro plan."
                : "Your own primary and accent colours for this template. Use “Save as preset” to keep a look."}
            </CardDescription>
          </div>
          {!locked && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              disabled={!isCustom}
              onClick={() => onChange(undefined)}
            >
              <RotateCcwIcon className="mr-1.5 size-3.5" aria-hidden />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative space-y-5 pb-4">
        <ColorField
          id="style-primary"
          label="Primary"
          hint="headers, bands, totals"
          value={resolved.primary}
          defaultValue={defaults.primary}
          disabled={locked}
          onChange={(hex) => update("primary", hex)}
        />
        <ColorField
          id="style-accent"
          label="Accent"
          hint="rules, due date, balance"
          value={resolved.accent}
          defaultValue={defaults.accent}
          disabled={locked}
          onChange={(hex) => update("accent", hex)}
        />

        {!locked && presets.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="style-preset">Saved looks</Label>
            <Select value={selectedPreset} onValueChange={applyPreset}>
              <SelectTrigger id="style-preset">
                <SelectValue placeholder="Apply a preset’s template & colours…" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => {
                  const style = preset.style!
                  const swatch = resolveTemplateColors(style.template, style.colors[style.template])
                  return (
                    <SelectItem key={preset.id} value={preset.id}>
                      <span className="flex items-center gap-2">
                        <span className="flex -space-x-1">
                          <span className="size-3 rounded-full border border-black/10" style={{ backgroundColor: swatch.primary }} />
                          <span className="size-3 rounded-full border border-black/10" style={{ backgroundColor: swatch.accent }} />
                        </span>
                        {preset.name}
                        <span className="text-muted-foreground capitalize">· {style.template}</span>
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {locked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-b-xl bg-background/60 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-background shadow">
                <LockIcon className="size-3" aria-hidden />
                Pro
              </span>
              <Link href="/dashboard/plan" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
                Upgrade to use custom colours
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
