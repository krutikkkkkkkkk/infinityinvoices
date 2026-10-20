import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeletePresetButton } from "@/components/dashboard/invoice-preset-controls"

export default async function InvoicePresetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: presets } = await supabase.from("invoice_presets").select("id, name, data, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false })

  return <div className="flex flex-col gap-6">
    <div><h1 className="text-2xl font-bold tracking-tight">Invoice presets</h1><p className="text-muted-foreground">Start invoices with reusable clients, line items, taxes, terms, and payment details.</p></div>
    {presets?.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{presets.map((preset) => {
      const data = preset.data as { client_name?: string; line_items?: unknown[]; currency?: string }
      return <Card key={preset.id}><CardHeader><CardTitle className="text-base">{preset.name}</CardTitle><CardDescription>{data.client_name || "No client"} · {data.line_items?.length || 0} line items · {data.currency || "INR"}</CardDescription></CardHeader><CardContent className="flex items-center justify-between gap-3"><Button asChild size="sm"><Link href={`/dashboard/documents/new?type=invoice&preset=${preset.id}`}>Use preset</Link></Button><DeletePresetButton id={preset.id} /></CardContent></Card>
    })}</div> : <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="font-medium">No presets yet</p><p className="max-w-md text-sm text-muted-foreground">Open an existing invoice and choose “Save as preset” to create your first reusable setup.</p><Button asChild><Link href="/dashboard/documents/new?type=invoice">Create invoice</Link></Button></CardContent></Card>}
  </div>
}
