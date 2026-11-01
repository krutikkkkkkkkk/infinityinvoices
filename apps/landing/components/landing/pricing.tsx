import Link from "next/link"
import { Check } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { APP_URL } from "@/lib/config"
import { LANDING_PLANS } from "@/lib/plans"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { Pill, button, buttonSize, cardInset } from "./ui"

export function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title="Pay once. Bill forever."
        description="Start free. Go monthly if you'd rather, or buy it once and never see another bill from us."
      />

      <div className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-3">
        {LANDING_PLANS.map((plan, i) => (
          <InView
            key={plan.id}
            reveal
            style={{ transitionDelay: `${i * 100}ms` }}
            className={cn(cardInset, "flex flex-col p-5 sm:p-6", plan.highlighted && "border-primary/40 ring-1 ring-primary/20")}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">{plan.name}</h3>
              {plan.highlighted && <Pill tone="brand">Best value</Pill>}
            </div>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">{plan.description}</p>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight tabular-nums">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 border-t border-border/60 pt-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                    <Check className="size-3" aria-hidden />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={`${APP_URL}${plan.path}`}
              className={cn(plan.highlighted ? button.brand : button.outline, buttonSize.default, "mt-6 w-full")}
            >
              {plan.cta}
            </a>
          </InView>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-pretty text-muted-foreground">
        Prices in USD. Lifetime is a one-time purchase with no renewal. If something&rsquo;s wrong, email us within 14 days
        of a charge and we&rsquo;ll work it out, including a refund. See the{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
          Terms
        </Link>
        .
      </p>
    </Section>
  )
}
