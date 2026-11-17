import Link from "next/link"
import { Briefcase, Feather, IndianRupee, LayoutTemplate, MapPin, Moon, Receipt, Split, Square, Zap } from "lucide-react"
import type { ToolPage } from "@/lib/tools"

export const tool: ToolPage = {
  slug: "invoice-templates",
  name: "Free invoice templates",
  summary: "Nine designs to fill in online. Seven are free.",
  title: "Free Invoice Templates with PDF Download | Infinity Invoices",
  description:
    "Nine clean invoice templates you fill in online and download as a PDF. Seven are free, including GST layouts with CGST, SGST and IGST. No Word or Excel needed.",
  keywords: [
    "free invoice template",
    "invoice templates",
    "invoice template PDF",
    "simple invoice template",
    "professional invoice template",
    "freelance invoice template",
    "blank invoice template",
    "GST invoice template",
  ],
  updatedAt: "2026-11-17",
  icon: LayoutTemplate,
  eyebrow: "Invoice templates",
  h1: "Free invoice templates you fill in online",
  lead: "Pick a design, type in your client and line items, and download a finished PDF. The totals add themselves up, the numbering stays in order, and nothing needs realigning.",
  cta: "Use a free template",
  facts: ["7 templates free", "PDF download", "No card to start"],
  features: {
    heading: "Nine invoice templates, seven of them free",
    description: "Five standard designs and four GST layouts for India. Every one works for invoices and quotations, and comes out as an A4 PDF.",
    items: [
      {
        icon: Square,
        title: "Classic",
        tag: "Free",
        description: "Clean and modern, with an accent bar across the top. The safe choice for any client.",
      },
      {
        icon: Feather,
        title: "Minimal",
        tag: "Free",
        description: "Cream paper and careful typography, for when the work should do the talking.",
      },
      {
        icon: Moon,
        title: "Dark Modern",
        tag: "Free",
        description: "Charcoal and high contrast. Stands out in a folder full of white PDFs.",
      },
      {
        icon: Split,
        title: "GST: CGST + SGST",
        tag: "Free",
        description: "For a client in your own state. The tax on every line is split into CGST and SGST.",
      },
      {
        icon: IndianRupee,
        title: "GST: IGST",
        tag: "Free",
        description: "For a client in another state. The tax is shown as IGST, with the place of supply.",
      },
      {
        icon: MapPin,
        title: "GST: CGST + UTGST",
        tag: "Free",
        description: "For a supply within a union territory such as Chandigarh or Ladakh.",
      },
      {
        icon: Receipt,
        title: "GST, one amount",
        tag: "Free",
        description: "GSTIN, a GST % column and the tax as a single total, for when the split is not needed.",
      },
      {
        icon: Briefcase,
        title: "Executive",
        tag: "Pro",
        description: "A navy sidebar with gold accents, for retainers and larger invoices.",
      },
      {
        icon: Zap,
        title: "Bold",
        tag: "Pro",
        description: "A black header with an amber accent. Hard to miss in an inbox.",
      },
    ],
  },
  steps: {
    heading: "How to use an invoice template",
    items: [
      {
        title: "Create a free account",
        description: "Sign up with your email, Google or GitHub. It takes under a minute and needs no card.",
      },
      {
        title: "Add your business and your client",
        description: "Your name, address and payment details are saved once and filled in on every invoice after that.",
      },
      {
        title: "Pick a template and add line items",
        description: "Switch templates whenever you like. Tax, discounts and totals are worked out for you.",
      },
      {
        title: "Download the PDF",
        description: "Send it however you normally would. On Pro you can also email it from the app or share a link.",
      },
    ],
  },
  guide: {
    heading: "Invoice template or invoice generator?",
    body: (
      <>
        <p>
          A Word or Excel invoice template is a blank file. You type over the placeholder text, repair the formula that
          broke, export a PDF, and try to remember which invoice number you used last time.
        </p>
        <p>
          An invoice generator is a template that does that work for you. You fill in a form and it handles the layout, the
          arithmetic and the numbering. Your clients and line items are saved, so the second invoice takes a fraction of
          the time the first one did.
        </p>
        <h3>What every invoice template should have</h3>
        <ul>
          <li>Your business name and contact details.</li>
          <li>Your client’s name and billing address.</li>
          <li>A unique invoice number, an issue date and a due date.</li>
          <li>A description, quantity and rate for each line.</li>
          <li>The subtotal, any tax or discount, and the total.</li>
          <li>How to pay: bank details, PayPal or a UPI ID.</li>
        </ul>
        <p>
          Each of the nine templates has a place for all of these. For what to write in them, read{" "}
          <Link href="/blog/how-to-write-an-invoice">how to write an invoice</Link>.
        </p>
      </>
    ),
  },
  faqs: [
    {
      q: "Are the invoice templates really free?",
      a: "Seven of the nine are free: Classic, Minimal, Dark Modern and the four GST layouts. The Free plan covers 5 invoices and 5 quotations a month with PDF download. Executive and Bold are part of Pro, which is $5 a month or $29 once.",
    },
    {
      q: "Can I download the templates as Word or Excel files?",
      a: "No. These are templates inside an online invoice maker, not files to edit. You fill in the invoice in your browser and download the finished PDF, which is the format clients expect to receive.",
    },
    {
      q: "Can I add my logo and brand colors?",
      a: "Yes, on Pro and Lifetime. Upload a logo and set your own primary and accent colors for each template. On the Free plan the templates use their default colors.",
    },
    {
      q: "Do the templates work for quotations too?",
      a: "Yes. Every template can be used for a quotation as well as an invoice, and an accepted quotation converts to an invoice in one click.",
    },
    {
      q: "Is there a GST invoice template?",
      a: "Yes, four of them, all free. Choose CGST + SGST for a client in your state, IGST for a client in another state, or CGST + UTGST within a union territory. Each has an HSN/SAC column, the place of supply, a tax summary by rate and the amount in words.",
    },
  ],
  guides: ["how-to-write-an-invoice", "invoice-payment-terms"],
}
