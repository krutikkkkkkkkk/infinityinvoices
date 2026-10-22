import { CircleCheckBig, Send, UserPlus } from "lucide-react"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { IconChip, cardInset } from "./ui"

const STEPS = [
  {
    icon: UserPlus,
    title: "Add your client and items",
    description: "Save clients and products once, or start from a preset with your usual line items, taxes and payment terms.",
  },
  {
    icon: Send,
    title: "Pick a template and send",
    description: "Choose a design, add your UPI QR, then email it, share a link or download the PDF.",
  },
  {
    icon: CircleCheckBig,
    title: "Track it until it's paid",
    description: "See what's sent, paid or overdue. Send a reminder or record a partial payment in a click.",
  },
]

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div>
        <SectionHeading
          eyebrow="How it works"
          title="From blank page to paid in three steps"
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
