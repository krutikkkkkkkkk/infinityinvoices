import { ChevronDown } from "lucide-react"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { cardInset } from "./ui"

const FAQS = [
  {
    q: "Is there really a free plan?",
    a: "Yes. The Free plan includes 5 invoices and 5 quotations every month, up to 10 clients, 4 templates, UPI QR codes, PDF downloads and multi-currency invoicing. No credit card needed.",
  },
  {
    q: "Can I create GST invoices?",
    a: "Yes. Use the GST-focused Tax template to show your GSTIN and tax breakdown. Taxes and discounts are calculated for you as you add line items.",
  },
  {
    q: "How do clients pay through the UPI QR code?",
    a: "Add your UPI ID to an invoice and a QR code appears on it. Clients scan it with any UPI app and the money goes straight to your account. Infinity Invoice never holds your funds.",
  },
  {
    q: "Can I invoice clients outside India?",
    a: "Yes. Set a default currency for your business and pick a different currency per invoice when you bill international clients.",
  },
  {
    q: "How do recurring invoices work?",
    a: "Put any invoice on a weekly, monthly, quarterly or yearly schedule. When it's due, a new draft is created for you to review and send.",
  },
  {
    q: "Can I record partial payments?",
    a: "Yes. Record each payment against an invoice as it comes in and the balance updates. You can also issue credit notes, and add a one-time late fee to an invoice that goes overdue.",
  },
  {
    q: "Can I turn a quotation into an invoice?",
    a: "Yes. Once a client accepts a quotation, convert it to an invoice in one click. The client, line items and taxes carry over, so nothing needs to be typed twice.",
  },
  {
    q: "What do I get with Pro?",
    a: "Pro is $5 a month and removes the monthly invoice and quotation limits. It also unlocks email sending, so you can deliver invoices and reminders straight to your client's inbox.",
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
