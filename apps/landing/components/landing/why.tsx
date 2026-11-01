import { Brush, Clock, FolderLock } from "lucide-react"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { IconChip, cardInset } from "./ui"

const REASONS = [
  {
    icon: Clock,
    title: "Built for how freelancers actually bill.",
    description:
      "Hourly or fixed, partial payments and credit notes, recurring invoices for retainers. Bill in any currency, and set a tax rate per line, so GST, VAT and sales tax all work without a plugin.",
  },
  {
    icon: Brush,
    title: "Looks like you, not like software.",
    description:
      "Every invoice is designed to be the nicest-looking document your client receives that month. Pick one of six templates, then add your logo and set your own colors.",
  },
  {
    icon: FolderLock,
    title: "Yours to keep.",
    description:
      "Download any invoice as a PDF, any time. Self-host it from the repo if you'd rather. Your billing history shouldn't live inside someone's subscription.",
  },
]

export function Why() {
  return (
    <Section id="why">
      <SectionHeading eyebrow="Why this" title="Why this instead of the big ones" />

      <div className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-3">
        {REASONS.map(({ icon, title, description }, i) => (
          <InView key={title} reveal className={`${cardInset} flex flex-col gap-5 p-5 sm:p-6`} style={{ transitionDelay: `${i * 100}ms` }}>
            <IconChip icon={icon} className="bg-card" />
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{description}</p>
            </div>
          </InView>
        ))}
      </div>
    </Section>
  )
}
