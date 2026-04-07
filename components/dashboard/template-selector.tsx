"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type TemplateType = "classic" | "minimal"

export const TEMPLATES: {
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
]

interface TemplateSelectorProps {
  value: TemplateType
  onChange: (template: TemplateType) => void
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Template</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {TEMPLATES.map((tpl) => {
            const isSelected = value === tpl.id
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onChange(tpl.id)}
                className={cn(
                  "relative flex-none w-28 rounded-lg border-2 p-1.5 transition-all hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-muted bg-background"
                )}
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
