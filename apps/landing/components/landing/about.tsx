import { CheckCircle2 } from "lucide-react"
import { AutoCalcVisual, DashboardVisual } from "./bento-visuals"
import { MiniQr, formatINR } from "./invoice-bits"
import { InView } from "./motion"
import { Eyebrow, Section } from "./section"
import { cardInset } from "./ui"

const STATS = [
  { value: "6", label: "Invoice templates" },
  { value: "4", label: "Recurring schedules" },
  { value: "₹0", label: "To get started" },
]

export function About() {
  return (
    <Section>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <InView reveal className={`${cardInset} relative grid gap-3 p-4 sm:grid-cols-5 sm:p-5`}>
          <div className="rounded-xl border border-border/60 bg-card p-4 sm:col-span-3">
            <p className="text-xs font-medium">Revenue</p>
            <p className="text-[11px] text-muted-foreground">Invoiced vs paid</p>
            <InView className="mt-3 h-36">
              <DashboardVisual />
            </InView>
          </div>
          <div className="flex flex-col justify-between gap-3 sm:col-span-2">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">Collected this month</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{formatINR(342000)}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                <CheckCircle2 className="size-3" aria-hidden /> +12.4% vs last month
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
              <MiniQr className="size-14 rounded-md ring-1 ring-border/60" />
              <div className="text-xs">
                <p className="font-medium">UPI on every invoice</p>
                <p className="text-muted-foreground">Scan, pay, done.</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-4 sm:col-span-5">
            <InView>
              <AutoCalcVisual />
            </InView>
          </div>
        </InView>

        <InView reveal style={{ transitionDelay: "100ms" }}>
          <Eyebrow>About</Eyebrow>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Built for how small businesses actually bill
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Infinity Invoice is an invoicing and quotation tool for freelancers, agencies and small shops. It handles the
            parts of billing that eat your evenings: GST totals, UPI collection, chasing late payers and re-creating the
            same retainer invoice every month.
          </p>
          <p className="mt-3 text-pretty text-muted-foreground">
            Quotations, invoices, clients, products and payments all live in one dashboard, so you always know who owes
            you what.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-border/60 pt-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <dd className="text-3xl font-semibold tracking-tight text-primary tabular-nums">{s.value}</dd>
                <dt className="mt-1 text-xs text-muted-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>
        </InView>
      </div>
    </Section>
  )
}
