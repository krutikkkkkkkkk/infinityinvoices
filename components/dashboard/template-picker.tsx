"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, CheckmarkCircle02Icon, LockIcon } from "@hugeicons/core-free-icons"
import { PDF_TEMPLATES, type TemplateId } from "@/lib/pdf-templates"
import Link from "next/link"

// SVG thumbnail previews for each template
const THUMBNAILS: Record<TemplateId, React.ReactNode> = {
  classic: (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" fill="white" />
      <rect x="12" y="12" width="80" height="6" rx="1" fill="#111827" />
      <rect x="12" y="22" width="55" height="3" rx="1" fill="#d1d5db" />
      <rect x="12" y="27" width="45" height="3" rx="1" fill="#d1d5db" />
      <text x="188" y="20" textAnchor="end" fontSize="14" fontWeight="800" fill="#111827" fontFamily="sans-serif">INVOICE</text>
      <text x="188" y="28" textAnchor="end" fontSize="7" fill="#9ca3af" fontFamily="sans-serif">#INV-0001</text>
      <rect x="12" y="38" width="176" height="1" fill="#111827" />
      <rect x="12" y="44" width="176" height="22" rx="3" fill="#f9fafb" />
      <rect x="16" y="48" width="30" height="3" rx="1" fill="#9ca3af" />
      <rect x="16" y="54" width="50" height="4" rx="1" fill="#374151" />
      <rect x="12" y="71" width="176" height="1" fill="#e5e7eb" />
      <rect x="12" y="75" width="20" height="3" rx="1" fill="#9ca3af" />
      <rect x="60" y="75" width="60" height="3" rx="1" fill="#9ca3af" />
      <rect x="160" y="75" width="28" height="3" rx="1" fill="#9ca3af" />
      <rect x="12" y="81" width="176" height="1" fill="#e5e7eb" />
      <rect x="12" y="86" width="18" height="3" rx="1" fill="#d1d5db" />
      <rect x="60" y="86" width="40" height="3" rx="1" fill="#d1d5db" />
      <rect x="160" y="86" width="28" height="3" rx="1" fill="#374151" />
      <rect x="12" y="93" width="176" height="1" fill="#f3f4f6" />
      <rect x="120" y="100" width="28" height="3" rx="1" fill="#9ca3af" />
      <rect x="160" y="100" width="28" height="3" rx="1" fill="#9ca3af" />
      <rect x="120" y="107" width="176" height="1" fill="#111827" />
      <rect x="120" y="111" width="28" height="5" rx="1" fill="#111827" />
      <rect x="160" y="111" width="28" height="5" rx="1" fill="#111827" />
    </svg>
  ),
  modern: (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" fill="white" />
      <rect width="200" height="40" fill="#1f2937" />
      <rect x="12" y="12" width="60" height="5" rx="1" fill="white" />
      <rect x="12" y="20" width="45" height="3" rx="1" fill="#6b7280" />
      <rect x="12" y="26" width="35" height="3" rx="1" fill="#6b7280" />
      <text x="188" y="20" textAnchor="end" fontSize="12" fontWeight="800" fill="white" fontFamily="sans-serif">INVOICE</text>
      <text x="188" y="28" textAnchor="end" fontSize="6" fill="#6b7280" fontFamily="sans-serif">#INV-0001</text>
      <rect x="12" y="46" width="176" height="22" rx="3" fill="#f8fafc" />
      <rect x="16" y="50" width="30" height="3" rx="1" fill="#9ca3af" />
      <rect x="16" y="56" width="50" height="4" rx="1" fill="#374151" />
      <rect x="12" y="73" width="176" height="1" fill="#e5e7eb" />
      <rect x="12" y="77" width="20" height="3" rx="1" fill="#9ca3af" />
      <rect x="60" y="77" width="60" height="3" rx="1" fill="#9ca3af" />
      <rect x="160" y="77" width="28" height="3" rx="1" fill="#9ca3af" />
      <rect x="12" y="83" width="176" height="1" fill="#e5e7eb" />
      <rect x="12" y="88" width="18" height="3" rx="1" fill="#d1d5db" />
      <rect x="60" y="88" width="40" height="3" rx="1" fill="#d1d5db" />
      <rect x="160" y="88" width="28" height="3" rx="1" fill="#374151" />
      <rect x="120" y="100" width="68" height="16" rx="3" fill="#1f2937" />
      <rect x="125" y="105" width="25" height="3" rx="1" fill="white" />
      <rect x="158" y="105" width="25" height="3" rx="1" fill="white" />
    </svg>
  ),
  minimal: (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" fill="white" />
      <rect x="12" y="12" width="70" height="7" rx="1" fill="#1a1a1a" />
      <rect x="12" y="23" width="50" height="3" rx="1" fill="#ccc" />
      <rect x="12" y="29" width="40" height="3" rx="1" fill="#ccc" />
      <rect x="125" y="12" width="12" height="3" rx="1" fill="#999" />
      <rect x="125" y="18" width="63" height="6" rx="1" fill="#1a1a1a" />
      <rect x="148" y="27" width="40" height="3" rx="1" fill="#ccc" />
      <rect x="12" y="38" width="176" height="1" fill="#ddd" />
      <rect x="12" y="44" width="30" height="3" rx="1" fill="#999" />
      <rect x="12" y="50" width="55" height="4" rx="1" fill="#1a1a1a" />
      <rect x="12" y="57" width="45" height="3" rx="1" fill="#ccc" />
      <rect x="12" y="65" width="176" height="1" fill="#ddd" />
      <rect x="12" y="69" width="20" height="3" rx="1" fill="#999" />
      <rect x="60" y="69" width="60" height="3" rx="1" fill="#999" />
      <rect x="160" y="69" width="28" height="3" rx="1" fill="#999" />
      <rect x="12" y="75" width="176" height="1" fill="#f0f0f0" />
      <rect x="12" y="80" width="18" height="3" rx="1" fill="#ddd" />
      <rect x="60" y="80" width="40" height="3" rx="1" fill="#ddd" />
      <rect x="160" y="80" width="28" height="3" rx="1" fill="#1a1a1a" />
      <rect x="140" y="95" width="48" height="1" fill="#1a1a1a" />
      <rect x="140" y="100" width="28" height="5" rx="1" fill="#1a1a1a" />
      <rect x="163" y="100" width="25" height="5" rx="1" fill="#1a1a1a" />
    </svg>
  ),
  branded: (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" fill="white" />
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="200" height="42" fill="url(#g1)" />
      <rect x="12" y="12" width="60" height="5" rx="1" fill="white" />
      <rect x="12" y="20" width="45" height="3" rx="1" fill="#c7d2fe" />
      <rect x="12" y="26" width="35" height="3" rx="1" fill="#c7d2fe" />
      <text x="188" y="20" textAnchor="end" fontSize="12" fontWeight="800" fill="white" fontFamily="sans-serif">INVOICE</text>
      <text x="188" y="28" textAnchor="end" fontSize="6" fill="#c7d2fe" fontFamily="sans-serif">#INV-0001</text>
      <rect x="12" y="47" width="176" height="22" rx="3" fill="#f5f3ff" />
      <rect x="16" y="51" width="30" height="3" rx="1" fill="#9ca3af" />
      <rect x="16" y="57" width="50" height="4" rx="1" fill="#374151" />
      <rect x="12" y="76" width="176" height="2" fill="#e0e7ff" />
      <rect x="12" y="80" width="20" height="3" rx="1" fill="#7c3aed" />
      <rect x="60" y="80" width="60" height="3" rx="1" fill="#7c3aed" />
      <rect x="160" y="80" width="28" height="3" rx="1" fill="#7c3aed" />
      <rect x="12" y="86" width="176" height="1" fill="#f3f4f6" />
      <rect x="12" y="91" width="18" height="3" rx="1" fill="#d1d5db" />
      <rect x="60" y="91" width="40" height="3" rx="1" fill="#d1d5db" />
      <rect x="160" y="91" width="28" height="3" rx="1" fill="#374151" />
      <rect x="120" y="103" width="68" height="16" rx="4" fill="url(#g1)" />
      <rect x="125" y="108" width="25" height="3" rx="1" fill="white" />
      <rect x="158" y="108" width="25" height="3" rx="1" fill="white" />
    </svg>
  ),
  executive: (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="140" fill="white" />
      <rect width="60" height="140" fill="#0f172a" />
      <rect x="8" y="14" width="44" height="5" rx="1" fill="white" />
      <rect x="8" y="22" width="35" height="3" rx="1" fill="#475569" />
      <rect x="8" y="28" width="28" height="3" rx="1" fill="#475569" />
      <rect x="8" y="44" width="20" height="2" rx="1" fill="#334155" />
      <rect x="8" y="49" width="36" height="3" rx="1" fill="#e2e8f0" />
      <rect x="8" y="60" width="20" height="2" rx="1" fill="#334155" />
      <rect x="8" y="65" width="36" height="3" rx="1" fill="#e2e8f0" />
      <rect x="8" y="76" width="20" height="2" rx="1" fill="#334155" />
      <rect x="8" y="81" width="36" height="7" rx="1" fill="white" />
      <rect x="70" y="14" width="50" height="8" rx="1" fill="#0f172a" />
      <rect x="70" y="25" width="30" height="3" rx="1" fill="#94a3b8" />
      <rect x="70" y="36" width="20" height="2" rx="1" fill="#94a3b8" />
      <rect x="70" y="41" width="40" height="4" rx="1" fill="#1e293b" />
      <rect x="70" y="48" width="35" height="3" rx="1" fill="#94a3b8" />
      <rect x="70" y="57" width="118" height="1" fill="#0f172a" />
      <rect x="70" y="61" width="18" height="3" rx="1" fill="#94a3b8" />
      <rect x="100" y="61" width="50" height="3" rx="1" fill="#94a3b8" />
      <rect x="170" y="61" width="18" height="3" rx="1" fill="#94a3b8" />
      <rect x="70" y="66" width="118" height="1" fill="#f1f5f9" />
      <rect x="70" y="71" width="16" height="3" rx="1" fill="#d1d5db" />
      <rect x="100" y="71" width="35" height="3" rx="1" fill="#d1d5db" />
      <rect x="170" y="71" width="18" height="3" rx="1" fill="#374151" />
      <rect x="70" y="80" width="118" height="1" fill="#f1f5f9" />
      <rect x="140" y="88" width="48" height="1" fill="#0f172a" />
      <rect x="140" y="92" width="25" height="5" rx="1" fill="#0f172a" />
      <rect x="165" y="92" width="23" height="5" rx="1" fill="#0f172a" />
    </svg>
  ),
}

