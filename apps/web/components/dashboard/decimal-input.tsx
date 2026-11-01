"use client"

import { useEffect, useState, type ComponentProps } from "react"
import { Input } from "@/components/ui/input"

type DecimalInputProps = Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange" | "inputMode" | "max"> & {
  value: number
  onValueChange: (value: number) => void
  /** Digits allowed after the decimal point (default 2). */
  decimals?: number
  /** Upper bound; typing a larger number is ignored. */
  max?: number
}

const toText = (value: number) => (Number.isFinite(value) ? String(value) : "0")

/**
 * A text field for amounts and quantities. Unlike `type="number"` it has no spinner, doesn't keep
 * leading zeros ("01000"), and only accepts digits with an optional decimal part.
 */
export function DecimalInput({ value, onValueChange, decimals = 2, max, onFocus, onBlur, ...props }: DecimalInputProps) {
  const [text, setText] = useState(() => toText(value))
  const pattern = new RegExp(`^\\d*${decimals > 0 ? `(\\.\\d{0,${decimals}})?` : ""}$`)

  // Follow outside changes (e.g. picking a product from the catalog) without clobbering
  // in-progress input like "12." that already parses to the same number.
  useEffect(() => {
    setText((current) => ((parseFloat(current) || 0) === value ? current : toText(value)))
  }, [value])

  return (
    <Input
      {...props}
      type="text"
      inputMode={decimals > 0 ? "decimal" : "numeric"}
      autoComplete="off"
      value={text}
      onFocus={(e) => {
        e.currentTarget.select()
        onFocus?.(e)
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/,/g, "").trim()
        if (!pattern.test(raw)) return
        // Drop leading zeros but keep "0" and "0.x"
        const next = raw.replace(/^0+(?=\d)/, "")
        const parsed = parseFloat(next) || 0
        if (max !== undefined && parsed > max) return
        setText(next)
        onValueChange(parsed)
      }}
      onBlur={(e) => {
        setText(toText(parseFloat(text) || 0))
        onBlur?.(e)
      }}
    />
  )
}
