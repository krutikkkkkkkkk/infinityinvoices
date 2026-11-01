import type { ReactNode } from "react"
import { BellRing, CircleCheckBig, FileText, PencilLine, Send } from "lucide-react"
import { StatusBadge } from "./invoice-bits"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { IconChip, cardInset } from "./ui"

function FormVisual() {
  const fields = [
    { k: "Client", v: "Northwind Coffee Co." },
    { k: "Item", v: "Website design · $1,800" },
    { k: "Due", v: "Net 14" },
  ]
  return (
    <div className="space-y-2">
      {fields.map(({ k, v }, i) => (
        <div key={k} className="flex items-center gap-3 rounded-lg bg-background px-3 py-2 text-xs ring-1 ring-border/60">
          <span className="w-10 text-muted-foreground">{k}</span>
          <span className="truncate font-medium">{v}</span>
          {i === fields.length - 1 && <span className="-ml-2 h-3.5 w-px bg-foreground motion-safe:animate-pulse" aria-hidden />}
        </div>
      ))}
    </div>
  )
}

function EmailVisual() {
  return (
    <div className="rounded-lg bg-background p-3 text-xs ring-1 ring-border/60">
      <p className="text-muted-foreground">
        From <span className="font-medium text-foreground">Mara Lind Studio</span>
      </p>
      <p className="mt-0.5 font-medium">Invoice 2026-031 · $5,098.58 due Nov 17</p>
      <span className="mt-3 inline-flex items-center gap-2 rounded-md bg-card px-2.5 py-1.5 ring-1 ring-border">
        <span className="grid size-6 place-items-center rounded bg-destructive/10 text-destructive">
          <FileText className="size-3.5" aria-hidden />
        </span>
        <span className="font-medium">Invoice-2026-031.pdf</span>
      </span>
    </div>
  )
}

function TimelineVisual() {
  return (
    <ol className="space-y-2 text-xs">
      <li className="flex items-center justify-between gap-2">
        <StatusBadge status="sent" />
        <span className="text-muted-foreground tabular-nums">Nov 3</span>
      </li>
      <li className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
          <BellRing className="size-3" aria-hidden /> Reminder sent
        </span>
        <span className="text-muted-foreground tabular-nums">Nov 18</span>
      </li>
      <li className="flex items-center justify-between gap-2">
        <StatusBadge status="paid" />
        <span className="text-muted-foreground tabular-nums">Nov 19</span>
      </li>
    </ol>
  )
}

const STEPS: { icon: typeof Send; title: string; description: string; visual: ReactNode }[] = [
  {
    icon: PencilLine,
    title: "Fill in the blanks.",
    description: "Client, line items, due date. Your logo, your colors, your payment details. Saved for next time.",
    visual: <FormVisual />,
  },
  {
    icon: Send,
    title: "Send it in one click.",
    description: "Email it with your business name on it and replies going straight to your inbox. Or share a link, or download the PDF.",
    visual: <EmailVisual />,
  },
  {
    icon: CircleCheckBig,
    title: "Watch it get paid.",
    description: "Sent, paid, overdue. Record partial payments, and a nudge button for the ones that go quiet.",
    visual: <TimelineVisual />,
  },
]

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div>
        <SectionHeading
          eyebrow="How it works"
          title="Three steps, then back to real work"
          description="No accounting jargon and no setup marathon. Sign up and send your first invoice in the same sitting."
        />

        <ol className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-3">
          {STEPS.map(({ icon, title, description, visual }, i) => (
            <li key={title} className="flex">
              <InView reveal className={`${cardInset} flex flex-1 flex-col gap-5 p-5 sm:p-6`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <IconChip icon={icon} className="bg-card" />
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">Step {i + 1}</span>
                </div>
                <div className="rounded-xl bg-card p-3" aria-hidden>
                  {visual}
                </div>
                <div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{description}</p>
                </div>
              </InView>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
