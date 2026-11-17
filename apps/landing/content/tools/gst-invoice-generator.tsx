import Link from "next/link"
import { Coins, Hash, IndianRupee, Percent, QrCode, Table2, WholeWord } from "lucide-react"
import { Note } from "@/components/blog/blocks"
import type { ToolPage } from "@/lib/tools"

export const tool: ToolPage = {
  slug: "gst-invoice-generator",
  name: "Free GST invoice generator",
  summary: "GSTIN, GST % per line and a UPI QR code, for India.",
  title: "Free GST Invoice Generator for India | Infinity Invoices",
  description:
    "Make a GST invoice online for free: GSTIN, GST % on every line, tax breakdown by rate, amount in words and a UPI QR code. Download the PDF. No credit card.",
  keywords: [
    "GST invoice generator",
    "free GST invoice generator",
    "GST bill generator",
    "GST invoice maker",
    "tax invoice generator India",
    "GST invoice format",
    "invoice with UPI QR code",
  ],
  updatedAt: "2026-11-17",
  icon: IndianRupee,
  eyebrow: "For freelancers in India",
  h1: "Free GST invoice generator",
  lead: "Make a GST tax invoice in a minute. Add your GSTIN and your client’s, set the GST rate on each line, and download a PDF with the tax worked out and a UPI QR code to pay from.",
  cta: "Create a GST invoice free",
  facts: ["5 invoices a month free", "UPI QR code", "No card to start"],
  features: {
    heading: "What the GST invoice template includes",
    description: "The Tax Invoice template is on the Free plan, along with PDF download.",
    items: [
      {
        icon: Hash,
        title: "GSTIN for you and your client",
        description: "Your GSTIN prints in the header and your client’s sits under their billing address.",
      },
      {
        icon: Percent,
        title: "GST % on every line",
        description: "Set the rate per line item, so one invoice can carry services taxed at different rates.",
      },
      {
        icon: Table2,
        title: "Tax breakdown by rate",
        description: "A summary table shows the taxable value and the tax charged at each GST rate on the invoice.",
      },
      {
        icon: WholeWord,
        title: "Amount in words",
        description: "The invoice total is written out in words as well as figures, the way accounts teams expect.",
      },
      {
        icon: QrCode,
        title: "UPI QR code",
        description: "Add your UPI ID and each invoice carries a QR code for the balance due. Clients scan it with any UPI app.",
      },
      {
        icon: Coins,
        title: "Rupees and 14 other currencies",
        description: "Bill in INR at home, and in dollars, euros or pounds for clients abroad.",
      },
    ],
  },
  steps: {
    heading: "How to make a GST invoice online",
    items: [
      {
        title: "Add your business details",
        description: "Enter your business name, address and GSTIN once. They are printed on every invoice after that.",
      },
      {
        title: "Add your client and line items",
        description: "Enter the client’s name, address and GSTIN, then each service with its quantity, rate and GST %.",
      },
      {
        title: "Choose the Tax Invoice template",
        description: "It lays the invoice out for GST, with the tax breakdown and the amount in words.",
      },
      {
        title: "Download the PDF",
        description: "Add your UPI ID first and the invoice includes a QR code your client can pay from.",
      },
    ],
  },
  guide: {
    heading: "What it handles, and what it leaves to you",
    body: (
      <>
        <p>A GST invoice is a tax document, so it is worth being exact about what this generator covers.</p>
        <h3>Handled for you</h3>
        <ul>
          <li>Your name, address and GSTIN, and your client’s.</li>
          <li>Invoice numbers that run in sequence, plus the issue and due dates.</li>
          <li>The GST rate on each line, and the taxable value and tax for each rate.</li>
          <li>The total in figures and in words.</li>
          <li>Your bank details or UPI ID, with a QR code.</li>
        </ul>
        <h3>Left to you</h3>
        <ul>
          <li>
            <strong>SAC or HSN codes.</strong> There is no separate column, so write the code in the line description.
          </li>
          <li>
            <strong>CGST, SGST and IGST.</strong> The invoice shows GST as one amount per rate. It does not split it into
            central, state and integrated tax, so state the split in the notes if your client needs it.
          </li>
          <li>
            <strong>Place of supply and reverse charge.</strong> Add them in the notes when they apply.
          </li>
          <li>
            <strong>E-invoicing and returns.</strong> It does not generate an IRN or file returns for you.
          </li>
        </ul>
        <Note>
          <p>
            This is general information, not tax advice. The full list of required fields, with a worked example, is in{" "}
            <Link href="/blog/gst-invoice-format-india">GST invoice format for freelancers in India</Link>. Confirm what
            applies to you with a chartered accountant.
          </p>
        </Note>
      </>
    ),
  },
  faqs: [
    {
      q: "Is this GST invoice generator free?",
      a: "Yes. The Free plan includes the Tax Invoice template, 5 invoices a month, PDF download and UPI QR codes, with no credit card.",
    },
    {
      q: "Can I use it if I am not registered for GST?",
      a: "Yes. Leave the GSTIN blank and set no tax on your line items, and you get an ordinary invoice. You cannot charge GST without a GSTIN.",
    },
    {
      q: "Does it split GST into CGST, SGST and IGST?",
      a: "No. The invoice shows the GST rate on each line and the total tax for each rate as a single amount. If your client needs the CGST and SGST or IGST split shown, add it in the invoice notes.",
    },
    {
      q: "Does it create e-invoices or file GST returns?",
      a: "No. It makes the invoice PDF. It does not generate an IRN or an e-way bill, and it does not file returns. E-invoicing applies to larger businesses above a turnover threshold, so most freelancers do not need it.",
    },
    {
      q: "Can clients pay by UPI from the invoice?",
      a: "Yes. Add your UPI ID in settings and each invoice shows a QR code. Your client scans it with any UPI app and pays you directly. We do not take a cut.",
    },
  ],
  guides: ["gst-invoice-format-india", "invoice-international-clients"],
}
