import { CircleCheckBig, PencilLine, Send } from "lucide-react"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { IconChip, cardInset } from "./ui"

const STEPS = [
  {
    icon: PencilLine,
    title: "Fill in the blanks.",
    description: "Client, line items, due date. Your logo, your colors, your payment details. Saved for next time.",
  },
  {
    icon: Send,
    title: "Send it in one click.",
    description: "Email it with your business name on it and replies going straight to your inbox. Or share a link, or download the PDF.",
  },
  {
    icon: CircleCheckBig,
    title: "Watch it get paid.",
    description: "Sent, paid, overdue. Record partial payments, and a nudge button for the ones that go quiet.",
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
          {STEPS.map(({ icon, title, description }, i) => (
            <li key={title} className="flex">
              <InView reveal className={`${cardInset} flex flex-1 flex-col gap-5 p-5 sm:p-6`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <IconChip icon={icon} className="bg-card" />
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">Step {i + 1}</span>
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
