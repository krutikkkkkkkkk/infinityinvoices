import { Check, X } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { APP_URL } from "@/lib/config"
import { LANDING_PLANS } from "@/lib/plans"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { Pill, button, buttonSize, cardInset } from "./ui"

export function Pricing() {
  return (
    <Section id="pricing">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing that grows with you"
          description="Start free with every template and the essentials to look professional. Upgrade to Pro for unlimited documents and email sending."
        />

        <div className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-2">
          {LANDING_PLANS.map((plan, i) => (
            <InView
              key={plan.id}
              reveal
              style={{ transitionDelay: `${i * 100}ms` }}
              className={cn(cardInset, "flex flex-col p-5 sm:p-6", plan.highlighted && "border-primary/40")}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">{plan.name}</h3>
                {plan.highlighted && <Pill tone="brand">Most popular</Pill>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight tabular-nums">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </p>
              {plan.yearly && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  or <s className="text-muted-foreground/70">{plan.yearly.compareAt}</s>{" "}
                  <span className="font-medium text-foreground tabular-nums">{plan.yearly.price}</span> {plan.yearly.period} ·{" "}
                  {plan.yearly.note}
                </p>
              )}
              <ul className="mt-6 flex-1 space-y-3 border-t border-border/60 pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                      <Check className="size-3" aria-hidden />
                    </span>
                    {feature}
                  </li>
                ))}
                {plan.excluded.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                      <X className="size-3" aria-hidden />
                    </span>
                    <span>
                      <span className="line-through">{feature}</span> · Pro only
                    </span>
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
      </div>
    </Section>
  )
}
