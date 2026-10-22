"use client"

import { useState, type ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { CurrencyVisual, RecurringVisual, TemplatesVisual, UpiVisual } from "./bento-visuals"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { Pill, cardInset } from "./ui"

const CASES: { key: string; title: string; description: string; tag: string; visual: ReactNode }[] = [
  {
    key: "retainer",
    title: "Freelancer on a monthly retainer",
    description: "Put the retainer on a monthly schedule. A fresh draft is waiting on the first of the month; review it, send it, done.",
    tag: "Recurring invoices",
    visual: <RecurringVisual />,
  },
  {
    key: "gst",
    title: "Agency that needs GST invoices",
    description: "Use the Tax template to show your GSTIN and the tax breakdown on every invoice, with totals calculated for you.",
    tag: "Templates & GST",
    visual: <TemplatesVisual />,
  },
  {
    key: "upi",
    title: "Studio or shop paid by UPI",
    description: "Print a UPI QR code on the invoice. Clients scan it from their phone and the money lands directly in your account.",
    tag: "UPI QR codes",
    visual: <UpiVisual />,
  },
  {
    key: "abroad",
    title: "Consultant with clients abroad",
    description: "Keep INR as your default and bill international clients in their own currency, invoice by invoice.",
    tag: "Multi-currency",
    visual: <CurrencyVisual />,
  },
]

export function UseCases() {
  const [active, setActive] = useState(0)
  const current = CASES[active]

  return (
    <Section id="use-cases">
      <SectionHeading
        eyebrow="Use cases"
        title="How Infinity Invoice fits real businesses"
        description="Pick the situation closest to yours. Each one uses the same account, the same clients and the same templates."
        align="split"
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1.2fr] lg:gap-6">
        <InView reveal>
          <ul className="space-y-2" role="tablist" aria-label="Use cases">
            {CASES.map((c, i) => {
              const selected = i === active
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors",
                      selected ? "border-border/60 bg-background" : "border-transparent hover:bg-muted/60",
                    )}
                  >
                    <div>
                      <p className={cn("font-medium", !selected && "text-muted-foreground")}>{c.title}</p>
                      {selected && <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{c.description}</p>}
                    </div>
                    <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", selected && "rotate-90")} aria-hidden />
                  </button>
                </li>
              )
            })}
          </ul>
        </InView>

        <InView reveal className={`${cardInset} flex min-h-80 flex-col p-5 sm:p-6`} style={{ transitionDelay: "100ms" }}>
          <div className="flex items-center justify-between gap-3">
            <Pill tone="brand">{current.tag}</Pill>
            <span className="text-xs text-muted-foreground tabular-nums">
              {active + 1} / {CASES.length}
            </span>
          </div>
          <InView key={current.key} className="animate-in fade-in-0 slide-in-from-bottom-2 flex flex-1 flex-col justify-center py-6 duration-500">
            {current.visual}
          </InView>
        </InView>
      </div>
    </Section>
  )
}
