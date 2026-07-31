"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteInvoicePreset, saveInvoicePreset } from "@/app/dashboard/invoicing/actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { Document, DocumentFormData, LineItem } from "@/lib/types"

export function SaveAsPresetButton({ document }: { document: Document & { line_items: LineItem[] } }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [pending, startTransition] = useTransition()
  const data: Partial<DocumentFormData> = {
    type: document.type, currency: document.currency, client_id: document.client_id,
    client_name: document.client_name || "", client_email: document.client_email || "",
    client_address: document.client_address || "", client_gst_id: document.client_gst_id || "",
    notes: document.notes || "", terms: document.terms || "", payment_method: document.payment_method || "",
    upi_id: document.upi_id || "", discount_type: document.discount_type, discount_value: document.discount_value,
    include_tax: document.include_tax, line_items: document.line_items.map(({ name, description, quantity, rate, tax_percent }) => ({ name, description: description || "", quantity: Number(quantity), rate: Number(rate), tax_percent: Number(tax_percent) })),
  }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" size="sm">Save as preset</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Save invoice preset</DialogTitle><DialogDescription>Reuse this client, line items, taxes, terms, and payment details.</DialogDescription></DialogHeader><div className="flex flex-col gap-2 py-2"><Label htmlFor="preset-name">Preset name</Label><Input id="preset-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Monthly consulting" /></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={pending || !name.trim()} onClick={() => startTransition(async () => { try { await saveInvoicePreset(name, data as Record<string, unknown>); toast.success("Preset saved"); setOpen(false) } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save preset") } })}>Save preset</Button></DialogFooter></DialogContent></Dialog>
}

export function DeletePresetButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return <Button variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(async () => { try { await deleteInvoicePreset(id); toast.success("Preset deleted"); router.refresh() } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete preset") } })}>Delete</Button>
}
