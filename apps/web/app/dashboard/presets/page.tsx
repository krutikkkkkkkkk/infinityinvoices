import Link from "next/link"
import { db, desc, eq, invoicePresets } from "@infinity/db"
import { requireUserOrRedirect } from "@/lib/auth/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeletePresetButton } from "@/components/dashboard/invoice-preset-controls"
import { parseDocumentStyle } from "@/lib/document-style"
import { resolveTemplateColors } from "@/lib/generate-document-html"

/** Two colour dots and the template name for a preset that saved a look. */
function PresetLook({ style }: { style: unknown }) {
  const parsed = parseDocumentStyle(style)
  if (!parsed) return null
  const colors = resolveTemplateColors(parsed.template, parsed.colors[parsed.template])
  return <span className="inline-flex items-center gap-1.5 align-middle"><span className="flex -space-x-1"><span className="size-3 rounded-full border border-black/10" style={{ backgroundColor: colors.primary }} /><span className="size-3 rounded-full border border-black/10" style={{ backgroundColor: colors.accent }} /></span><span className="capitalize">{parsed.template}</span></span>
}

export default async function InvoicePresetsPage() {
  const user = await requireUserOrRedirect()
  const presets = await db
    .select({ id: invoicePresets.id, name: invoicePresets.name, data: invoicePresets.data, updated_at: invoicePresets.updated_at })
    .from(invoicePresets)
    .where(eq(invoicePresets.user_id, user.id))
    .orderBy(desc(invoicePresets.updated_at))

  return <div className="flex flex-col gap-6">
    <div><h1 className="text-2xl font-bold tracking-tight">Invoice presets</h1><p className="text-muted-foreground">Start invoices with reusable clients, line items, taxes, terms, and payment details.</p></div>
    {presets?.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{presets.map((preset) => {
      const data = preset.data as { client_name?: string; line_items?: unknown[]; currency?: string; style?: unknown }
      return <Card key={preset.id}><CardHeader><CardTitle className="text-base">{preset.name}</CardTitle><CardDescription>{data.client_name || "No client"} · {data.line_items?.length || 0} line items · {data.currency || "INR"}{data.style ? <> · <PresetLook style={data.style} /></> : null}</CardDescription></CardHeader><CardContent className="flex items-center justify-between gap-3"><Button asChild size="sm"><Link href={`/dashboard/documents/new?type=invoice&preset=${preset.id}`}>Use preset</Link></Button><DeletePresetButton id={preset.id} /></CardContent></Card>
    })}</div> : <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="font-medium">No presets yet</p><p className="max-w-md text-sm text-muted-foreground">Open an existing invoice and choose “Save as preset” to create your first reusable setup.</p><Button asChild><Link href="/dashboard/documents/new?type=invoice">Create invoice</Link></Button></CardContent></Card>}
  </div>
}
