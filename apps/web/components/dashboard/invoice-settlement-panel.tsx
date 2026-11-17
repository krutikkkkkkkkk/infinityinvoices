"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { recordPayment, deletePayment, issueCreditNote, deleteCreditNote, issueRefundNote, deleteRefundNote } from "@/app/dashboard/invoicing/actions"
import { CURRENCIES, type Currency } from "@/lib/types"
import { getInvoiceBalance, roundMoney } from "@/lib/invoice-balance"
import { downloadPdf } from "@/lib/pdf-download"
import { REFUND_METHOD_LABELS, refundMethodLabel } from "@/lib/refund-methods"
import { Checkbox } from "@/components/ui/checkbox"
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
export interface RefundNote { id: string; number: string; amount: number; reason: string; method: string | null; reference: string | null; refunded_at: string; emailed_at: string | null }

const EMAIL_PATTERN = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/
const REFUND_EMAIL_PRO_MESSAGE = "PRO_REQUIRED:Refund emails are a Pro feature. Upgrade to Pro to email refund notes to your clients."

/** Shows a server error, with an Upgrade action for Pro-only features. */
function showError(error: string, onUpgrade: () => void): void {
  if (!error.startsWith("PRO_REQUIRED:")) {
    toast.error(error)
    return
  }
  toast.error(error.replace("PRO_REQUIRED:", ""), { action: { label: "Upgrade", onClick: onUpgrade } })
}

/** Emails a refund note through the API; resolves to an error message, or null on success. */
async function sendRefundEmail(refundNoteId: string, recipientEmail: string, message: string): Promise<string | null> {
  try {
    const response = await fetch("/api/send-refund-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refundNoteId, recipientEmail, message }),
    })
    if (response.ok) return null
    const data = await response.json().catch(() => null)
    return data?.error || "Couldn't send the refund email"
  } catch {
    return "Couldn't send the refund email. Check your connection and try again."
  }
}

const METHOD_LABELS: Record<string, string> = { bank: "Bank transfer", upi: "UPI", cash: "Cash", card: "Card", cheque: "Cheque", other: "Other" }

