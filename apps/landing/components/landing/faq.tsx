import { ChevronDown } from "lucide-react"
import { LIFETIME_PRICE } from "@/lib/plans"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { cardInset } from "./ui"

export type FaqItem = { q: string; a: string }

// Also published as FAQ structured data on the home page, so keep answers plain text.
export const HOME_FAQS: FaqItem[] = [
  {
    q: "Is Infinity Invoices really a free invoice maker?",
    a: "Yes. The Free plan lets you create 5 invoices and 5 quotations every month and download each one as a PDF, with no watermark and no credit card. You only pay if you want unlimited invoices, your own logo and colors, or to email invoices straight from the app.",
  },
  {
    q: "Do I need an account to generate an invoice?",
    a: "Yes, a free one. Sign up with your email, Google or GitHub in under a minute. The account is what saves your clients, numbers your invoices in order and keeps track of who has paid.",
  },
  {
    q: "Can I download my invoice as a PDF for free?",
    a: "Yes. PDF download is included on every plan, including Free. The PDF is a clean A4 document with your business details on it, not ours.",
  },
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
    a: "Set a tax rate on any line item, so GST, VAT and sales tax all work. Indian GST invoices get their own templates, with your GSTIN, an HSN/SAC column and the tax split into CGST and SGST, or IGST.",
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

export function Faq({ faqs = HOME_FAQS, title = "Questions, answered" }: { faqs?: readonly FaqItem[]; title?: string }) {
  return (
    <Section id="faq">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title={title} />

        <InView reveal className={`${cardInset} mt-12 divide-y divide-border/60`}>
          {faqs.map(({ q, a }) => (
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