interface TemplatePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTemplate: TemplateId
  onSelect: (id: TemplateId) => void
  isPro: boolean
}

export function TemplatePicker({
  open,
  onOpenChange,
  selectedTemplate,
  onSelect,
  isPro,
}: TemplatePickerProps) {
  const [search, setSearch] = useState("")

  const filtered = PDF_TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b">
          <DialogTitle className="text-base font-semibold">Choose Template</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 py-3 border-b">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search Template"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {filtered.map((template) => {
            const locked = template.isPro && !isPro
            const isSelected = selectedTemplate === template.id

            return (
              <div
                key={template.id}
                className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary"
                    : "border-border hover:border-muted-foreground/40"
                } ${locked ? "cursor-default" : ""}`}
                onClick={() => {
                  if (!locked) {
                    onSelect(template.id)
                    onOpenChange(false)
                  }
                }}
              >
                {/* Thumbnail */}
                <div className={`relative bg-muted/30 aspect-[1.6/1] overflow-hidden ${locked ? "opacity-40 blur-[1.5px]" : ""}`}>
                  {THUMBNAILS[template.id]}
                </div>

                {/* Selected badge */}
                {isSelected && !locked && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                    SELECTED
                  </div>
                )}

                {/* Pro lock overlay */}
                {locked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40">
                    <Button size="sm" className="text-xs h-8" asChild>
                      <Link href="/dashboard/settings?tab=billing">
                        <HugeiconsIcon icon={LockIcon} size={12} className="mr-1.5" />
                        Upgrade to Pro
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Label row */}
                <div className="flex items-center justify-between px-3 py-2 bg-background border-t">
                  <div>
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                  {template.isPro && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">
                      Pro
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No templates match your search.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
