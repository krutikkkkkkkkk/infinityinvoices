"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { recordPayment, deletePayment, issueCreditNote } from "@/app/dashboard/invoicing/actions"
import { CURRENCIES, type Currency } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export interface PaymentRecord { id: string; amount: number; paid_at: string; method: string | null; reference: string | null }
export interface CreditNote { id: string; number: string; amount: number; reason: string; issued_at: string }

export function InvoiceSettlementPanel({ documentId, grandTotal, currency, payments, credits }: {
  documentId: string
  grandTotal: number
  currency: Currency
  payments: PaymentRecord[]
  credits: CreditNote[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [creditOpen, setCreditOpen] = useState(false)
  const [payment, setPayment] = useState({ amount: "", paidAt: new Date().toISOString().slice(0, 10), method: "bank", reference: "", notes: "" })
  const [credit, setCredit] = useState({ amount: "", reason: "" })
  const symbol = CURRENCIES.find((item) => item.value === currency)?.symbol || currency
  const paid = payments.reduce((sum, item) => sum + Number(item.amount), 0)
  const credited = credits.reduce((sum, item) => sum + Number(item.amount), 0)
  const remaining = Math.max(0, grandTotal - paid - credited)
  const progress = grandTotal > 0 ? ((paid + credited) / grandTotal) * 100 : 0

  function run(action: () => Promise<void>, close?: () => void) {
    startTransition(async () => {
      try {
        await action()
        close?.()
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong")
      }
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base">Balance & settlements</CardTitle>
        <div className="flex gap-2">
          <Dialog open={creditOpen} onOpenChange={setCreditOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm" disabled={remaining <= 0}>Issue credit</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Issue credit note</DialogTitle><DialogDescription>Reduce the open balance without recording a payment.</DialogDescription></DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2"><Label htmlFor="credit-amount">Amount</Label><Input id="credit-amount" type="number" min="0.01" max={remaining} step="0.01" value={credit.amount} onChange={(event) => setCredit({ ...credit, amount: event.target.value })} /></div>
                <div className="flex flex-col gap-2"><Label htmlFor="credit-reason">Reason</Label><Textarea id="credit-reason" value={credit.reason} onChange={(event) => setCredit({ ...credit, reason: event.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setCreditOpen(false)}>Cancel</Button><Button disabled={pending} onClick={() => run(() => issueCreditNote({ documentId, amount: Number(credit.amount), reason: credit.reason }), () => setCreditOpen(false))}>Issue credit note</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild><Button size="sm" disabled={remaining <= 0}>Record payment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record payment</DialogTitle><DialogDescription>{symbol}{remaining.toLocaleString()} remains on this invoice.</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-2 sm:grid-cols-2">
                <div className="flex flex-col gap-2"><Label htmlFor="payment-amount">Amount</Label><Input id="payment-amount" type="number" min="0.01" max={remaining} step="0.01" value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} /></div>
                <div className="flex flex-col gap-2"><Label htmlFor="payment-date">Date</Label><Input id="payment-date" type="date" value={payment.paidAt} onChange={(event) => setPayment({ ...payment, paidAt: event.target.value })} /></div>
                <div className="flex flex-col gap-2"><Label>Method</Label><Select value={payment.method} onValueChange={(method) => setPayment({ ...payment, method })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bank">Bank transfer</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="cash">Cash</SelectItem><SelectItem value="card">Card</SelectItem><SelectItem value="cheque">Cheque</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                <div className="flex flex-col gap-2"><Label htmlFor="payment-ref">Reference</Label><Input id="payment-ref" value={payment.reference} onChange={(event) => setPayment({ ...payment, reference: event.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button><Button disabled={pending} onClick={() => run(() => recordPayment({ documentId, amount: Number(payment.amount), paidAt: payment.paidAt, method: payment.method, reference: payment.reference, notes: payment.notes }), () => setPaymentOpen(false))}>Save payment</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Settled {symbol}{(paid + credited).toLocaleString()}</span><strong>{symbol}{remaining.toLocaleString()} remaining</strong></div>
          <Progress value={Math.min(100, progress)} />
          <div className="flex gap-4 text-xs text-muted-foreground"><span>Payments: {symbol}{paid.toLocaleString()}</span><span>Credits: {symbol}{credited.toLocaleString()}</span></div>
        </div>
        {(payments.length > 0 || credits.length > 0) && <div className="flex flex-col gap-2 border-t pt-4">
          {payments.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><div><p className="font-medium">Payment · {symbol}{Number(item.amount).toLocaleString()}</p><p className="text-xs text-muted-foreground">{new Date(item.paid_at).toLocaleDateString()} {item.method ? `· ${item.method}` : ""}</p></div><Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => deletePayment(item.id, documentId))}>Delete</Button></div>)}
          {credits.map((item) => <div key={item.id} className="rounded-lg border p-3 text-sm"><div className="flex justify-between gap-4"><p className="font-medium">{item.number} · {symbol}{Number(item.amount).toLocaleString()}</p><span className="text-xs text-muted-foreground">{new Date(item.issued_at).toLocaleDateString()}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.reason}</p></div>)}
        </div>}
      </CardContent>
    </Card>
  )
}
