"use client"

import React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon, Loading01Icon } from "@hugeicons/core-free-icons"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSubscription } from "@/hooks/use-subscription"
import { canAddClient } from "@/lib/plans"

export function AddClientDialog({ clientCount = 0 }: { clientCount?: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { plan, isLoading: isPlanLoading } = useSubscription()
  // The Free plan caps clients; RLS enforces the same limit on insert
  const atLimit = !isPlanLoading && !canAddClient(plan, clientCount)
  const limitMessage = `The ${plan.name} plan includes up to ${plan.limits.clients} clients. Upgrade to Pro for unlimited clients.`
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    gst_id: "",
    pan_number: "",
    auto_reminder: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return
      if (atLimit) {
        setError(limitMessage)
        return
      }

      const { error } = await supabase.from("clients").insert({
        user_id: user.id,
        name: formData.name,
        company_name: formData.company_name || null,
        contact_person: formData.contact_person || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        gst_id: formData.gst_id || null,
        pan_number: formData.pan_number || null,
        auto_reminder: formData.auto_reminder,
      })

      if (error) {
        // 42501: the insert was refused by RLS, which on Free means the client limit
        setError(error.code === "42501" ? limitMessage : error.message)
        return
      }

      setError(null)
      setOpen(false)
      setFormData({
        name: "",
        company_name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        gst_id: "",
        pan_number: "",
        auto_reminder: false,
      })
      router.refresh()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setError(null)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <HugeiconsIcon icon={UserAdd01Icon} size={16} className="mr-2" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Add a new client to quickly fill their details on invoices and quotations.
            </DialogDescription>
          </DialogHeader>
          {(error || atLimit) && (
            <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error ?? limitMessage}{" "}
              <Link href="/dashboard/plan" className="font-medium underline underline-offset-4">
                See plans
              </Link>
            </p>
          )}
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
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
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, company_name: e.target.value }))
                  }
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
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
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
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
                <Label htmlFor="gst_id">GSTIN</Label>
                <Input
                  id="gst_id"
                  value={formData.gst_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gst_id: e.target.value.toUpperCase() }))
                  }
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan_number">PAN Number</Label>
                <Input
                  id="pan_number"
                  value={formData.pan_number}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pan_number: e.target.value.toUpperCase() }))
                  }
                  placeholder="AAAAA0000A"
                  maxLength={10}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-input bg-card p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Auto Reminders</Label>
                <p className="text-xs text-muted-foreground">Email a payment reminder every week while an invoice is overdue</p>
              </div>
              <Switch
                checked={formData.auto_reminder}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, auto_reminder: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || atLimit}>
              {isPending && <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />}
              Add Client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
