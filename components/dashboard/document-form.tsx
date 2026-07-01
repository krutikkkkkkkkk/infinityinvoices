"use client"

import React from "react"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete01Icon, Loading01Icon, Package01Icon } from "@hugeicons/core-free-icons"
import {
  type DocumentType,
  type DocumentStatus,
  type Currency,
  type DiscountType,
  type PaymentMethodType,
  type DocumentFormData,
  type NewLineItem,
  type Document,
  type Client,
  type Profile,
  type Product,
  CURRENCIES,
  STATUS_OPTIONS,
  PAYMENT_METHODS,
} from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

import { createDocument, updateDocument } from "@/app/dashboard/documents/actions"

interface DocumentFormProps {
  type: DocumentType
  document?: Document
  clients?: Client[]
  nextNumber: string
  profile?: Profile | null
}

const emptyLineItem: NewLineItem = {
  name: "",
  description: "",
  quantity: 1,
  rate: 0,
  tax_percent: 0,
}

export function DocumentForm({ type, document, clients = [], nextNumber, profile }: DocumentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [products, setProducts] = useState<Product[]>([])
  const [showUsageLimitDialog, setShowUsageLimitDialog] = useState(false)
  const [usageLimitMessage, setUsageLimitMessage] = useState("")
  const supabase = createClient()

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name")
      setProducts(data || [])
    }
    fetchProducts()
  }, [])
  
  // Determine default payment methods from profile
  const getDefaultPaymentMethods = (): PaymentMethodType[] => {
    if (document?.payment_methods?.length) {
      return document.payment_methods as PaymentMethodType[]
    }
    if (document?.payment_method_type) {
      return [document.payment_method_type as PaymentMethodType]
    }
    // For new documents, auto-select methods that have data in profile
    if (!document && profile) {
      const methods: PaymentMethodType[] = []
      if (profile.upi_id) methods.push("upi")
      if (profile.paypal_email) methods.push("paypal")
      if (profile.bank_name || profile.bank_account_number) methods.push("bank")
      return methods
    }
    return []
  }

  const [formData, setFormData] = useState<DocumentFormData>({
    type: document?.type || type,
    number: document?.number || nextNumber,
    issue_date: document?.issue_date || new Date().toISOString().split("T")[0],
    due_date: document?.due_date || "",
    valid_until: document?.valid_until || "",
    status: document?.status || "draft",
    currency: document?.currency || profile?.default_currency || "INR",
    client_id: document?.client_id || null,
    client_name: document?.client_name || "",
    client_email: document?.client_email || "",
    client_address: document?.client_address || "",
    client_gst_id: document?.client_gst_id || "",
    notes: document?.notes || "",
    terms: document?.terms || "",
    payment_methods: getDefaultPaymentMethods(),
    payment_method_type: (document?.payment_method_type as PaymentMethodType) || null,
    payment_method: document?.payment_method || "",
    upi_id: document?.upi_id || profile?.upi_id || "",
    paypal_email: document?.paypal_email || profile?.paypal_email || "",
    bank_name: document?.bank_name || profile?.bank_name || "",
    bank_account_name: document?.bank_account_name || profile?.bank_account_name || "",
    bank_account_number: document?.bank_account_number || profile?.bank_account_number || "",
    bank_routing_number: document?.bank_routing_number || profile?.bank_routing_number || "",
    bank_swift_code: document?.bank_swift_code || profile?.bank_swift_code || "",
    discount_type: document?.discount_type || null,
    discount_value: document?.discount_value || 0,
    include_tax: document?.include_tax ?? true,
    line_items: document?.line_items?.map((item) => ({
      name: item.name,
      description: item.description || "",
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      tax_percent: Number(item.tax_percent),
    })) || [{ ...emptyLineItem }],
  })

  const [totals, setTotals] = useState({
    subtotal: 0,
    taxTotal: 0,
    discount: 0,
    grandTotal: 0,
  })

  // Calculate totals whenever line items or discount changes
  useEffect(() => {
    const subtotal = formData.line_items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    )
    // Only calculate tax if include_tax is true
    const taxTotal = formData.include_tax
      ? formData.line_items.reduce(
          (sum, item) => sum + (item.quantity * item.rate * item.tax_percent) / 100,
          0
        )
      : 0
    let discount = 0
    if (formData.discount_type === "percentage") {
      discount = (subtotal * formData.discount_value) / 100
    } else if (formData.discount_type === "fixed") {
      discount = formData.discount_value
    }
    const grandTotal = subtotal + taxTotal - discount

    setTotals({ subtotal, taxTotal, discount, grandTotal })
  }, [formData.line_items, formData.discount_type, formData.discount_value, formData.include_tax])

  const handleClientChange = (clientId: string) => {
    if (clientId === "none") {
      setFormData((prev) => ({
        ...prev,
        client_id: null,
        client_name: "",
        client_email: "",
        client_address: "",
        client_gst_id: "",
      }))
      return
    }

    const client = clients.find((c) => c.id === clientId)
    if (client) {
      setFormData((prev) => ({
        ...prev,
        client_id: client.id,
        client_name: client.name,
        client_email: client.email || "",
        client_address: client.address || "",
        client_gst_id: client.gst_id || "",
      }))
    }
  }

  const updateLineItem = (index: number, field: keyof NewLineItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [...formData.line_items, { ...emptyLineItem }],
    })
  }

  const addProductAsLineItem = (product: Product) => {
    const newItem: NewLineItem = {
      name: product.name,
      description: product.description || "",
      quantity: 1,
      rate: Number(product.rate),
      tax_percent: Number(product.tax_rate),
    }
    setFormData({
      ...formData,
      line_items: [...formData.line_items, newItem],
    })
  }

  const removeLineItem = (index: number) => {
    if (formData.line_items.length === 1) return
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (document) {
          await updateDocument(document.id, formData)
        } else {
          await createDocument(formData)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "An error occurred"
        if (message.startsWith("USAGE_LIMIT_EXCEEDED:")) {
          setUsageLimitMessage(message.replace("USAGE_LIMIT_EXCEEDED:", ""))
          setShowUsageLimitDialog(true)
        }
      }
    })
  }

  const currencySymbol = CURRENCIES.find((c) => c.value === formData.currency)?.symbol || ""

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Document Info */}
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="number">{type === "invoice" ? "Invoice" : "Quotation"} Number</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => setFormData((prev) => ({ ...prev, number: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue_date">Issue Date</Label>
            <Input
              id="issue_date"
              type="date"
              value={formData.issue_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, issue_date: e.target.value }))}
              required
            />
          </div>
          {type === "invoice" && (
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          )}
          {type === "quotation" && (
            <div className="space-y-2">
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData((prev) => ({ ...prev, valid_until: e.target.value }))}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: DocumentStatus) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value: Currency) =>
                setFormData((prev) => ({ ...prev, currency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.symbol} {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clients.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="client">Select Existing Client</Label>
              <Select
                value={formData.client_id || "none"}
                onValueChange={handleClientChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client or enter manually" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Enter manually</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_name: e.target.value }))
                }
                placeholder="Company or individual name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_email">Client Email</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_email: e.target.value }))
                }
                placeholder="client@example.com"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="client_address">Client Address</Label>
              <Textarea
                id="client_address"
                value={formData.client_address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_address: e.target.value }))
                }
                placeholder="Street address, city, state, ZIP"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_gst_id">GST/Tax ID</Label>
              <Input
                id="client_gst_id"
                value={formData.client_gst_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_gst_id: e.target.value }))
                }
                placeholder="GST Number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
  <div className="space-y-1">
    <CardTitle>Line Items</CardTitle>
    <div className="flex items-center gap-2">
      <Switch
        id="include_tax"
        checked={formData.include_tax}
        onCheckedChange={(checked) =>
          setFormData((prev) => ({ ...prev, include_tax: checked }))
        }
      />
      <Label htmlFor="include_tax" className="text-sm font-normal text-muted-foreground cursor-pointer">
        Include Tax
      </Label>
    </div>
  </div>
  <div className="flex items-center gap-2">
    {products.length > 0 && (
      <Select onValueChange={(productId) => {
        const product = products.find(p => p.id === productId)
        if (product) addProductAsLineItem(product)
      }}>
        <SelectTrigger className="w-[180px] h-9">
          <HugeiconsIcon icon={Package01Icon} size={16} className="mr-2" />
          <SelectValue placeholder="Add from catalog" />
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.name} - {CURRENCIES.find(c => c.value === formData.currency)?.symbol || "₹"}{Number(product.rate).toLocaleString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
    <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
      <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" /> Add Item
    </Button>
  </div>
  </CardHeader>
        <CardContent className="space-y-4">
          <div className={`hidden lg:grid gap-2 text-sm font-medium text-muted-foreground px-1 ${formData.include_tax ? "lg:grid-cols-12" : "lg:grid-cols-10"}`}>
            <div className={formData.include_tax ? "col-span-4" : "col-span-4"}>Item</div>
            <div className={formData.include_tax ? "col-span-2" : "col-span-2"}>Quantity</div>
            <div className={formData.include_tax ? "col-span-2" : "col-span-2"}>Rate</div>
            {formData.include_tax && <div className="col-span-2">Tax %</div>}
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1" />
          </div>
          {formData.line_items.map((item, index) => {
            const taxMultiplier = formData.include_tax ? (1 + item.tax_percent / 100) : 1
            const lineTotal = item.quantity * item.rate * taxMultiplier
            return (
              <div key={index} className={`grid gap-2 items-start border p-3 rounded-lg lg:border-0 lg:p-0 ${formData.include_tax ? "lg:grid-cols-12" : "lg:grid-cols-10"}`}>
                <div className="lg:col-span-4 space-y-2">
                  <Label className="lg:hidden">Item Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateLineItem(index, "name", e.target.value)}
                    placeholder="Item name"
                    required
                  />
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(index, "description", e.target.value)}
                    placeholder="Description (optional)"
                    className="text-sm"
                  />
                </div>
                <div className="lg:col-span-2 space-y-1">
                  <Label className="lg:hidden">Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="lg:col-span-2 space-y-1">
                  <Label className="lg:hidden">Rate</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateLineItem(index, "rate", parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                {formData.include_tax && (
                  <div className="lg:col-span-2 space-y-1">
                    <Label className="lg:hidden">Tax %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.tax_percent}
                      onChange={(e) => updateLineItem(index, "tax_percent", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
                <div className="lg:col-span-1 flex items-center justify-end lg:pt-2 font-medium">
                  {currencySymbol}
                  {lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="lg:col-span-1 flex justify-end lg:pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                    disabled={formData.line_items.length === 1}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={16} />
                  </Button>
                </div>
              </div>
            )
          })}

          <Separator className="my-4" />

          {/* Totals */}
          <div className="flex flex-col items-end space-y-2 text-sm">
            <div className="flex justify-between w-full sm:w-64">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">
                {currencySymbol}
                {totals.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {formData.include_tax && (
              <div className="flex justify-between w-full sm:w-64">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">
                  {currencySymbol}
                  {totals.taxTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Discount */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-64 pt-2">
              <Select
                value={formData.discount_type || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    discount_type: value === "none" ? null : (value as DiscountType),
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Discount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No discount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
              {formData.discount_type && (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount_value: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full sm:w-24"
                  placeholder={formData.discount_type === "percentage" ? "%" : currencySymbol}
                />
              )}
            </div>

            {totals.discount > 0 && (
              <div className="flex justify-between w-full sm:w-64 text-destructive">
                <span>Discount:</span>
                <span>
                  -{currencySymbol}
                  {totals.discount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <Separator className="w-full sm:w-64" />
            <div className="flex justify-between w-full sm:w-64 text-lg font-bold">
              <span>Grand Total:</span>
              <span>
                {currencySymbol}
                {totals.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Notes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Accepted Payment Methods</Label>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`payment_${method.value}`}
                      checked={formData.payment_methods?.includes(method.value) || false}
                      onChange={(e) => {
                        const methods = formData.payment_methods || []
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            payment_methods: [...methods, method.value],
                          }))
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            payment_methods: methods.filter((m) => m !== method.value),
                          }))
                        }
                      }}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor={`payment_${method.value}`} className="font-normal cursor-pointer">
                      {method.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Transfer Fields */}
            {formData.payment_methods?.includes("bank") && (
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium text-sm">Bank Details</h4>
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
            )}

            {/* UPI Fields */}
            {formData.payment_methods?.includes("upi") && (
              <div className="space-y-2 rounded-lg border p-4">
                <Label htmlFor="upi_id">UPI ID (for QR code)</Label>
                <Input
                  id="upi_id"
                  value={formData.upi_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, upi_id: e.target.value }))
                  }
                  placeholder="yourname@upi"
                />
              </div>
            )}

            {/* PayPal Fields */}
            {formData.payment_methods?.includes("paypal") && (
              <div className="space-y-2 rounded-lg border p-4">
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
            )}

            {/* Other Payment Method */}
            {formData.payment_methods?.includes("other") && (
              <div className="space-y-2 rounded-lg border p-4">
                <Label htmlFor="payment_method">Other Payment Instructions</Label>
                <Input
                  id="payment_method"
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, payment_method: e.target.value }))
                  }
                  placeholder="e.g., Cash on delivery, Cheque, etc."
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any additional notes for the client"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, terms: e.target.value }))
                }
                placeholder="Payment terms, warranty, etc."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />}
          {document ? "Update" : "Create"} {type === "invoice" ? "Invoice" : "Quotation"}
        </Button>
      </div>

      {/* Usage Limit Dialog */}
      <AlertDialog open={showUsageLimitDialog} onOpenChange={setShowUsageLimitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usage Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              {usageLimitMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/dashboard/pricing">Upgrade to Pro</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
