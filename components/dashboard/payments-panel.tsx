"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete01Icon, Loading01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { Payment, Currency, CURRENCIES } from "@/lib/types"

interface PaymentsPanelProps {
  documentId: string
  grandTotal: number
  currency: Currency
  onPaymentChange?: (amountPaid: number) => void
}

export function PaymentsPanel({ documentId, grandTotal, currency, onPaymentChange }: PaymentsPanelProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "bank",
    reference_number: "",
    notes: "",
  })

  const supabase = createClient()
  const symbol = CURRENCIES.find((c) => c.value === currency)?.symbol || "₹"

  const fetchPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("document_id", documentId)
      .order("payment_date", { ascending: false })
    setPayments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [documentId])

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const remaining = grandTotal - totalPaid
  const progressPercent = grandTotal > 0 ? (totalPaid / grandTotal) * 100 : 0
  const isPaidInFull = remaining <= 0

  useEffect(() => {
    onPaymentChange?.(totalPaid)
  }, [totalPaid, onPaymentChange])

  const handleSubmit = async () => {
    if (!formData.amount) return

    setSaving(true)
    await supabase.from("payments").insert({
      document_id: documentId,
      amount: parseFloat(formData.amount),
      payment_date: formData.payment_date,
      payment_method: formData.payment_method,
      reference_number: formData.reference_number || null,
      notes: formData.notes || null,
    })

    // Update document amount_paid
    const newTotalPaid = totalPaid + parseFloat(formData.amount)
    await supabase
      .from("documents")
      .update({ 
        amount_paid: newTotalPaid,
        status: newTotalPaid >= grandTotal ? "paid" : undefined
      })
      .eq("id", documentId)

    setSaving(false)
    setShowDialog(false)
    setFormData({
      amount: "",
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "bank",
      reference_number: "",
      notes: "",
    })
    fetchPayments()
  }

  const handleDelete = async () => {
    if (!deletingPayment) return
    await supabase.from("payments").delete().eq("id", deletingPayment.id)
    
    // Update document amount_paid
    const newTotalPaid = totalPaid - Number(deletingPayment.amount)
    await supabase
      .from("documents")
      .update({ amount_paid: Math.max(0, newTotalPaid) })
      .eq("id", documentId)

    setShowDeleteDialog(false)
    setDeletingPayment(null)
    fetchPayments()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Payments
          </CardTitle>
          {!isPaidInFull && (
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Record a payment received for this invoice. Remaining: {symbol}{remaining.toLocaleString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder={remaining.toString()}
                      max={remaining}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_date">Date</Label>
                      <Input
                        id="payment_date"
                        type="date"
                        value={formData.payment_date}
                        onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Method</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
                      >
                        <SelectTrigger id="payment_method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference_number">Reference Number</Label>
                    <Input
                      id="reference_number"
                      value={formData.reference_number}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                      placeholder="Transaction ID, cheque number, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes"
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={saving || !formData.amount}>
                    {saving && <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />}
                    Record Payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {symbol}{totalPaid.toLocaleString()} of {symbol}{grandTotal.toLocaleString()}
            </span>
            {isPaidInFull ? (
              <Badge className="bg-green-100 text-green-700">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="mr-1" />
                Paid in Full
              </Badge>
            ) : (
              <span className="font-medium">
                {symbol}{remaining.toLocaleString()} remaining
              </span>
            )}
          </div>
          <Progress value={Math.min(progressPercent, 100)} className="h-2" />
        </div>

        {/* Payment List */}
        {loading ? (
          <div className="flex justify-center py-4">
            <HugeiconsIcon icon={Loading01Icon} size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {symbol}{Number(payment.amount).toLocaleString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {payment.payment_method}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(payment.payment_date).toLocaleDateString()}
                    {payment.reference_number && ` • Ref: ${payment.reference_number}`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setDeletingPayment(payment)
                    setShowDeleteDialog(true)
                  }}
                >
                  <HugeiconsIcon icon={Delete01Icon} size={16} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No payments recorded yet
          </p>
        )}
      </CardContent>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment of {symbol}{Number(deletingPayment?.amount || 0).toLocaleString()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
