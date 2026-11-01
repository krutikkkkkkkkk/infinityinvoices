"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { deleteClient, updateClient } from "@/app/dashboard/clients/actions"
import type { Client } from "@/lib/types"

function toForm(client: Client | null) {
  return {
    name: client?.name ?? "",
    company_name: client?.company_name ?? "",
    contact_person: client?.contact_person ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    address: client?.address ?? "",
    gst_id: client?.gst_id ?? "",
    pan_number: client?.pan_number ?? "",
    auto_reminder: client?.auto_reminder ?? false,
  }
}

export function EditClientDialog({
  client,
  open,
  onOpenChange,
}: {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState(() => toForm(client))

  // Reset the form whenever a (different) client is opened for editing.
  useEffect(() => {
    if (open) setFormData(toForm(client))
  }, [open, client])

  const set = (key: keyof ReturnType<typeof toForm>, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return

    startTransition(async () => {
      const { error } = await updateClient(client.id, formData)

      if (error) {
        toast.error("Couldn't save client", { description: error })
        return
      }
      toast.success(`${formData.name} updated`)
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
            <DialogDescription>Changes apply to new documents. Existing invoices keep their details.</DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Display name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Name to display on invoices"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-company_name">Company name</Label>
                <Input id="edit-company_name" value={formData.company_name} onChange={(e) => set("company_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact_person">Contact person</Label>
                <Input id="edit-contact_person" value={formData.contact_person} onChange={(e) => set("contact_person", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={formData.email} onChange={(e) => set("email", e.target.value)} placeholder="client@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" type="tel" value={formData.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea id="edit-address" value={formData.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, city, state, ZIP" rows={2} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-gst_id">GSTIN</Label>
                <Input id="edit-gst_id" value={formData.gst_id} onChange={(e) => set("gst_id", e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pan_number">PAN</Label>
                <Input id="edit-pan_number" value={formData.pan_number} onChange={(e) => set("pan_number", e.target.value.toUpperCase())} placeholder="AAAAA0000A" maxLength={10} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border bg-card p-3">
              <div className="space-y-0.5">
                <Label htmlFor="edit-auto_reminder" className="text-sm font-medium">Auto reminders</Label>
                <p className="text-xs text-muted-foreground">Email a payment reminder every week while an invoice is overdue</p>
              </div>
              <Switch id="edit-auto_reminder" checked={formData.auto_reminder} onCheckedChange={(v) => set("auto_reminder", v)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <HugeiconsIcon icon={Loading01Icon} size={16} className="animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteClientDialog({
  client,
  open,
  onOpenChange,
  redirectTo,
}: {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Where to go after deleting (e.g. back to the list from a detail page). */
  redirectTo?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!client) return
    startTransition(async () => {
      const { error } = await deleteClient(client.id)
      if (error) {
        toast.error("Couldn't delete client", { description: error })
        return
      }
      toast.success(`${client.name} deleted`)
      onOpenChange(false)
      if (redirectTo) router.push(redirectTo)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {client?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            The client is removed from your list. Their existing invoices and quotations are kept, with the client
            details already printed on them.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
            {isPending && <HugeiconsIcon icon={Loading01Icon} size={16} className="animate-spin" />}
            Delete client
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
