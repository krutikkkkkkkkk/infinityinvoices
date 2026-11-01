import { Check } from "lucide-react"
import { InView } from "./motion"
import { Eyebrow, Section } from "./section"
import { cardInset } from "./ui"

const THEY_WANT = [
  { who: "FreshBooks", wants: "$19 a month" },
  { who: "Zoho", wants: "you to learn Zoho" },
  { who: "Stripe", wants: "0.4% of every invoice, forever" },
  { who: "Google Docs", wants: "you to realign the totals column one more time" },
]

const YOU_NEED = [
  "An invoice that looks like you made it on purpose",
  "A link your client can open and pay from",
  "A record of who still owes you",
]

export function Problem() {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <InView reveal>
          <Eyebrow>The problem</Eyebrow>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            You&rsquo;re a freelancer, not a finance department.
          </h2>
          <ul className="mt-8 space-y-3">
            {THEY_WANT.map(({ who, wants }) => (
              <li key={who} className="text-pretty text-muted-foreground">
                <span className="font-medium text-foreground">{who}</span> wants {wants}.
              </li>
            ))}
          </ul>
        </InView>

        <InView reveal className={`${cardInset} flex flex-col justify-center p-6 sm:p-8`} style={{ transitionDelay: "100ms" }}>
          <p className="text-sm font-medium text-muted-foreground">All you need is</p>
          <ul className="mt-5 space-y-4">
            {YOU_NEED.map((need) => (
              <li key={need} className="flex gap-3 text-lg font-medium text-pretty">
                <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                  <Check className="size-3" aria-hidden />
                </span>
                {need}
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-border/60 pt-5 font-heading text-xl font-semibold">That&rsquo;s the whole product.</p>
        </InView>
      </div>
    </Section>
  )
}