function formatDay(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function InvoiceSettlementPanel({ documentId, grandTotal, currency, status, payments, credits, refunds, clientEmail, canEmailRefund }: {
  documentId: string
  grandTotal: number
  currency: Currency
  status: string
  payments: PaymentRecord[]
  credits: CreditNote[]
  refunds: RefundNote[]
  clientEmail: string | null
  /** The owner's plan includes emailing refund notes (Pro). Issuing them is free. */
  canEmailRefund: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [creditOpen, setCreditOpen] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const emptyPayment = { amount: "", paidAt: today, method: "bank", reference: "", notes: "" }
  const [payment, setPayment] = useState(emptyPayment)
  const [credit, setCredit] = useState({ amount: "", reason: "" })
  const [refundOpen, setRefundOpen] = useState(false)
  const emptyRefund = { amount: "", refundedAt: today, method: "original", reference: "", reason: "", sendEmail: canEmailRefund && Boolean(clientEmail), recipient: clientEmail || "" }
  const [refund, setRefund] = useState(emptyRefund)
  const [emailTarget, setEmailTarget] = useState<RefundNote | null>(null)
  const [emailForm, setEmailForm] = useState({ recipient: clientEmail || "", message: "" })
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const goToPlan = () => router.push("/dashboard/plan")

  const symbol = CURRENCIES.find((item) => item.value === currency)?.symbol || currency
  const money = (value: number) => `${symbol}${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  // The lists are the source of truth; the document's cached columns can lag behind
  const balance = getInvoiceBalance({
    grand_total: grandTotal,
    amount_paid: payments.reduce((sum, item) => sum + Number(item.amount), 0),
    credit_total: credits.reduce((sum, item) => sum + Number(item.amount), 0),
  })
  const refunded = roundMoney(refunds.reduce((sum, item) => sum + Number(item.amount), 0))
  const refundable = Math.max(0, roundMoney(balance.paid - refunded))
  const progress = balance.total > 0 ? Math.min(100, (balance.settled / balance.total) * 100) : 0
  const canSettle = status !== "cancelled" && balance.remaining > 0
  const paymentAmount = Number(payment.amount)
  const creditAmount = Number(credit.amount)
  const paymentValid = paymentAmount > 0 && paymentAmount <= balance.remaining + 0.005 && Boolean(payment.paidAt)
  const creditValid = creditAmount > 0 && creditAmount <= balance.remaining + 0.005 && credit.reason.trim().length > 0

  const refundAmount = Number(refund.amount)
  const refundValid = refundAmount > 0 && refundAmount <= refundable + 0.005 && Boolean(refund.refundedAt) && refund.reason.trim().length > 0
    && (!refund.sendEmail || EMAIL_PATTERN.test(refund.recipient.trim()))

  /** Runs a server action; actions report failures by throwing or by returning `{ error }`. */
  function run<T>(action: () => Promise<T>, onDone?: (result: T) => void | Promise<void>) {
    startTransition(async () => {
      try {
        const result = await action()
        const error = result && typeof result === "object" && "error" in result ? (result as { error?: string }).error : undefined
        if (error) return showError(error, goToPlan)
        await onDone?.(result)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong")
      }
    })
  }

  function openRefundDialog() {
    setRefund(emptyRefund)
    setRefundOpen(true)
  }

  function submitRefund() {
    const recipient = refund.recipient.trim()
    run(
      () => issueRefundNote({ documentId, amount: refundAmount, reason: refund.reason, refundedAt: refund.refundedAt, method: refund.method, reference: refund.reference }),
      async (created) => {
        setRefundOpen(false)
        if (!refund.sendEmail || !created.id) return void toast.success(`Refund note ${created.number} issued`)
        const error = await sendRefundEmail(created.id, recipient, "")
        if (error) showError(`Refund note ${created.number} issued, but the email wasn't sent: ${error.replace("PRO_REQUIRED:", "")}`, goToPlan)
        else toast.success(`Refund note ${created.number} issued and emailed to ${recipient}`)
      },
    )
  }

  function submitRefundEmail() {
    const target = emailTarget
    const recipient = emailForm.recipient.trim()
    if (!target) return
    startTransition(async () => {
      const error = await sendRefundEmail(target.id, recipient, emailForm.message)
      if (error) return showError(error, goToPlan)
      toast.success(`Refund note ${target.number} emailed to ${recipient}`)
      setEmailTarget(null)
      router.refresh()
    })
  }

  async function downloadRefund(item: RefundNote) {
    setDownloadingId(item.id)
    const result = await downloadPdf(`/api/refund-notes/pdf?id=${encodeURIComponent(item.id)}`, `Refund-Note-${item.number}.pdf`)
    setDownloadingId(null)
    if (result.status === "error") toast.error(result.message)
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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={refundable <= 0} onClick={openRefundDialog}>
            Issue refund
          </Button>
          <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Issue refund note</DialogTitle>
                <DialogDescription>Record money returned to the client. Up to {money(refundable)} of the payments on this invoice can be refunded; the open balance doesn&apos;t change.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="refund-amount">Amount</Label>
                  <Input id="refund-amount" type="number" inputMode="decimal" min="0.01" max={refundable} step="0.01" value={refund.amount} placeholder={refundable.toFixed(2)} onChange={(event) => setRefund({ ...refund, amount: event.target.value })} />
                  <button type="button" className="self-start text-xs text-muted-foreground underline-offset-2 hover:underline" onClick={() => setRefund({ ...refund, amount: refundable.toFixed(2) })}>Refund the full {money(refundable)}</button>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="refund-date">Refund date</Label>
                  <Input id="refund-date" type="date" max={today} value={refund.refundedAt} onChange={(event) => setRefund({ ...refund, refundedAt: event.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Method</Label>
                  <Select value={refund.method} onValueChange={(method) => setRefund({ ...refund, method })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(REFUND_METHOD_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="refund-ref">Reference</Label>
                  <Input id="refund-ref" value={refund.reference} maxLength={200} placeholder="Transaction ID, cheque no." onChange={(event) => setRefund({ ...refund, reference: event.target.value })} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="refund-reason">Reason</Label>
                  <Textarea id="refund-reason" rows={2} maxLength={500} value={refund.reason} placeholder="Why is this refund being made?" onChange={(event) => setRefund({ ...refund, reason: event.target.value })} />
                </div>
                <div className="flex flex-col gap-3 rounded-lg border p-3 sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="refund-send" disabled={!canEmailRefund} checked={refund.sendEmail} onCheckedChange={(checked) => setRefund({ ...refund, sendEmail: checked === true })} />
                    <Label htmlFor="refund-send" className="font-normal">Email the refund note (PDF) to the client</Label>
                    {!canEmailRefund && <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Pro</Badge>}
                  </div>
                  {!canEmailRefund && (
                    <p className="text-xs text-muted-foreground">
                      Refund emails are part of Pro. You can still download the refund note as a PDF and send it yourself.{" "}
                      <button type="button" className="underline underline-offset-2" onClick={goToPlan}>Upgrade</button>
                    </p>
                  )}
                  {refund.sendEmail && (
                    <Input type="email" aria-label="Recipient email" value={refund.recipient} placeholder="client@example.com" onChange={(event) => setRefund({ ...refund, recipient: event.target.value })} />
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRefundOpen(false)}>Cancel</Button>
                <Button disabled={pending || !refundValid} onClick={submitRefund}>{refund.sendEmail ? "Issue & email refund" : "Issue refund note"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={emailTarget !== null} onOpenChange={(open) => { if (!open) setEmailTarget(null) }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email refund note {emailTarget?.number}</DialogTitle>
                <DialogDescription>The client gets a short refund confirmation with the refund note attached as a PDF.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="refund-email-to">To</Label>
                  <Input id="refund-email-to" type="email" value={emailForm.recipient} placeholder="client@example.com" onChange={(event) => setEmailForm({ ...emailForm, recipient: event.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="refund-email-message">Message (optional)</Label>
                  <Textarea id="refund-email-message" rows={3} maxLength={2000} value={emailForm.message} onChange={(event) => setEmailForm({ ...emailForm, message: event.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEmailTarget(null)}>Cancel</Button>
                <Button disabled={pending || !EMAIL_PATTERN.test(emailForm.recipient.trim())} onClick={submitRefundEmail}>Send email</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            {refunded > 0 && <span>Refunds: {money(refunded)}</span>}
          </div>
        </div>
        {(payments.length > 0 || credits.length > 0 || refunds.length > 0) && (
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
            {refunds.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">Refund note {item.number} · {money(Number(item.amount))}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDay(item.refunded_at)}
                    {item.method ? ` · ${refundMethodLabel(item.method)}` : ""}
                    {item.reference ? ` · Ref ${item.reference}` : ""}
                    {item.emailed_at ? ` · Emailed ${formatDay(item.emailed_at)}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" disabled={downloadingId === item.id} onClick={() => downloadRefund(item)}>{downloadingId === item.id ? "Preparing…" : "PDF"}</Button>
                  <Button variant="ghost" size="sm" disabled={pending} onClick={() => {
                    if (!canEmailRefund) return showError(REFUND_EMAIL_PRO_MESSAGE, goToPlan)
                    setEmailForm({ recipient: clientEmail || "", message: "" })
                    setEmailTarget(item)
                  }}>{item.emailed_at ? "Resend" : "Email"}</Button>
                  <Button variant="ghost" size="sm" disabled={pending} onClick={() => {
                    if (window.confirm(`Void refund note ${item.number}? It will no longer count as refunded.`)) run(() => deleteRefundNote(item.id, documentId))
                  }}>Void</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
