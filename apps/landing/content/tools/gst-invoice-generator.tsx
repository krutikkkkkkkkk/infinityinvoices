import Link from "next/link"
import { Hash, IndianRupee, MapPin, QrCode, ScanBarcode, Split, WholeWord } from "lucide-react"
import { Note } from "@/components/blog/blocks"
import type { ToolPage } from "@/lib/tools"

export const tool: ToolPage = {
  slug: "gst-invoice-generator",
  name: "Free GST invoice generator",
  summary: "CGST, SGST and IGST invoices with a UPI QR code.",
  title: "Free GST Invoice Generator for India | Infinity Invoices",
  description:
    "Make a GST invoice online for free, with CGST and SGST or IGST on every line, HSN/SAC codes, place of supply and a UPI QR code. Download the PDF.",
  keywords: [
    "GST invoice generator",
    "free GST invoice generator",
    "GST bill generator",
    "GST invoice maker",
    "tax invoice generator India",
    "GST invoice format",
    "CGST SGST invoice format",
    "IGST invoice format",
    "invoice with UPI QR code",
  ],
  updatedAt: "2026-11-17",
  icon: IndianRupee,
  eyebrow: "For freelancers in India",
  h1: "Free GST invoice generator",
  lead: "Make a GST tax invoice in a minute. Add your GSTIN and your client’s, set the GST rate on each line, and download a PDF with the tax split into CGST and SGST, or shown as IGST, and a UPI QR code to pay from.",
  cta: "Create a GST invoice free",
  facts: ["CGST, SGST and IGST", "5 invoices a month free", "No card to start"],
  features: {
    heading: "What the GST invoice templates include",
    description: "There is a template for each kind of supply, and all of them are on the Free plan.",
    items: [
      {
        icon: Split,
        title: "CGST and SGST, or IGST",
        description: "Pick CGST + SGST for a client in your state, IGST for another state, or CGST + UTGST in a union territory. The tax is split on every line.",
      },
      {
        icon: ScanBarcode,
        title: "HSN/SAC column",
        description: "Write the code in a line’s description, such as SAC 998314, and it moves into its own column. Saved products fill it in for you.",
      },
      {
        icon: MapPin,
        title: "Place of supply",
        description: "Worked out from the state code at the start of the GSTIN and printed with the state name, along with each party’s state.",
      },
      {
        icon: Hash,
        title: "GSTIN and tax summary",
        description: "Both GSTINs, plus a table of the taxable value and tax at each GST rate, so one invoice can mix rates.",
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
        title: "Choose the GST template that fits",
        description: "CGST + SGST, IGST or CGST + UTGST. When both GSTINs are filled in, the right one is marked for you.",
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
          <li>Your name, address, state and GSTIN, and your client’s.</li>
          <li>Invoice numbers that run in sequence, plus the issue and due dates.</li>
          <li>The taxable value of each line, with the tax split into CGST and SGST, CGST and UTGST, or shown as IGST.</li>
          <li>An HSN/SAC column, filled from the code you write in the line description.</li>
          <li>The place of supply, a tax summary by rate, and the total in figures and in words.</li>
          <li>Your bank details or UPI ID, with a QR code.</li>
        </ul>
        <h3>Left to you</h3>
        <ul>
          <li>
            <strong>Choosing the template.</strong> You pick the one that matches where your client is. When both GSTINs
            are on the invoice the matching template is marked, but for a client without a GSTIN the choice is yours.
          </li>
          <li>
            <strong>Reverse charge and exports.</strong> There is no field for either. If tax is payable under reverse
            charge, or the invoice is an export under a Letter of Undertaking, say so in the notes.
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
      a: "Yes. The Free plan includes all four GST templates, 5 invoices a month, PDF download and UPI QR codes, with no credit card.",
    },
    {
      q: "Can I use it if I am not registered for GST?",
      a: "Yes. Leave the GSTIN blank and set no tax on your line items, and you get an ordinary invoice. You cannot charge GST without a GSTIN.",
    },
    {
      q: "Does it split GST into CGST, SGST and IGST?",
      a: "Yes. Choose the CGST + SGST template for a client in your own state and the tax on every line is split in two. Choose IGST for a client in another state, or CGST + UTGST within a union territory. There is also a template that shows GST as one amount.",
    },
    {
      q: "Where do I enter the HSN or SAC code?",
      a: "In the line item’s description, written as SAC 998314 or HSN 8471. The GST templates move it into the HSN/SAC column. If you save a product with its code, the code is added whenever you pick that product.",
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
