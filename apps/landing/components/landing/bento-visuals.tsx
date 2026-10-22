"use client"

import { ArrowDown, Check, FileText, Mail, Plus, Repeat, Send } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { MiniQr, StatusBadge, formatINR, type Status } from "./invoice-bits"
import { useCountUp, useCycle, useParentInView } from "./motion"

// Illustrative swatches of the six templates in apps/web/components/dashboard/template-selector.tsx.
const TEMPLATES = [
  { name: "Classic", paper: "#ffffff", ink: "#18181b", head: "#ffffff", accent: "#4f46e5", sidebar: null },
  { name: "Minimal", paper: "#faf6ee", ink: "#3f3a33", head: "#faf6ee", accent: "#a16207", sidebar: null },
  { name: "Tax", paper: "#ffffff", ink: "#18181b", head: "#ecfdf5", accent: "#047857", sidebar: null },
  { name: "Dark", paper: "#18181b", ink: "#f4f4f5", head: "#18181b", accent: "#818cf8", sidebar: null },
  { name: "Executive", paper: "#ffffff", ink: "#1e293b", head: "#ffffff", accent: "#c8a24a", sidebar: "#1e2a4a" },
  { name: "Bold", paper: "#ffffff", ink: "#18181b", head: "#18181b", accent: "#f97316", sidebar: null },
]

