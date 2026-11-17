import Link from "next/link"
import { Example, Note } from "@/components/blog/blocks"
import { APP_URL } from "@/lib/config"
import type { BlogPost } from "@/lib/blog"

export const post: BlogPost = {
  slug: "how-to-write-an-invoice",
  title: "How to write an invoice as a freelancer (with example)",
  description:
    "What to include on a freelance invoice, how to number it, and the small details that get you paid faster. Includes a filled-in invoice example you can copy.",
  category: "Invoicing basics",
  keywords: [
    "how to write an invoice",
    "freelance invoice",
    "what to include on an invoice",
    "invoice example",
    "invoice number format",
    "how to invoice a client",
  ],
  publishedAt: "2026-10-13",
  intro: (
    <>
      <p>
        An invoice has one job: make it easy for someone to pay you. Most late payments are not bad clients. They are invoices
        with a missing due date, a vague description, or no clear way to pay, sitting in an inbox waiting for a question nobody
        has asked yet.
      </p>
      <p>
        This guide covers what goes on a freelance invoice, in what order, and the details that stop it bouncing back.
      </p>
    </>
  ),
  sections: [
    {
      id: "what-to-include",
      title: "What to include on an invoice",
      body: (
        <>
          <p>Every invoice needs to answer five questions: who is billing, who is paying, for what, how much, and by when.</p>
          <ol>
            <li>
              <strong>The word “Invoice”.</strong> It sounds obvious, but it tells an accounts team which pile the document
              belongs in.
            </li>
            <li>
              <strong>Your details.</strong> Your name or business name, address, email, and your tax registration number if
              you have one.
            </li>
            <li>
              <strong>Your client’s details.</strong> The legal name of the company that pays, not just the person you work
              with, plus their billing address.
            </li>
            <li>
              <strong>A unique invoice number.</strong> One number per invoice, never reused.
            </li>
            <li>
              <strong>The issue date and the due date.</strong> Write the due date as a date, not only as “Net 14”.
            </li>
            <li>
              <strong>Line items.</strong> A description, quantity, rate and amount for each thing you are charging for.
            </li>
            <li>
              <strong>Subtotal, tax, discount and total.</strong> Show the working so nobody has to redo your maths.
            </li>
            <li>
              <strong>How to pay.</strong> Bank details, a PayPal email, a UPI ID, or whatever you accept.
            </li>
            <li>
              <strong>Notes and terms.</strong> A purchase order number if the client gave you one, your late fee if you
              charge one, and a thank you.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "invoice-example",
      title: "A filled-in invoice example",
      body: (
        <>
          <p>Here is what that looks like for a designer billing a small project. Swap in your own details.</p>
          <Example label="Invoice example" columns>
            {`INVOICE 2026-031

From:    Mara Lind Studio, 14 Harbor Lane, Portland
To:      Northwind Coffee Co., Accounts Payable
Issued:  3 November 2026
Due:     17 November 2026

Brand identity (logo, colors, type)   1 × $2,400.00   $2,400.00
Website design, 5 pages               1 × $1,800.00   $1,800.00
Revisions after sign-off              6 h × $85.00      $510.00

Subtotal                                              $4,710.00
Sales tax (8.25%)                                       $388.58
Total due                                             $5,098.58

Pay by bank transfer to Mara Lind Studio.
PO number: NW-2291. Thank you for your business.`}
          </Example>
          <p>
            Notice what is not there: no paragraph of legal text, no logo the size of a postcard. A good invoice is short
            enough to approve in ten seconds.
          </p>
        </>
      ),
    },
    {
      id: "invoice-numbers",
      title: "How to number your invoices",
      body: (
        <>
          <p>
            Invoice numbers need to be unique and in sequence. That is the whole rule in most places, and in many countries
            it is also a tax requirement, so gaps and duplicates can cause questions later.
          </p>
          <p>Three formats that work well:</p>
          <ul>
            <li>
              <strong>Year plus sequence:</strong> 2026-031. Easy to read and it resets cleanly each year.
            </li>
            <li>
              <strong>Prefix plus sequence:</strong> INV-0031. Simple, and the prefix separates invoices from quotations.
            </li>
            <li>
              <strong>Client code plus sequence:</strong> NWC-007. Useful when a few clients make up most of your work.
            </li>
          </ul>
          <p>Pick one and stick with it. If you make a mistake on a sent invoice, issue a credit note and a new invoice rather than editing and reusing the old number.</p>
        </>
      ),
    },
    {
      id: "line-items",
      title: "Write line items your client can approve",
      body: (
        <>
          <p>
            The person who approves your invoice is often not the person who hired you. “Design work, $4,710” makes them go
            and ask. “Website design, 5 pages” lets them tick it off against the quote.
          </p>
          <ul>
            <li>Use the same wording as your <Link href="/blog/quotation-vs-invoice-vs-estimate">quotation</Link> or contract.</li>
            <li>For hourly work, show hours and rate, and say which period they cover.</li>
            <li>List extras, such as revisions or rush fees, on their own lines so the original price stays recognisable.</li>
            <li>Put expenses you are passing on in separate lines, with receipts attached if the client expects them.</li>
          </ul>
        </>
      ),
    },
    {
      id: "mistakes",
      title: "Mistakes that delay payment",
      body: (
        <>
          <ul>
            <li>
              <strong>No due date.</strong> An invoice without one gets paid whenever the next payment run happens. See{" "}
              <Link href="/blog/invoice-payment-terms">which payment terms to use</Link>.
            </li>
            <li>
              <strong>No payment details.</strong> If the client has to email you to ask how to pay, you have added days.
            </li>
            <li>
              <strong>Sent to the wrong person.</strong> Ask at the start of a project who invoices should go to.
            </li>
            <li>
              <strong>The wrong company name.</strong> Larger clients reject invoices addressed to a brand name instead of
              the legal entity.
            </li>
            <li>
              <strong>An editable file.</strong> Send a PDF, not a document or a spreadsheet.
            </li>
            <li>
              <strong>Sending it late.</strong> Invoice the day the work is delivered. The clock on your payment terms only
              starts when the invoice arrives.
            </li>
          </ul>
          <p>
            If an invoice does go overdue, here is{" "}
            <Link href="/blog/overdue-invoice-email-templates">how to ask for payment without making it awkward</Link>.
          </p>
        </>
      ),
    },
    {
      id: "make-one",
      title: "Make one without the spreadsheet",
      body: (
        <>
          <p>
            You can build all of this in a document template. You will also realign the totals column every month and number
            two invoices 031 at some point.
          </p>
          <Note title="Or let the software do the boring parts">
            <p>
              Infinity Invoices is a <Link href="/">free invoice maker</Link> that fills in your details, numbers each
              invoice, does the tax maths and saves your clients for next time. It is free for 5 invoices a month, with four{" "}
              <Link href="/invoice-templates">invoice templates</Link> to choose from.{" "}
              <a href={`${APP_URL}/auth/sign-up`}>Create your first invoice</a>.
            </p>
          </Note>
        </>
      ),
    },
  ],
}
