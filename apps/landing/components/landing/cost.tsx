"use client"

import { useState } from "react"
import { cn } from "@infinity/ui/lib/utils"
import { LIFETIME_PRICE } from "@/lib/plans"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { cardInset } from "./ui"

const YEARS = [1, 3, 5]
const LIFETIME = Number(LIFETIME_PRICE.replace("$", ""))

function rows(years: number) {
  const months = years * 12
  return [
    { label: "A typical invoicing app", detail: `$19/mo × ${months} months`, total: 19 * months, ours: false },
    { label: "Infinity Invoice Pro", detail: `$5/mo × ${months} months`, total: 5 * months, ours: false },
    { label: "Infinity Invoice Lifetime", detail: `${LIFETIME_PRICE} once`, total: LIFETIME, ours: true },
  ]
}

export function Cost() {
  const [years, setYears] = useState(3)
  const data = rows(years)
  const max = Math.max(...data.map((r) => r.total))
  const saved = data[0].total - LIFETIME

  return (
    <Section id="cost">
      <SectionHeading
        eyebrow="Do the math"
        title="What four invoices a month really costs"
        description="Subscriptions feel small until you add them up. Here is the same invoicing, three ways."
        align="split"
      />

      <InView reveal className={cn(cardInset, "mt-12 p-5 sm:p-8")}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Over{" "}
            <span className="font-medium text-foreground">
              {years} {years === 1 ? "year" : "years"}
            </span>
            , lifetime saves you <span className="font-semibold text-foreground tabular-nums">${saved.toLocaleString("en-US")}</span>.
          </p>
          <div role="radiogroup" aria-label="Time period" className="flex gap-1 rounded-full bg-card p-1 ring-1 ring-border/60">
            {YEARS.map((y) => (
              <button
                key={y}
                type="button"
                role="radio"
                aria-checked={years === y}
                onClick={() => setYears(y)}
                className={cn(
                  "h-8 rounded-full px-3.5 text-xs font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  years === y ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {y} {y === 1 ? "year" : "years"}
              </button>
            ))}
          </div>
        </div>

        <dl className="mt-8 space-y-6">
          {data.map((row) => (
            <div key={row.label} className="grid gap-2 sm:grid-cols-[14rem_1fr] sm:items-center sm:gap-6">
              <dt>
                <p className={cn("text-sm", row.ours ? "font-semibold" : "font-medium")}>{row.label}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{row.detail}</p>
              </dt>
              <dd className="flex items-center gap-3">
                <span className="h-7 flex-1">
                  <span
                    className={cn(
                      "block h-full min-w-1 rounded-r-[4px] transition-[width] duration-700 ease-out",
                      row.ours ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                    style={{ width: `${(row.total / max) * 100}%` }}
                  />
                </span>
                <span className={cn("w-16 text-right tabular-nums", row.ours ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  ${row.total.toLocaleString("en-US")}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </InView>
    </Section>
  )
}
