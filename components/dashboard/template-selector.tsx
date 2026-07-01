"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DocumentType } from "@/lib/types"

export type TemplateType = "classic" | "minimal" | "tax" | "dark" | "executive" | "bold"

export const INVOICE_TEMPLATES: {
  id: TemplateType
  label: string
  description: string
  preview: React.ReactNode
}[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Professional white",
    preview: (
      <div className="w-full h-full bg-white p-2 flex flex-col gap-1">
        <div className="flex justify-between items-start mb-1">
          <div className="w-6 h-2 bg-gray-800 rounded-sm" />
          <div className="space-y-0.5">
            <div className="w-8 h-1 bg-gray-300 rounded-sm" />
            <div className="w-10 h-1 bg-gray-300 rounded-sm" />
          </div>
        </div>
        <div className="w-full h-px bg-gray-200" />
        <div className="flex gap-1 mt-0.5">
          <div className="flex-1 space-y-0.5">
            <div className="w-8 h-1 bg-gray-400 rounded-sm" />
            <div className="w-12 h-1 bg-gray-200 rounded-sm" />
            <div className="w-10 h-1 bg-gray-200 rounded-sm" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="w-8 h-1 bg-gray-400 rounded-sm" />
            <div className="w-12 h-1 bg-gray-200 rounded-sm" />
            <div className="w-10 h-1 bg-gray-200 rounded-sm" />
          </div>
        </div>
        <div className="mt-1 w-full h-px bg-gray-200" />
        <div className="space-y-0.5 mt-0.5">
          <div className="flex justify-between">
            <div className="w-14 h-1 bg-gray-300 rounded-sm" />
            <div className="w-6 h-1 bg-gray-300 rounded-sm" />
          </div>
          <div className="flex justify-between">
            <div className="w-10 h-1 bg-gray-200 rounded-sm" />
            <div className="w-6 h-1 bg-gray-200 rounded-sm" />
          </div>
          <div className="flex justify-between">
            <div className="w-12 h-1 bg-gray-200 rounded-sm" />
            <div className="w-6 h-1 bg-gray-200 rounded-sm" />
          </div>
        </div>
        <div className="mt-auto flex justify-end gap-1">
          <div className="w-10 h-1 bg-gray-400 rounded-sm" />
          <div className="w-8 h-1 bg-gray-800 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean cream",
    preview: (
      <div className="w-full h-full p-2 flex flex-col gap-1" style={{ backgroundColor: "#f5f5f0" }}>
        <div className="flex justify-between items-start mb-1">
          <div className="w-12 h-3 bg-gray-900 rounded-sm" />
          <div className="space-y-0.5 text-right">
            <div className="w-8 h-1 bg-gray-400 rounded-sm ml-auto" />
            <div className="w-10 h-1 bg-gray-700 rounded-sm ml-auto" />
          </div>
        </div>
        <div className="w-full h-px bg-gray-400" />
        <div className="mt-0.5 space-y-0.5">
          <div className="w-8 h-1 bg-gray-700 rounded-sm" />
          <div className="w-12 h-1 bg-gray-400 rounded-sm" />
          <div className="w-10 h-1 bg-gray-400 rounded-sm" />
        </div>
        <div className="mt-1 w-full h-px bg-gray-400" />
        <div className="space-y-0.5 mt-0.5">
          <div className="flex justify-between">
            <div className="w-14 h-1 bg-gray-600 rounded-sm" />
            <div className="w-6 h-1 bg-gray-600 rounded-sm" />
          </div>
          <div className="flex justify-between">
            <div className="w-10 h-1 bg-gray-400 rounded-sm" />
            <div className="w-6 h-1 bg-gray-400 rounded-sm" />
          </div>
          <div className="flex justify-between">
            <div className="w-12 h-1 bg-gray-400 rounded-sm" />
            <div className="w-6 h-1 bg-gray-400 rounded-sm" />
          </div>
        </div>
        <div className="mt-auto w-full h-px bg-gray-400" />
        <div className="flex justify-between mt-0.5">
          <div className="w-10 h-1 bg-gray-500 rounded-sm" />
          <div className="w-10 h-1 bg-gray-500 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    id: "tax",
    label: "Tax Invoice",
    description: "GST focused",
    preview: (
      <div className="w-full h-full bg-white p-2 flex flex-col gap-1 border-2 border-red-600">
        <div className="text-center space-y-0.5 pb-1 border-b-2 border-red-600">
          <div className="w-8 h-0.5 bg-red-600 rounded-sm mx-auto" />
          <div className="w-10 h-1.5 bg-gray-800 rounded-sm mx-auto" />
          <div className="w-12 h-0.5 bg-gray-400 rounded-sm mx-auto" />
        </div>
        <div className="grid grid-cols-2 gap-1 mt-0.5 text-xs">
          <div className="space-y-0.5">
            <div className="w-6 h-0.5 bg-gray-600 rounded-sm" />
            <div className="w-10 h-1 bg-gray-700 rounded-sm" />
            <div className="w-8 h-0.5 bg-gray-400 rounded-sm" />
          </div>
          <div className="space-y-0.5 text-right">
            <div className="w-8 h-0.5 bg-gray-600 rounded-sm ml-auto" />
            <div className="w-10 h-0.5 bg-red-600 rounded-sm ml-auto" />
            <div className="w-8 h-0.5 bg-gray-400 rounded-sm ml-auto" />
          </div>
        </div>
        <div className="mt-0.5 w-full h-px bg-gray-300" />
        <div className="flex justify-between mt-0.5 text-xs">
          <div className="w-8 h-1 bg-gray-700 rounded-sm" />
          <div className="w-6 h-0.5 bg-gray-700 rounded-sm" />
        </div>
        <div className="mt-auto space-y-0.5">
          <div className="flex justify-between">
            <div className="w-6 h-0.5 bg-gray-600 rounded-sm" />
            <div className="w-6 h-0.5 bg-gray-600 rounded-sm" />
          </div>
          <div className="w-full h-px bg-gray-800" />
          <div className="flex justify-between">
            <div className="w-6 h-1 bg-gray-800 rounded-sm" />
            <div className="w-6 h-1 bg-gray-800 rounded-sm" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "dark",
    label: "Dark Modern",
    description: "Sleek dark design",
    preview: (
      <div className="w-full h-full p-2 flex flex-col gap-1" style={{ backgroundColor: "#2a2a2a" }}>
        <div className="flex justify-between items-start mb-1">
          <div className="w-8 h-8 bg-white flex items-center justify-center">
            <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
              <div className="bg-gray-900" />
              <div className="bg-gray-900" />
              <div className="bg-gray-900" />
              <div className="bg-gray-900" />
            </div>
          </div>
          <div className="text-right">
            <div className="w-16 h-2.5 bg-white rounded-sm mx-auto" />
            <div className="w-10 h-1 bg-gray-500 rounded-sm mt-0.5 ml-auto" />
          </div>
        </div>
        <div className="w-full h-px bg-gray-600 my-1" />
        <div className="flex gap-2 text-xs">
          <div className="flex-1 space-y-0.5">
            <div className="w-6 h-0.5 bg-gray-500 rounded-sm" />
            <div className="w-12 h-1 bg-gray-700 rounded-sm" />
            <div className="w-10 h-0.5 bg-gray-600 rounded-sm" />
          </div>
          <div className="flex-1 text-right space-y-0.5">
            <div className="w-6 h-0.5 bg-gray-500 rounded-sm ml-auto" />
            <div className="w-12 h-1 bg-gray-700 rounded-sm ml-auto" />
            <div className="w-10 h-0.5 bg-gray-600 rounded-sm ml-auto" />
          </div>
        </div>
        <div className="w-full h-px bg-gray-600 my-1" />
        <div className="space-y-0.5 mt-0.5">
          <div className="flex justify-between">
            <div className="w-12 h-1 bg-gray-600 rounded-sm" />
            <div className="w-6 h-0.5 bg-gray-600 rounded-sm" />
          </div>
          <div className="flex justify-between">
            <div className="w-10 h-0.5 bg-gray-700 rounded-sm" />
            <div className="w-6 h-0.5 bg-gray-700 rounded-sm" />
          </div>
          <div className="flex justify-between">
            <div className="w-8 h-1 bg-white rounded-sm" />
            <div className="w-6 h-1 bg-white rounded-sm" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "executive",
    label: "Executive",
    description: "Navy & gold sidebar",
    pro: true,
    preview: (
      <div className="w-full h-full flex overflow-hidden rounded">
        {/* Navy sidebar */}
        <div className="w-8 flex flex-col gap-1 p-1.5" style={{ backgroundColor: "#1e3a5f" }}>
          <div className="w-4 h-4 bg-white rounded-sm mx-auto mb-1" />
          <div className="w-3 h-0.5 bg-white/60 rounded-sm" />
          <div className="w-4 h-0.5 bg-white/40 rounded-sm" />
          <div className="w-3 h-0.5 bg-white/40 rounded-sm" />
          <div className="mt-auto w-5 h-5 bg-white rounded-sm mx-auto" />
        </div>
        {/* Content area */}
        <div className="flex-1 bg-white p-1.5 flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <div className="w-10 h-1.5 rounded-sm" style={{ backgroundColor: "#1e3a5f" }} />
              <div className="w-8 h-0.5 bg-gray-300 rounded-sm" />
            </div>
            <div className="space-y-0.5">
              <div className="w-6 h-0.5 bg-gray-300 rounded-sm ml-auto" />
              <div className="w-8 h-0.5 rounded-sm ml-auto" style={{ backgroundColor: "#d4af37" }} />
            </div>
          </div>
          <div className="w-full h-px" style={{ backgroundColor: "#d4af37" }} />
          <div className="p-1 bg-gray-50 rounded space-y-0.5">
            <div className="w-6 h-0.5 bg-gray-400 rounded-sm" />
            <div className="w-10 h-1 bg-gray-700 rounded-sm" />
          </div>
          <div className="space-y-0.5 mt-0.5">
            <div className="flex justify-between">
              <div className="w-10 h-1 rounded-sm" style={{ backgroundColor: "#1e3a5f" }} />
              <div className="w-6 h-1 rounded-sm" style={{ backgroundColor: "#1e3a5f" }} />
            </div>
            <div className="flex justify-between">
              <div className="w-8 h-0.5 bg-gray-300 rounded-sm" />
              <div className="w-5 h-0.5 bg-gray-300 rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "bold",
    label: "Bold",
    description: "Dark header, clean body",
    pro: true,
    preview: (
      <div className="w-full h-full flex flex-col overflow-hidden rounded">
        {/* Black header band */}
        <div className="bg-[#0d0d0d] p-2 flex justify-between items-start">
          <div className="space-y-0.5">
            <div className="w-5 h-1 bg-white rounded-sm" />
            <div className="w-8 h-0.5 bg-gray-500 rounded-sm" />
          </div>
          <div className="text-right">
            <div className="w-10 h-2 bg-white rounded-sm" />
            <div className="w-6 h-0.5 bg-gray-500 rounded-sm mt-0.5 ml-auto" />
          </div>
        </div>
        {/* Amber accent bar */}
        <div className="h-0.5 bg-amber-400 w-full" />
        {/* Body */}
        <div className="flex-1 bg-white p-2 flex flex-col gap-1">
          <div className="w-10 h-1.5 bg-gray-900 rounded-sm" />
          <div className="w-8 h-0.5 bg-gray-400 rounded-sm" />
          <div className="w-full h-px bg-gray-300 my-0.5" />
          <div className="space-y-0.5">
            <div className="flex justify-between">
              <div className="w-12 h-0.5 bg-gray-700 rounded-sm" />
              <div className="w-5 h-0.5 bg-gray-700 rounded-sm" />
            </div>
            <div className="flex justify-between">
              <div className="w-8 h-0.5 bg-gray-300 rounded-sm" />
              <div className="w-4 h-0.5 bg-gray-300 rounded-sm" />
            </div>
          </div>
          <div className="mt-auto bg-[#0d0d0d] flex justify-between px-1.5 py-1">
            <div className="w-5 h-1 bg-white rounded-sm" />
            <div className="w-6 h-1 bg-amber-400 rounded-sm" />
          </div>
        </div>
      </div>
    ),
  },
]

export const QUOTATION_TEMPLATES: {
  id: TemplateType
  label: string
  description: string
  preview: React.ReactNode
}[] = [
  ...INVOICE_TEMPLATES, // Quotations can use the same template designs
]

// Export merged templates for backward compatibility
export const TEMPLATES = INVOICE_TEMPLATES

export function getTemplatesForDocumentType(type: DocumentType) {
  return type === "quotation" ? QUOTATION_TEMPLATES : INVOICE_TEMPLATES
}

interface TemplateSelectorProps {
  value: TemplateType
  onChange: (template: TemplateType) => void
  documentType?: DocumentType
}

export function TemplateSelector({ value, onChange, documentType = "invoice" }: TemplateSelectorProps) {
  const templates = getTemplatesForDocumentType(documentType)
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Template</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {templates.map((tpl) => {
            const isSelected = value === tpl.id
            return (
              <button
                key={tpl.id}
                onClick={() => onChange(tpl.id)}
                className={cn(
                  "relative flex-none w-28 rounded-lg border-2 p-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-muted bg-background hover:border-primary/60 cursor-pointer"
                )}
                title={tpl.label}
              >
                {/* Thumbnail */}
                <div className="aspect-[3/4] rounded overflow-hidden border border-border w-full mb-1.5">
                  {tpl.preview}
                </div>

                {/* Label */}
                <p className="text-xs font-medium text-center truncate">{tpl.label}</p>
                <p className="text-[10px] text-muted-foreground text-center truncate">{tpl.description}</p>

                {/* Selected check */}
                {isSelected && (
                  <span className="absolute top-1 right-1 text-primary">
                    <CheckCircleIcon className="w-3.5 h-3.5 fill-primary text-primary-foreground" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
