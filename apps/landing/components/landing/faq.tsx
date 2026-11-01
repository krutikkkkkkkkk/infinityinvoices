import { ChevronDown } from "lucide-react"
import { LIFETIME_PRICE } from "@/lib/plans"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { cardInset } from "./ui"

const FAQS = [
  {
    q: "Is it really one payment?",
    a: `Yes. Lifetime is ${LIFETIME_PRICE} once and you have Pro for as long as the product exists. If we ever added something that cost us real money per user, it would be an optional add-on, never a surprise bill.`,
  },
  {
    q: "Can my client pay directly from the invoice?",
    a: "Add your bank details, PayPal email or UPI ID and they appear on every invoice, with a scannable QR code for UPI. Clients pay you directly and we don't take a cut.",
  },
  {
    q: "Does it handle my country's taxes?",
    a: "Set a tax rate on any line item, so GST, VAT and sales tax all work. Indian GST invoices also get their own template with your GSTIN and the tax breakdown.",
  },
  {
    q: "What happens to my invoices if you shut down?",
    a: "You can download any invoice as a PDF at any time, and the whole app is open source under the MIT license, so you could run it yourself tomorrow.",
  },
  {
    q: "Why is it so cheap?",
    a: "Because it does one thing, and because one person built it instead of a company with a sales team.",
  },
  {
    q: "Can I email invoices to clients?",
    a: "Yes, on Pro and Lifetime. Invoices go out with your business name on them, and when your client hits reply it lands in your inbox, not ours. Payment reminders are one click.",
  },
  {
    q: "Can I turn a quotation into an invoice?",
    a: "Yes. Once a client accepts a quotation, convert it to an invoice in one click. The client, line items and taxes carry over.",
  },
]

export function Faq() {
  return (
    <Section id="faq">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />

        <InView reveal className={`${cardInset} mt-12 divide-y divide-border/60`}>
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group px-5 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-5 text-sm text-pretty text-muted-foreground">{a}</p>
            </details>
          ))}
        </InView>
      </div>
    </Section>
  )
}
