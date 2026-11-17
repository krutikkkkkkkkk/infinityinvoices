import Link from "next/link"
import { ArrowRightLeft, CalendarClock, Coins, LayoutTemplate, Percent, ScrollText } from "lucide-react"
import type { ToolPage } from "@/lib/tools"

export const tool: ToolPage = {
  slug: "quotation-maker",
  name: "Free quotation maker",
  summary: "Send a quote, then turn it into an invoice in one click.",
  title: "Free Quotation Maker & Quote Generator | Infinity Invoices",
  description:
    "Create a professional quotation online for free, download it as a PDF, and convert it to an invoice in one click when your client says yes. No credit card.",
  keywords: [
    "free quotation maker",
    "quotation generator",
    "quote generator",
    "quote maker",
    "online quotation maker",
    "quotation template",
    "convert quotation to invoice",
  ],
  updatedAt: "2026-11-17",
  icon: ScrollText,
  eyebrow: "Quotes and quotations",
  h1: "Free quotation maker",
  lead: "Write a clear, professional quotation in a minute and download it as a PDF. When the client accepts, turn it into an invoice in one click instead of typing it all again.",
  cta: "Create a free quotation",
  facts: ["5 quotations a month free", "PDF download", "No card to start"],
  features: {
    heading: "A quote generator that ends in an invoice",
    description: "A quotation is the first half of getting paid. This one hands over to the second half.",
    items: [
      {
        icon: ArrowRightLeft,
        title: "Convert to an invoice in one click",
        description: "The client, line items and taxes carry over. Nothing is retyped and nothing is mistyped.",
      },
      {
        icon: CalendarClock,
        title: "A valid-until date",
        description: "Every quotation states how long the price holds, so an old quote can’t resurface a year later.",
      },
      {
        icon: Percent,
        title: "Tax and discounts built in",
        description: "Set a tax rate on each line and a percentage or fixed discount. The totals are worked out for you.",
      },
      {
        icon: LayoutTemplate,
        title: "The same templates as your invoices",
        description: "The quotation and the invoice that follows look like they came from the same business.",
      },
      {
        icon: ScrollText,
        title: "Room for your terms",
        description: "A terms and validity section for the scope, the payment schedule and whatever else is being agreed.",
      },
      {
        icon: Coins,
        title: "15 currencies",
        description: "Quote clients abroad in their own currency, from rupees and dollars to euros and pounds.",
      },
    ],
  },
  steps: {
    heading: "How to make a quotation",
    items: [
      {
        title: "Create a free account",
        description: "Sign up with your email, Google or GitHub. It takes under a minute and needs no card.",
      },
      {
        title: "Add the client and what you are quoting for",
        description: "List each item or service with a quantity and a rate. Add tax or a discount if they apply.",
      },
      {
        title: "Set how long the quote is valid",
        description: "Choose a valid-until date and write your terms, so both sides know what was agreed.",
      },
      {
        title: "Download the PDF and send it",
        description: "When the client says yes, open the quotation and choose Convert to Invoice.",
      },
    ],
  },
  guide: {
    heading: "Quotation, quote or estimate?",
    body: (
      <>
        <p>
          A quotation and a quote are the same document: a fixed price for a defined piece of work, valid until a stated
          date. Once the client accepts it, you are expected to hold that price.
        </p>
        <p>
          An estimate is an informed guess, sent before the scope is clear, and the final bill can come in above or below
          it. If the work is still fuzzy, say in the terms that the figure is an estimate, so nobody treats it as a
          promise.
        </p>
        <p>
          Neither one asks for payment. That is the invoice, which you send when the work, or an agreed milestone, is done.
        </p>
        <h3>What a quotation should include</h3>
        <ul>
          <li>Your business details and the client’s.</li>
          <li>A quotation number and the date it was issued.</li>
          <li>Each item or service, with its price.</li>
          <li>Taxes, any discount, and the total.</li>
          <li>The date the quote is valid until.</li>
          <li>Your terms: scope, timeline and how you expect to be paid.</li>
        </ul>
        <p>
          The longer version, with examples, is in{" "}
          <Link href="/blog/quotation-vs-invoice-vs-estimate">quotation vs invoice vs estimate</Link>.
        </p>
      </>
    ),
  },
  faqs: [
    {
      q: "Is the quotation maker free?",
      a: "Yes. The Free plan includes 5 quotations a month as well as 5 invoices, with PDF download and no credit card.",
    },
    {
      q: "Can I convert a quotation into an invoice?",
      a: "Yes. Once a client accepts, convert the quotation to an invoice in one click. The client, line items and taxes carry over. On the Free plan the new invoice counts toward your 5 invoices for the month.",
    },
    {
      q: "What is the difference between a quotation and an invoice?",
      a: "A quotation offers a price before the work starts and asks the client to agree to it. An invoice is sent after the work, or at an agreed milestone, and asks for payment.",
    },
    {
      q: "Can I email a quotation to my client?",
      a: "Emailing from the app is part of Pro and Lifetime. On the Free plan, download the PDF and attach it to your own email.",
    },
    {
      q: "Can I add my logo to a quotation?",
      a: "Yes, on Pro and Lifetime, along with your own colors. On the Free plan quotations use the template’s default colors and your business name.",
    },
  ],
  guides: ["quotation-vs-invoice-vs-estimate", "invoice-payment-terms"],
}
