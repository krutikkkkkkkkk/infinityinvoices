"use client"

import { BellRing, CheckCircle2 } from "lucide-react"
import { MiniQr, StatusBadge, formatINR, type Status } from "./invoice-bits"
import { useCycle } from "./motion"
import { Card } from "./ui"

const ITEMS = [
  { name: "Brand identity design", qty: 1, rate: 45000 },
  { name: "Website landing page", qty: 1, rate: 24000 },
  { name: "Monthly hosting", qty: 12, rate: 500 },
]
const SUBTOTAL = ITEMS.reduce((sum, item) => sum + item.qty * item.rate, 0)
const GST = Math.round(SUBTOTAL * 0.18)

const STATUS_FLOW: Status[] = ["draft", "sent", "paid"]

export function HeroInvoice() {
  const step = useCycle(STATUS_FLOW.length, 2600)
  const status = STATUS_FLOW[step]

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 relative mx-auto w-full max-w-md py-5 delay-200 duration-700 fill-mode-both">
      <Card className="p-5 sm:p-6">
        <figure aria-label="Example invoice">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                S9
              </div>
              <div>
                <p className="text-sm font-semibold">Studio Nine</p>
                <p className="text-xs text-muted-foreground">GSTIN 27ABCDE1234F1Z5</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium tracking-widest text-muted-foreground">INVOICE</p>
              <p className="text-sm font-medium tabular-nums">INV-0014</p>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Billed to</p>
              <p className="mt-0.5 font-medium">Acme Retail Pvt Ltd</p>
            </div>
            <div key={status} className="animate-in fade-in-0 zoom-in-90 duration-300" aria-live="polite">
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-border/60 text-xs">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-muted/60 px-3 py-2 text-muted-foreground">
              <span>Item</span>
              <span className="w-6 text-right">Qty</span>
              <span className="w-16 text-right">Amount</span>
            </div>
            {ITEMS.map((item) => (
              <div key={item.name} className="grid grid-cols-[1fr_auto_auto] gap-3 border-t border-border/60 px-3 py-2">
                <span className="truncate">{item.name}</span>
                <span className="w-6 text-right tabular-nums text-muted-foreground">{item.qty}</span>
                <span className="w-16 text-right tabular-nums">{formatINR(item.qty * item.rate)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <MiniQr className="size-16 rounded-md ring-1 ring-border/60" />
              <p className="max-w-[7rem] text-xs text-muted-foreground">Scan with any UPI app to pay</p>
            </div>
            <dl className="space-y-1 text-right text-xs tabular-nums">
              <div className="flex justify-end gap-4 text-muted-foreground">
                <dt>Subtotal</dt>
                <dd>{formatINR(SUBTOTAL)}</dd>
              </div>
              <div className="flex justify-end gap-4 text-muted-foreground">
                <dt>GST 18%</dt>
                <dd>{formatINR(GST)}</dd>
              </div>
              <div className="flex justify-end gap-4 pt-1 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatINR(SUBTOTAL + GST)}</dd>
              </div>
            </dl>
          </div>
        </figure>
      </Card>

      {status === "paid" && (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-2 absolute top-0 -right-2 flex items-center gap-2.5 px-3 py-2 text-xs duration-500 sm:-right-6">
          <span className="grid size-7 place-items-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-4" aria-hidden />
          </span>
          <div>
            <p className="font-medium">Marked as paid</p>
            <p className="text-muted-foreground tabular-nums">{formatINR(SUBTOTAL + GST)} via UPI</p>
          </div>
        </Card>
      )}

      <Card className="absolute bottom-0 -left-2 flex items-center gap-2.5 px-3 py-2 text-xs sm:-left-6">
        <span className="grid size-7 place-items-center rounded-full bg-muted text-foreground ring-1 ring-border/60">
          <BellRing className="size-4" aria-hidden />
        </span>
        <div>
          <p className="font-medium">Reminder sent</p>
          <p className="text-muted-foreground">INV-0011 · 2 days overdue</p>
        </div>
      </Card>
    </div>
  )
}
