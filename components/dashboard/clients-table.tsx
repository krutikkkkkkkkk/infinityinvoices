"use client"

import React from "react"

import { useState, useTransition } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon, PencilEdit01Icon, Delete01Icon, Loading01Icon } from "@hugeicons/core-free-icons"
import { Client } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ClientsTableProps {
  clients: Client[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    gst_id: "",
    pan_number: "",
  })

  const openEditDialog = (client: Client) => {
    setFormData({
      name: client.name,
      company_name: client.company_name || "",
      contact_person: client.contact_person || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      gst_id: client.gst_id || "",
      pan_number: client.pan_number || "",
    })
    setEditingClient(client)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("clients")
        .update({
          name: formData.name,
          company_name: formData.company_name || null,
          contact_person: formData.contact_person || null,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          gst_id: formData.gst_id || null,
          pan_number: formData.pan_number || null,
        })
        .eq("id", editingClient.id)

      if (!error) {
        setEditingClient(null)
        router.refresh()
      }
    })
  }

  const handleDelete = () => {
    if (!deletingClient) return

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", deletingClient.id)

      if (!error) {
        setDeletingClient(null)
        router.refresh()
      }
    })
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>GSTIN</TableHead>
            <TableHead>PAN</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="font-medium">{client.name}</div>
                {client.company_name && (
                  <div className="text-sm text-muted-foreground">{client.company_name}</div>
                )}
                {client.contact_person && (
                  <div className="text-xs text-muted-foreground">Contact: {client.contact_person}</div>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {client.email && <div className="text-sm">{client.email}</div>}
                  {client.phone && <div className="text-sm text-muted-foreground">{client.phone}</div>}
                  {!client.email && !client.phone && <span className="text-muted-foreground">-</span>}
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{client.gst_id || "-"}</TableCell>
              <TableCell className="font-mono text-sm">{client.pan_number || "-"}</TableCell>
              <TableCell className="max-w-xs truncate text-sm">
                {client.address || "-"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(client)}>
                      <HugeiconsIcon icon={PencilEdit01Icon} size={16} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeletingClient(client)}
                      className="text-destructive"
                    >
                      <HugeiconsIcon icon={Delete01Icon} size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>
                Update client information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Display Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Name to display on invoices"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-company_name">Company Name</Label>
                  <Input
                    id="edit-company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, company_name: e.target.value }))
                    }
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact_person">Contact Person</Label>
                  <Input
                    id="edit-contact_person"
                    value={formData.contact_person}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contact_person: e.target.value }))
                    }
                    placeholder="Primary contact"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="client@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Street, city, state, ZIP"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-gst_id">GSTIN</Label>
                  <Input
                    id="edit-gst_id"
                    value={formData.gst_id}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, gst_id: e.target.value.toUpperCase() }))
                    }
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pan_number">PAN Number</Label>
                  <Input
                    id="edit-pan_number"
                    value={formData.pan_number}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, pan_number: e.target.value.toUpperCase() }))
                    }
                    placeholder="AAAAA0000A"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingClient(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingClient} onOpenChange={(open) => !open && setDeletingClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingClient?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
