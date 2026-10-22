import { BellRing, Calculator, Download, ListChecks, QrCode } from "lucide-react"
import { MiniQr, StatusBadge, formatINR } from "./invoice-bits"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { IconChip, cardInset } from "./ui"

const LEFT = [
  { icon: Calculator, title: "Totals that add themselves", description: "Quantities, rates, GST and discounts are calculated as you type. No formulas to break." },
  { icon: QrCode, title: "Paid by UPI, on the spot", description: "A QR code on the invoice means clients pay from any UPI app, straight into your account." },
]

const RIGHT = [
  { icon: ListChecks, title: "Status at a glance", description: "Draft, sent, paid or overdue. Record partial payments and see what is still owed." },
  { icon: BellRing, title: "Reminders in one click", description: "Follow up on late invoices by email without rewriting the same message every time." },
]

function FeatureCard({ icon, title, description, delay }: (typeof LEFT)[number] & { delay: number }) {
  return (
    <InView reveal className={`${cardInset} flex flex-col gap-5 p-5`} style={{ transitionDelay: `${delay}ms` }}>
      <IconChip icon={icon} className="bg-card" />
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{description}</p>
      </div>
    </InView>
  )
}

function PhoneMockup() {
  return (
    <div
      role="img"
      aria-label="An invoice opened on a phone from its share link, with a UPI QR code and a pay button"
      className="mx-auto w-60 rounded-[2.4rem] border-[6px] border-foreground/90 bg-foreground/90 shadow-[0_32px_48px_-24px_rgb(0_0_0/0.5)]"
    >
      <div className="overflow-hidden rounded-[2rem] bg-card text-card-foreground">
        <div className="flex justify-center pt-2">
          <span className="h-4 w-20 rounded-full bg-foreground/90" aria-hidden />
        </div>
        <div className="space-y-4 p-4 pt-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">S9</span>
            <div className="text-xs">
              <p className="font-semibold">Studio Nine</p>
              <p className="text-muted-foreground">Invoice INV-0014</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amount due</p>
            <div className="flex items-end justify-between gap-2">
              <p className="text-2xl font-semibold tracking-tight tabular-nums">{formatINR(88500)}</p>
              <StatusBadge status="sent" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Due 28 Oct 2026</p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-background p-3">
            <MiniQr className="size-28 rounded-md" />
            <p className="text-[11px] text-muted-foreground">Scan with any UPI app</p>
          </div>
          <div className="space-y-2">
            <span className="flex h-9 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              Pay {formatINR(88500)} via UPI
            </span>
            <span className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-card text-xs font-medium ring-1 ring-border">
              <Download className="size-3.5" aria-hidden /> Download PDF
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Why() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Why us"
        title="Why Infinity Invoice is built for getting paid"
        description="Most invoicing tools stop at the PDF. We built the part that comes after: collecting the money and knowing where you stand."
        align="split"
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1.15fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {LEFT.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 80} />
          ))}
        </div>
        <InView
          reveal
          className="order-first flex items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-primary to-info px-6 pt-10 lg:order-none"
          style={{ transitionDelay: "80ms" }}
        >
          <div className="translate-y-8">
            <PhoneMockup />
          </div>
        </InView>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {RIGHT.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={160 + i * 80} />
          ))}
        </div>
      </div>
    </Section>
  )
}
