import type { ComponentType, ReactNode } from "react"
import {
  BarChart3,
  Calculator,
  Globe,
  LayoutTemplate,
  ListChecks,
  Mail,
  QrCode,
  Repeat,
  Wallet,
} from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { InView } from "./motion"
import {
  AutoCalcVisual,
  CurrencyVisual,
  DashboardVisual,
  EmailVisual,
  RecurringVisual,
  StatusVisual,
  SettlementVisual,
  TemplatesVisual,
  UpiVisual,
} from "./bento-visuals"
import { Section, SectionHeading } from "./section"
import { CardHeading, Pill, cardHover, cardInset } from "./ui"

type Tile = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  visual: ReactNode
  className?: string
  badge?: string
}

// Order matters: the lg grid relies on auto-placement to fill each row.
const TILES: Tile[] = [
  {
    icon: LayoutTemplate,
    title: "Six templates, your branding",
    description: "Classic, Minimal, GST-focused Tax, Dark, Executive and Bold. Add your logo, then export a PDF or share a link.",
    visual: <TemplatesVisual />,
    className: "md:col-span-2",
  },
  {
    icon: Calculator,
    title: "Totals that add themselves",
    description: "Quantities, rates, taxes and discounts are calculated as you type.",
    visual: <AutoCalcVisual />,
  },
  {
    icon: QrCode,
    title: "UPI QR on every invoice",
    description: "Clients scan and pay from any UPI app, straight into your account.",
    visual: <UpiVisual />,
  },
  {
    icon: ListChecks,
    title: "Know where every invoice stands",
    description: "Draft, sent, paid, overdue. Filter by status and record partial payments as they come in.",
    visual: <StatusVisual />,
    className: "md:col-span-2",
  },
  {
    icon: Repeat,
    title: "Recurring invoices",
    description: "Put retainers on a weekly, monthly, quarterly or yearly schedule. The next draft is ready when it's due.",
    visual: <RecurringVisual />,
  },
  {
    icon: Wallet,
    title: "Track every rupee",
    description: "Record full or partial payments as they arrive, issue credit notes, and always know the balance left on an invoice.",
    visual: <SettlementVisual />,
  },
  {
    icon: Globe,
    title: "Bill in any currency",
    description: "Set a default currency for your business and invoice international clients in theirs.",
    visual: <CurrencyVisual />,
  },
  {
    icon: Mail,
    title: "Email & reminders",
    description: "Send invoices to your client's inbox and follow up on late ones in one click.",
    visual: <EmailVisual />,
    badge: "Pro",
  },
  {
    icon: BarChart3,
    title: "See your cash flow",
    description: "Your dashboard compares what you invoiced with what you were paid, month by month.",
    visual: <DashboardVisual />,
    className: "md:col-span-2",
  },
]

export function BentoGrid() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="Platform"
        title="Everything you need to bill, follow up and get paid"
        description="Infinity Invoice covers the whole loop, from the first quotation to the final payment, so you spend less time on admin."
        align="split"
      />
      <div>

        <div className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[minmax(19rem,auto)]">
          {TILES.map(({ icon, title, description, visual, className, badge }, i) => (
            <InView
              key={title}
              reveal
              className={cn(cardInset, cardHover, "flex flex-col gap-5 p-4 sm:p-5", className)}
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <CardHeading
                icon={icon}
                title={title}
                description={description}
                action={badge && <Pill tone="brand">{badge}</Pill>}
              />
              <InView className="flex min-h-40 flex-1 flex-col justify-center">{visual}</InView>
            </InView>
          ))}
        </div>
      </div>
    </Section>
  )
}
