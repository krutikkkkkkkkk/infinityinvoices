"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { recordPayment, deletePayment, issueCreditNote, deleteCreditNote } from "@/app/dashboard/invoicing/actions"
import { CURRENCIES, type Currency } from "@/lib/types"
import { getInvoiceBalance } from "@/lib/invoice-balance"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export interface PaymentRecord { id: string; amount: number; paid_at: string; method: string | null; reference: string | null; notes?: string | null }
export interface CreditNote { id: string; number: string; amount: number; reason: string; issued_at: string }

const METHOD_LABELS: Record<string, string> = { bank: "Bank transfer", upi: "UPI", cash: "Cash", card: "Card", cheque: "Cheque", other: "Other" }

function formatDay(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function InvoiceSettlementPanel({ documentId, grandTotal, currency, status, payments, credits }: {
  documentId: string
  grandTotal: number
  currency: Currency
  status: string
  payments: PaymentRecord[]
  credits: CreditNote[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [creditOpen, setCreditOpen] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const emptyPayment = { amount: "", paidAt: today, method: "bank", reference: "", notes: "" }
  const [payment, setPayment] = useState(emptyPayment)
  const [credit, setCredit] = useState({ amount: "", reason: "" })

  const symbol = CURRENCIES.find((item) => item.value === currency)?.symbol || currency
  const money = (value: number) => `${symbol}${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  // The lists are the source of truth; the document's cached columns can lag behind
  const balance = getInvoiceBalance({
    grand_total: grandTotal,
    amount_paid: payments.reduce((sum, item) => sum + Number(item.amount), 0),
    credit_total: credits.reduce((sum, item) => sum + Number(item.amount), 0),
  })
  const progress = balance.total > 0 ? Math.min(100, (balance.settled / balance.total) * 100) : 0
  const canSettle = status !== "cancelled" && balance.remaining > 0
  const paymentAmount = Number(payment.amount)
  const creditAmount = Number(credit.amount)
  const paymentValid = paymentAmount > 0 && paymentAmount <= balance.remaining + 0.005 && Boolean(payment.paidAt)
  const creditValid = creditAmount > 0 && creditAmount <= balance.remaining + 0.005 && credit.reason.trim().length > 0

  function run(action: () => Promise<unknown>, onDone?: () => void) {
    startTransition(async () => {
      try {
        await action()
        onDone?.()
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong")
      }
    })
  }

  const settlementBadge = status === "cancelled"
    ? <Badge variant="outline">Cancelled</Badge>
    : balance.isSettled
      ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Settled</Badge>
      : balance.isPartial
        ? <Badge variant="secondary">Partially paid</Badge>
        : <Badge variant="outline">Unpaid</Badge>

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base">Balance & settlements</CardTitle>
          {settlementBadge}
        </div>
        <div className="flex gap-2">
          <Dialog open={creditOpen} onOpenChange={setCreditOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm" disabled={!canSettle}>Issue credit</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Issue credit note</DialogTitle>
                <DialogDescription>Reduce the open balance of {money(balance.remaining)} without recording a payment, for example for a discount or a returned item.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="credit-amount">Amount</Label>
                  <Input id="credit-amount" type="number" inputMode="decimal" min="0.01" max={balance.remaining} step="0.01" value={credit.amount} placeholder={balance.remaining.toFixed(2)} onChange={(event) => setCredit({ ...credit, amount: event.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="credit-reason">Reason</Label>
                  <Textarea id="credit-reason" rows={3} value={credit.reason} placeholder="Why is this credit being issued?" onChange={(event) => setCredit({ ...credit, reason: event.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreditOpen(false)}>Cancel</Button>
                <Button disabled={pending || !creditValid} onClick={() => run(
                  () => issueCreditNote({ documentId, amount: creditAmount, reason: credit.reason }),
                  () => { setCreditOpen(false); setCredit({ amount: "", reason: "" }); toast.success("Credit note issued") },
                )}>Issue credit note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild><Button size="sm" disabled={!canSettle}>Record payment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record payment</DialogTitle>
                <DialogDescription>{money(balance.remaining)} remains on this invoice. Record a part of it or the full amount.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="payment-amount">Amount</Label>
                  <Input id="payment-amount" type="number" inputMode="decimal" min="0.01" max={balance.remaining} step="0.01" value={payment.amount} placeholder={balance.remaining.toFixed(2)} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} />
                  <button type="button" className="self-start text-xs text-muted-foreground underline-offset-2 hover:underline" onClick={() => setPayment({ ...payment, amount: balance.remaining.toFixed(2) })}>Use full remaining balance</button>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="payment-date">Date</Label>
                  <Input id="payment-date" type="date" max={today} value={payment.paidAt} onChange={(event) => setPayment({ ...payment, paidAt: event.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Method</Label>
                  <Select value={payment.method} onValueChange={(method) => setPayment({ ...payment, method })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(METHOD_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="payment-ref">Reference</Label>
                  <Input id="payment-ref" value={payment.reference} placeholder="Transaction ID, cheque no." onChange={(event) => setPayment({ ...payment, reference: event.target.value })} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="payment-notes">Notes</Label>
                  <Textarea id="payment-notes" rows={2} value={payment.notes} onChange={(event) => setPayment({ ...payment, notes: event.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
                <Button disabled={pending || !paymentValid} onClick={() => run(
                  () => recordPayment({ documentId, amount: paymentAmount, paidAt: payment.paidAt, method: payment.method, reference: payment.reference, notes: payment.notes }),
                  () => { setPaymentOpen(false); setPayment(emptyPayment); toast.success(paymentAmount >= balance.remaining - 0.005 ? "Invoice marked as paid" : "Partial payment recorded") },
                )}>Save payment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Settled {money(balance.settled)} of {money(balance.total)}</span>
            <strong>{balance.isSettled ? "Nothing outstanding" : `${money(balance.remaining)} remaining`}</strong>
          </div>
          <Progress value={progress} />
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Payments: {money(balance.paid)}</span>
            <span>Credits: {money(balance.credited)}</span>
          </div>
        </div>
        {(payments.length > 0 || credits.length > 0) && (
          <div className="flex flex-col gap-2 border-t pt-4">
            {payments.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">Payment · {money(Number(item.amount))}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDay(item.paid_at)}
                    {item.method ? ` · ${METHOD_LABELS[item.method] || item.method}` : ""}
                    {item.reference ? ` · Ref ${item.reference}` : ""}
                  </p>
                  {item.notes && <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p>}
                </div>
                <Button variant="ghost" size="sm" disabled={pending} onClick={() => {
                  if (window.confirm("Delete this payment? The invoice balance will go back up.")) run(() => deletePayment(item.id, documentId))
                }}>Delete</Button>
              </div>
            ))}
            {credits.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">Credit note {item.number} · {money(Number(item.amount))}</p>
                  <p className="text-xs text-muted-foreground">{formatDay(item.issued_at)} · {item.reason}</p>
                </div>
                <Button variant="ghost" size="sm" disabled={pending} onClick={() => {
                  if (window.confirm(`Void credit note ${item.number}? The invoice balance will go back up.`)) run(() => deleteCreditNote(item.id, documentId))
                }}>Void</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