function TemplatePaper({ template, className }: { template: (typeof TEMPLATES)[number]; className?: string }) {
  const darkHead = template.head === "#18181b"
  return (
    <div
      className={cn("flex overflow-hidden rounded-lg shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)] ring-1 ring-black/10", className)}
      style={{ background: template.paper, color: template.ink }}
    >
      {template.sidebar && <div className="w-5 shrink-0" style={{ background: template.sidebar }} />}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-3 py-2.5" style={{ background: template.head }}>
          <div className="size-4 rounded" style={{ background: template.accent }} />
          <span className="text-[8px] font-bold tracking-[0.2em]" style={{ color: darkHead ? "#fff" : template.accent }}>
            {template.name === "Tax" ? "TAX INVOICE" : "INVOICE"}
          </span>
        </div>
        <div className="flex-1 space-y-1.5 px-3 py-2">
          {[70, 55, 62, 40].map((w, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="h-1 rounded-full opacity-25" style={{ width: `${w}%`, background: template.ink }} />
              <div className="h-1 w-5 rounded-full opacity-40" style={{ background: template.ink }} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t px-3 py-2" style={{ borderColor: `${template.ink}1a` }}>
          <span className="text-[7px] opacity-60">Total</span>
          <div className="h-1.5 w-8 rounded-full" style={{ background: template.accent }} />
        </div>
      </div>
    </div>
  )
}

export function TemplatesVisual() {
  const inView = useParentInView()
  const active = useCycle(TEMPLATES.length, 2200, inView)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
      <div className="relative h-44 w-36 shrink-0">
        {[2, 1].map((offset) => (
          <TemplatePaper
            key={offset}
            template={TEMPLATES[(active + offset) % TEMPLATES.length]}
            className={cn(
              "absolute inset-0 opacity-90 transition-transform duration-500",
              offset === 2 ? "translate-x-7 rotate-[10deg] scale-90" : "translate-x-3.5 rotate-[5deg] scale-95",
            )}
          />
        ))}
        <TemplatePaper
          key={active}
          template={TEMPLATES[active]}
          className="animate-in fade-in-0 slide-in-from-bottom-4 zoom-in-95 absolute inset-0 duration-500"
        />
      </div>
      <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-2">
        {TEMPLATES.map((template, i) => (
          <li
            key={template.name}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors duration-300",
              i === active ? "border-primary/40 bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground",
            )}
          >
            <span className="size-2 rounded-full" style={{ background: template.accent }} />
            {template.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

const LINE_ITEMS = [
  { name: "UI design", qty: 2, rate: 12000 },
  { name: "Development", qty: 1, rate: 45000 },
  { name: "Hosting", qty: 12, rate: 500 },
]
const CALC_SUBTOTAL = LINE_ITEMS.reduce((sum, item) => sum + item.qty * item.rate, 0)
const CALC_TAX = Math.round(CALC_SUBTOTAL * 0.18)

export function AutoCalcVisual() {
  const inView = useParentInView()
  const total = useCountUp(CALC_SUBTOTAL + CALC_TAX, inView)

  return (
    <div className="rounded-xl bg-muted/60 p-3 text-xs">
      {LINE_ITEMS.map((item, i) => (
        <div
          key={item.name}
          className="motion-safe:animate-in fade-in-0 slide-in-from-left-2 flex justify-between py-1 fill-mode-both duration-500"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <span className="text-muted-foreground">
            {item.name} <span className="opacity-60">× {item.qty}</span>
          </span>
          <span className="tabular-nums">{formatINR(item.qty * item.rate)}</span>
        </div>
      ))}
      <div className="mt-1 flex justify-between border-t border-dashed border-border pt-2 text-muted-foreground">
        <span>GST 18%</span>
        <span className="tabular-nums">{formatINR(CALC_TAX)}</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="font-medium">Total</span>
        <span className="text-xl font-semibold tracking-tight tabular-nums">{formatINR(total)}</span>
      </div>
    </div>
  )
}

export function UpiVisual() {
  return (
    <div className="flex h-full items-center justify-center gap-4">
      <div className="relative rounded-xl bg-white p-2 ring-1 ring-border/60">
        <MiniQr className="size-24" />
        <div className="motion-safe:animate-scan absolute inset-x-1 top-1/2 h-0.5 rounded-full bg-primary" />
      </div>
      <div className="space-y-2 text-xs">
        <p className="text-xl font-semibold tracking-tight tabular-nums">{formatINR(88500)}</p>
        <p className="text-muted-foreground">Pay with any UPI app</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 font-medium text-success">
          <Check className="size-3" aria-hidden /> Paid directly to you
        </span>
      </div>
    </div>
  )
}

const PIPELINE: Status[] = ["draft", "sent", "paid"]
const RECENT: { id: string; client: string; amount: number; status: Status }[] = [
  { id: "INV-0012", client: "Northwind", amount: 32000, status: "paid" },
  { id: "INV-0013", client: "Globex", amount: 18500, status: "sent" },
  { id: "INV-0011", client: "Initech", amount: 12400, status: "overdue" },
]

export function StatusVisual() {
  const inView = useParentInView()
  const step = useCycle(PIPELINE.length, 1800, inView)

  return (
    <div className="grid h-full gap-5 sm:grid-cols-2 sm:items-center">
      <div className="px-2">
        <div className="relative flex items-center justify-between">
          <div className="absolute inset-x-3 top-1/2 h-0.5 -translate-y-1/2 bg-muted" />
          <div
            className="absolute left-3 top-1/2 h-0.5 -translate-y-1/2 bg-foreground transition-[width] duration-700 ease-out"
            style={{ width: `calc((100% - 1.5rem) * ${step / (PIPELINE.length - 1)})` }}
          />
          {PIPELINE.map((status, i) => (
            <div
              key={status}
              className={cn(
                "relative grid size-6 place-items-center rounded-full border-2 transition-colors duration-500",
                i <= step ? "border-foreground bg-foreground text-background" : "border-border bg-card",
              )}
            >
              {i <= step && <Check className="size-3" aria-hidden />}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between">
          {PIPELINE.map((status, i) => (
            <StatusBadge key={status} status={status} className={cn("transition-opacity", i > step && "opacity-40")} />
          ))}
        </div>
      </div>
      <ul className="space-y-1.5 text-xs">
        {RECENT.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2">
            <span className="min-w-0 truncate">
              <span className="font-medium tabular-nums">{row.id}</span> <span className="text-muted-foreground">· {row.client}</span>
            </span>
            <StatusBadge status={row.status} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const FREQUENCIES = [
  { label: "Weekly", next: "28 Oct" },
  { label: "Monthly", next: "21 Nov" },
  { label: "Quarterly", next: "21 Jan" },
  { label: "Yearly", next: "21 Oct '27" },
]

export function RecurringVisual() {
  const inView = useParentInView()
  const active = useCycle(FREQUENCIES.length, 1600, inView)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="relative grid size-24 place-items-center">
        <div className="motion-safe:animate-[spin_14s_linear_infinite] absolute inset-0 rounded-full border-2 border-dashed border-border" />
        <div className="absolute inset-3 rounded-full bg-muted" />
        <Repeat className="relative size-7 text-foreground" aria-hidden />
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {FREQUENCIES.map((f, i) => (
          <span
            key={f.label}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs transition-colors duration-300",
              i === active ? "border-foreground bg-foreground text-background" : "border-border/60 text-muted-foreground",
            )}
          >
            {f.label}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Next draft{" "}
        <span key={active} className="animate-in fade-in-0 inline-block font-medium text-foreground">
          {FREQUENCIES[active].next}
        </span>
      </p>
    </div>
  )
}

const CURRENCIES = [
  { code: "INR", amount: "₹88,500" },
  { code: "USD", amount: "$1,055" },
  { code: "EUR", amount: "€970" },
  { code: "GBP", amount: "£810" },
  { code: "AED", amount: "AED 3,875" },
]

export function CurrencyVisual() {
  const inView = useParentInView()
  const active = useCycle(CURRENCIES.length, 1700, inView)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="relative h-12 overflow-hidden">
        <div className="transition-transform duration-500 ease-out" style={{ transform: `translateY(-${active * 3}rem)` }}>
          {CURRENCIES.map((c) => (
            <p key={c.code} className="flex h-12 items-center justify-center text-3xl font-semibold tracking-tight tabular-nums">
              {c.amount}
            </p>
          ))}
        </div>
      </div>
      <div className="flex gap-1">
        {CURRENCIES.map((c, i) => (
          <span
            key={c.code}
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide transition-colors duration-300",
              i === active ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
          >
            {c.code}
          </span>
        ))}
      </div>
    </div>
  )
}

export function EmailVisual() {
  return (
    <div className="relative flex h-full flex-col justify-center gap-2 pt-8">
      <Send className="motion-safe:animate-fly absolute top-1 left-4 size-5 text-muted-foreground" aria-hidden />
      <div className="rounded-xl bg-muted/60 p-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-background text-foreground ring-1 ring-border/60">
            <Mail className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">Invoice INV-0014 from Studio Nine</p>
            <p className="text-muted-foreground">to accounts@acme.in</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 font-medium text-background">
            <FileText className="size-3" aria-hidden /> View invoice
          </span>
          <span className="text-muted-foreground">PDF attached</span>
        </div>
      </div>
      <div className="motion-safe:animate-slide-stack ml-4 rounded-xl bg-muted/60 px-3 py-2 text-xs">
        <span className="font-medium">Friendly reminder:</span>{" "}
        <span className="text-muted-foreground">INV-0011 was due 2 days ago</span>
      </div>
    </div>
  )
}

// Example months of invoiced vs paid, in thousands.
const MONTHS = [
  { m: "May", invoiced: 62, paid: 48 },
  { m: "Jun", invoiced: 74, paid: 66 },
  { m: "Jul", invoiced: 58, paid: 55 },
  { m: "Aug", invoiced: 88, paid: 70 },
  { m: "Sep", invoiced: 80, paid: 76 },
  { m: "Oct", invoiced: 96, paid: 82 },
]

export function DashboardVisual() {
  const max = Math.max(...MONTHS.map((d) => d.invoiced))

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-chart-invoiced" /> Invoiced
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-chart-paid" /> Paid
        </span>
      </div>
      <div className="flex min-h-28 flex-1 items-end gap-2.5" role="img" aria-label="Example chart of invoiced versus paid amounts over six months">
        {MONTHS.map((d, i) => (
          <div key={d.m} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end justify-center gap-0.5">
              <div
                className="motion-safe:animate-grow w-full max-w-3 origin-bottom rounded-t-sm bg-chart-invoiced"
                style={{ height: `${(d.invoiced / max) * 100}%`, animationDelay: `${i * 90}ms` }}
              />
              <div
                className="motion-safe:animate-grow w-full max-w-3 origin-bottom rounded-t-sm bg-chart-paid"
                style={{ height: `${(d.paid / max) * 100}%`, animationDelay: `${i * 90 + 60}ms` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.m}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const SETTLEMENT_TOTAL = 88500
const PAYMENTS = [
  { amount: 30000, date: "12 Oct", method: "UPI" },
  { amount: 20000, date: "18 Oct", method: "Bank transfer" },
]
const PAID = PAYMENTS.reduce((sum, p) => sum + p.amount, 0)

/** Mirrors the "Balance & settlements" panel on an invoice. */
export function SettlementVisual() {
  const inView = useParentInView()
  const paid = useCountUp(PAID, inView)
  const pct = Math.round((paid / SETTLEMENT_TOTAL) * 100)

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl bg-muted/60 p-3 text-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">INV-0014 · Acme Retail</p>
          <p className="text-muted-foreground">Total {formatINR(SETTLEMENT_TOTAL)}</p>
        </div>
        <StatusBadge status="sent" />
      </div>
      <div>
        <div className="flex justify-between text-muted-foreground">
          <span>Paid {formatINR(paid)}</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-background" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Amount paid">
          <div className="h-full rounded-full bg-success transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="space-y-1.5">
        {PAYMENTS.map((p, i) => (
          <li
            key={p.date}
            className="motion-safe:animate-in fade-in-0 slide-in-from-bottom-2 flex items-center justify-between rounded-lg bg-background px-3 py-2 fill-mode-both duration-500"
            style={{ animationDelay: `${400 + i * 250}ms` }}
          >
            <div>
              <p className="font-medium tabular-nums">Payment · {formatINR(p.amount)}</p>
              <p className="text-muted-foreground">{p.date} · {p.method}</p>
            </div>
            <Check className="size-3.5 text-success" aria-hidden />
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
        <div>
          <p className="text-muted-foreground">Balance due</p>
          <p className="text-base font-semibold tracking-tight tabular-nums">{formatINR(SETTLEMENT_TOTAL - paid)}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 font-medium text-background">
          <Plus className="size-3" aria-hidden /> Record payment
        </span>
      </div>
    </div>
  )
}

const FLOW = [
  { label: "Quotation", id: "QT-0007", note: "Sent to Acme Retail", status: "sent" as Status },
  { label: "Accepted", id: "QT-0007", note: "Client approved the quote", status: "sent" as Status },
  { label: "Invoice", id: "INV-0015", note: "Created from the quotation", status: "draft" as Status },
]

/** Quotation to invoice, one click. */
export function QuoteFlowVisual() {
  const inView = useParentInView()
  const step = useCycle(FLOW.length, 1800, inView)

  return (
    <ol className="flex flex-col gap-2 text-xs">
      {FLOW.map((item, i) => (
        <li key={item.label} className="contents">
          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-500",
              i <= step ? "border-border/60 bg-card" : "border-transparent bg-muted/60 text-muted-foreground",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className={cn("grid size-7 place-items-center rounded-full transition-colors duration-500", i <= step ? "bg-foreground text-background" : "bg-background text-muted-foreground")}>
                {i < step ? <Check className="size-3.5" aria-hidden /> : <FileText className="size-3.5" aria-hidden />}
              </span>
              <div>
                <p className="font-medium">{item.label} <span className="font-normal text-muted-foreground">· {item.id}</span></p>
                <p className="text-muted-foreground">{item.note}</p>
              </div>
            </div>
            {i === 1 ? (
              <span className={cn("inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success transition-opacity", i > step && "opacity-40")}>
                <Check className="size-3" aria-hidden /> Accepted
              </span>
            ) : (
              <StatusBadge status={item.status} className={cn("transition-opacity", i > step && "opacity-40")} />
            )}
          </div>
          {i < FLOW.length - 1 && <ArrowDown className="mx-auto size-3.5 text-muted-foreground" aria-hidden />}
        </li>
      ))}
    </ol>
  )
}
