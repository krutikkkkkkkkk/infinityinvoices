import Link from "next/link"
import { DataTable, Note } from "@/components/blog/blocks"
import { APP_URL } from "@/lib/config"
import type { BlogPost } from "@/lib/blog"

export const post: BlogPost = {
  slug: "quotation-vs-invoice-vs-estimate",
  title: "Quotation vs invoice vs estimate: what's the difference?",
  description:
    "A quotation is a fixed price offer, an estimate is a best guess, and an invoice is a request for payment. Here is when to send each one, and where proforma invoices fit.",
  category: "Invoicing basics",
  keywords: [
    "quotation vs invoice",
    "quote vs estimate",
    "difference between quotation and invoice",
    "proforma invoice",
    "what is a quotation",
    "convert quotation to invoice",
  ],
  publishedAt: "2026-11-03",
  intro: (
    <>
      <p>
        Estimates, quotations and invoices look alike: a list of work with prices next to it. What separates them is timing
        and how firmly they commit you.
      </p>
      <p>
        Send the wrong one and you either promise a price you cannot hold, or ask for money the client has not agreed to
        pay.
      </p>
    </>
  ),
  sections: [
    {
      id: "the-short-answer",
      title: "The short answer",
      body: (
        <>
          <DataTable
            head={["Document", "When you send it", "What it says", "Is the price fixed?"]}
            rows={[
              ["Estimate", "Early, before the scope is clear", "Roughly what this will cost", "No, it can change"],
              ["Quotation", "Once the scope is agreed", "This work, for this price, if you accept by this date", "Yes, once accepted"],
              ["Proforma invoice", "Before work or delivery", "What the final invoice will look like", "Yes, but it is not a demand for payment"],
              ["Invoice", "After the work, or at an agreed milestone", "Please pay this amount by this date", "Yes, it is the bill"],
            ]}
          />
        </>
      ),
    },
    {
      id: "what-is-an-estimate",
      title: "What is an estimate?",
      body: (
        <>
          <p>
            An estimate is an informed guess. You send it when the client wants a number but the work is not fully defined:
            “a site like this usually runs between $4,000 and $6,000”.
          </p>
          <p>
            Give a range, say what it assumes, and say what would push it up. An estimate that looks like a fixed price
            will be remembered as one.
          </p>
        </>
      ),
    },
    {
      id: "what-is-a-quotation",
      title: "What is a quotation?",
      body: (
        <>
          <p>
            A quotation, or quote, is an offer to do specific work for a specific price. Once the client accepts it, both
            sides generally expect that price to hold, so it deserves more care than an estimate.
          </p>
          <p>A good quotation includes:</p>
          <ul>
            <li>
              <strong>The scope,</strong> as line items the client can recognise later on the invoice.
            </li>
            <li>
              <strong>What is not included.</strong> Stock photos, hosting, extra rounds of revisions.
            </li>
            <li>
              <strong>The price,</strong> with tax shown separately.
            </li>
            <li>
              <strong>A validity date.</strong> “Valid for 30 days” protects you from a client accepting last year’s prices.
            </li>
            <li>
              <strong>A timeline</strong> and what you need from the client to keep to it.
            </li>
            <li>
              <strong>Payment terms.</strong> The deposit, the due dates and any late fee. See{" "}
              <Link href="/blog/invoice-payment-terms">invoice payment terms explained</Link>.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "what-is-an-invoice",
      title: "What is an invoice?",
      body: (
        <>
          <p>
            An invoice is a request for payment for work you have done or goods you have delivered. It is also an
            accounting record for both of you, which is why it has a unique number, an issue date and a due date.
          </p>
          <p>
            A quotation asks “do you agree?”. An invoice says “you agreed, here is the bill”. The full list of what goes on
            one is in <Link href="/blog/how-to-write-an-invoice">how to write an invoice</Link>.
          </p>
        </>
      ),
    },
    {
      id: "proforma-invoice",
      title: "Where does a proforma invoice fit?",
      body: (
        <>
          <p>
            A proforma invoice is a preview of the real invoice, sent before the work or the shipment. Clients ask for one
            when they need a document to raise a purchase order, arrange an advance payment or clear customs.
          </p>
          <p>
            It is not a tax invoice and it does not go in your invoice number sequence. When the work is done, you still
            issue the real one.
          </p>
        </>
      ),
    },
    {
      id: "quote-to-invoice",
      title: "Turning a quotation into an invoice",
      body: (
        <>
          <p>When the client says yes, the quotation becomes the template for the invoice:</p>
          <ol>
            <li>Get the acceptance in writing. An email reply saying “approved” is enough to point to later.</li>
            <li>If you agreed a deposit, invoice it straight away.</li>
            <li>Keep the same line items and wording on the invoice so it can be checked against the quote at a glance.</li>
            <li>Add anything extra, such as work outside the original scope, as new lines rather than changing the old ones.</li>
            <li>Mention the quotation number on the invoice.</li>
          </ol>
          <Note title="One click instead of retyping">
            <p>
              Infinity Invoices does quotations as well as invoices. When a client accepts, convert the quotation to an
              invoice and the client, line items and taxes carry over. The free plan includes 5 quotations a month.{" "}
              <a href={`${APP_URL}/auth/sign-up`}>Create a quotation</a>.
            </p>
          </Note>
        </>
      ),
    },
  ],
}
