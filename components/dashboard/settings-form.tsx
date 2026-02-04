"use client"

import React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon } from "@hugeicons/core-free-icons"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

interface SettingsFormProps {
  profile: Profile | null
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [formData, setFormData] = useState({
    company_name: profile?.company_name || "",
    company_address: profile?.company_address || "",
    gst_id: profile?.gst_id || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    logo_url: profile?.logo_url || "",
    upi_id: profile?.upi_id || "",
    paypal_email: profile?.paypal_email || "",
    bank_name: profile?.bank_name || "",
    bank_account_name: profile?.bank_account_name || "",
    bank_account_number: profile?.bank_account_number || "",
    bank_routing_number: profile?.bank_routing_number || "",
    bank_swift_code: profile?.bank_swift_code || "",
  })
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage({ type: "error", text: "Not authenticated" })
        return
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: formData.company_name || null,
          company_address: formData.company_address || null,
          gst_id: formData.gst_id || null,
          email: formData.email || null,
          phone: formData.phone || null,
          logo_url: formData.logo_url || null,
          upi_id: formData.upi_id || null,
          paypal_email: formData.paypal_email || null,
          bank_name: formData.bank_name || null,
          bank_account_name: formData.bank_account_name || null,
          bank_account_number: formData.bank_account_number || null,
          bank_routing_number: formData.bank_routing_number || null,
          bank_swift_code: formData.bank_swift_code || null,
        })
        .eq("id", user.id)

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ type: "success", text: "Settings saved successfully!" })
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>
            This information will appear on your invoices and quotations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, company_name: e.target.value }))
                }
                placeholder="Your Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst_id">GST/Tax ID</Label>
              <Input
                id="gst_id"
                value={formData.gst_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gst_id: e.target.value }))
                }
                placeholder="GST Number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="contact@yourcompany.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company_address">Business Address</Label>
              <Textarea
                id="company_address"
                value={formData.company_address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, company_address: e.target.value }))
                }
                placeholder="Street, City, State, ZIP"
                rows={3}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, logo_url: e.target.value }))
                }
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to your company logo. It will appear on your invoices.
              </p>
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Default Payment Information</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These details will be auto-filled when creating new invoices.
            </p>
            
            {/* UPI */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium">UPI</h4>
              <div className="space-y-2">
                <Label htmlFor="upi_id">UPI ID</Label>
                <Input
                  id="upi_id"
                  value={formData.upi_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, upi_id: e.target.value }))
                  }
                  placeholder="yourname@upi"
                />
              </div>
            </div>

            {/* PayPal */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium">PayPal</h4>
              <div className="space-y-2">
                <Label htmlFor="paypal_email">PayPal Email</Label>
                <Input
                  id="paypal_email"
                  type="email"
                  value={formData.paypal_email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, paypal_email: e.target.value }))
                  }
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Bank Transfer</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bank_name: e.target.value }))
                    }
                    placeholder="e.g., HDFC Bank"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_name">Account Holder Name</Label>
                  <Input
                    id="bank_account_name"
                    value={formData.bank_account_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bank_account_name: e.target.value }))
                    }
                    placeholder="Account holder name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bank_account_number: e.target.value }))
                    }
                    placeholder="Account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_routing_number">Routing/IFSC Code</Label>
                  <Input
                    id="bank_routing_number"
                    value={formData.bank_routing_number}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bank_routing_number: e.target.value }))
                    }
                    placeholder="e.g., HDFC0001234"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bank_swift_code">SWIFT/BIC Code (International)</Label>
                  <Input
                    id="bank_swift_code"
                    value={formData.bank_swift_code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bank_swift_code: e.target.value }))
                    }
                    placeholder="e.g., HDFCINBB"
                  />
                </div>
              </div>
            </div>
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-600" : "text-destructive"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Reset Password</Label>
            <p className="text-sm text-muted-foreground">
              We will send a password reset link to your email address.
            </p>
          </div>
          
          {resetMessage && (
            <p
              className={`text-sm ${
                resetMessage.type === "success" ? "text-green-600" : "text-destructive"
              }`}
            >
              {resetMessage.text}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              setResetMessage(null)
              startTransition(async () => {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                
                if (!user?.email) {
                  setResetMessage({ type: "error", text: "No email found for this account" })
                  return
                }

                const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                  redirectTo: `${window.location.origin}/auth/reset-password`,
                })

                if (error) {
                  setResetMessage({ type: "error", text: error.message })
                } else {
                  setResetMessage({ type: "success", text: "Password reset link sent to your email!" })
                }
              })
            }}
          >
            {isPending && <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />}
            Send Reset Link
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
