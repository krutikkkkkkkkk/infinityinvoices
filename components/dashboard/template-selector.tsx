"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export type TemplateType = "classic" | "minimal"

interface TemplateSelectorProps {
  value: TemplateType
  onChange: (template: TemplateType) => void
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Template Style</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value}
          onValueChange={(v) => onChange(v as TemplateType)}
          className="grid grid-cols-2 gap-4"
        >
          {/* Classic Template */}
          <Label
            htmlFor="classic"
            className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:border-primary/50 ${
              value === "classic" ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            <RadioGroupItem value="classic" id="classic" className="sr-only" />
            <div className="mb-2 aspect-[3/4] rounded border bg-white p-2">
              {/* Mini preview of classic template */}
              <div className="flex justify-between mb-2">
                <div className="w-8 h-2 bg-gray-300 rounded" />
                <div className="w-6 h-3 bg-gray-800 rounded" />
              </div>
              <div className="w-full h-2 bg-gray-100 rounded mb-2" />
              <div className="space-y-1">
                <div className="w-full h-1 bg-gray-200 rounded" />
                <div className="w-full h-1 bg-gray-200 rounded" />
                <div className="w-full h-1 bg-gray-200 rounded" />
              </div>
              <div className="mt-2 ml-auto w-12 h-2 bg-gray-800 rounded" />
            </div>
            <p className="text-sm font-medium text-center">Classic</p>
            <p className="text-xs text-muted-foreground text-center">
              Professional white design
            </p>
          </Label>

          {/* Minimal Template */}
          <Label
            htmlFor="minimal"
            className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:border-primary/50 ${
              value === "minimal" ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            <RadioGroupItem value="minimal" id="minimal" className="sr-only" />
            <div 
              className="mb-2 aspect-[3/4] rounded border p-2"
              style={{ backgroundColor: "#f5f5f0" }}
            >
              {/* Mini preview of minimal template */}
              <div className="flex justify-between mb-2">
                <div className="w-10 h-3 bg-gray-800 rounded" />
                <div className="w-6 h-2 bg-gray-400 rounded" />
              </div>
              <div 
                className="w-full h-3 rounded mb-2"
                style={{ backgroundColor: "#e8e8e0" }}
              />
              <div className="space-y-1">
                <div className="w-full h-1 bg-gray-300 rounded" />
                <div className="w-full h-1 bg-gray-300 rounded" />
                <div className="w-full h-1 bg-gray-300 rounded" />
              </div>
              <div className="mt-2 ml-auto w-12 h-2 bg-gray-800 rounded" />
            </div>
            <p className="text-sm font-medium text-center">Minimal</p>
            <p className="text-xs text-muted-foreground text-center">
              Clean cream aesthetic
            </p>
          </Label>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
