import { ArrowRightLeft, Coins, FileDown, LayoutTemplate, Percent, QrCode } from "lucide-react"
import { TOOLS } from "@/lib/tools"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { ToolLinks } from "./tool-links"
import { IconChip, cardInset } from "./ui"

// Everything here is on the Free plan. Keep it in sync with apps/web/lib/plans.ts.
const INCLUDED = [
  {
    icon: FileDown,
    title: "PDF invoices, no watermark",
    description: "Download every invoice as a clean A4 PDF with your business details on it, not ours.",
  },
  {
    icon: LayoutTemplate,
    title: "Seven free invoice templates",
    description: "Three standard designs and four GST layouts are free. Two more designs come with Pro.",
  },
  {
    icon: Percent,
    title: "Tax and discounts worked out",
    description: "Set a tax rate on each line for GST, VAT or sales tax, add a discount, and the totals add up.",
  },
  {
    icon: Coins,
    title: "15 currencies",
    description: "Invoice in dollars, euros, pounds, rupees and more, with a different currency per invoice.",
  },
  {
    icon: QrCode,
    title: "Payment details on the invoice",
    description: "Bank details, a PayPal email or a UPI ID with a scannable QR code. Clients pay you directly.",
  },
  {
    icon: ArrowRightLeft,
    title: "Quotations that become invoices",
    description: "Send a quotation first, then convert it to an invoice in one click when the client says yes.",
  },
]

export function Included() {
  return (
    <Section id="free-invoice-generator">
      <SectionHeading
        eyebrow="Free invoice generator"
        title="Everything a free invoice maker should do"
        description="The Free plan is the real product, not a trial with a timer on it. This is what 5 invoices a month gets you, for nothing."
      />

      <ul className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {INCLUDED.map(({ icon, title, description }, i) => (
          <li key={title} className="flex">
            <InView reveal className={`${cardInset} flex flex-1 flex-col gap-4 p-5 sm:p-6`} style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
              <IconChip icon={icon} className="bg-card" />
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{description}</p>
              </div>
            </InView>
          </li>
        ))}
      </ul>

      <InView reveal className="mt-12">
        <h3 className="font-heading text-xl font-semibold tracking-tight">More free invoicing tools</h3>
        <ToolLinks tools={TOOLS} className="mt-5" />
      </InView>
    </Section>
  )
}
