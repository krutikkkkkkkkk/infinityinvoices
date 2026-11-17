import Link from "next/link"
import { DataTable, Example, Note } from "@/components/blog/blocks"
import { APP_URL } from "@/lib/config"
import type { BlogPost } from "@/lib/blog"

export const post: BlogPost = {
  slug: "invoice-payment-terms",
  title: "Invoice payment terms explained: Net 30, Net 15 and more",
  description:
    "What Net 30, Net 15, due on receipt and 2/10 Net 30 mean, which payment terms freelancers should use, and how to word late fees so clients pay on time.",
  category: "Getting paid",
  keywords: [
    "invoice payment terms",
    "net 30",
    "net 15",
    "due on receipt",
    "payment terms for freelancers",
    "late fee on invoice",
  ],
  publishedAt: "2026-10-20",
  intro: (
    <>
      <p>
        Payment terms are the part of an invoice that says when you expect the money and what happens if it does not arrive.
        They are two lines long, and they decide whether you are paid in a week or in a quarter.
      </p>
      <p>Here is what the common terms mean, and which ones are worth using when you work for yourself.</p>
    </>
  ),
  sections: [
    {
      id: "common-payment-terms",
      title: "Common invoice payment terms and what they mean",
      body: (
        <>
          <DataTable
            head={["Term", "What it means"]}
            rows={[
              ["Due on receipt", "Payment is expected as soon as the client receives the invoice."],
              ["Net 7", "Payment is due 7 days after the invoice date."],
              ["Net 15", "Payment is due 15 days after the invoice date. Net 14 is the same idea in whole weeks."],
              ["Net 30", "Payment is due 30 days after the invoice date. The default at many larger companies."],
              ["Net 60 / Net 90", "Payment is due 60 or 90 days after the invoice date. Common in enterprise procurement."],
              ["EOM", "End of month. Payment is due at the end of the month the invoice was issued in."],
              ["2/10 Net 30", "The full amount is due in 30 days, with a 2% discount if the client pays within 10."],
              ["50% upfront", "Half is paid before work starts and the rest on delivery."],
            ]}
          />
          <p>
            “Net” counts calendar days, not working days, and it counts from the invoice date. That is one more reason to
            send the invoice the day the work is done.
          </p>
        </>
      ),
    },
    {
      id: "which-terms-to-use",
      title: "Which payment terms should a freelancer use?",
      body: (
        <>
          <p>
            Net 30 is a habit borrowed from companies with cash reserves. You are probably not one. Shorter terms are normal
            for freelancers, and most clients accept them if you set them before the work starts.
          </p>
          <ul>
            <li>
              <strong>Net 14 or Net 15</strong> is a sensible default. It is long enough for a payment run and short enough
              that you are not financing your client.
            </li>
            <li>
              <strong>Due on receipt</strong> suits small, one-off jobs. Be aware that with no date attached, some clients
              read it as “whenever”.
            </li>
            <li>
              <strong>An upfront deposit</strong>, often 30% to 50%, is worth asking for with new clients and on larger
              projects.
            </li>
            <li>
              <strong>Net 30</strong> is fine when a larger client’s process requires it. Price the wait in, and ask what
              you need to do to get into their payment system on day one.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "write-the-date",
      title: "Write the due date, not just the term",
      body: (
        <>
          <p>
            “Net 14” makes the reader do arithmetic. “Due 17 November 2026” does not, and it is hard to misread. Put the
            actual date on the invoice, and keep the term for your contract.
          </p>
          <Example label="Payment terms wording you can copy">
            {`Payment is due by 17 November 2026 (14 days from the invoice date).
Please pay by bank transfer using the details below.
Invoices unpaid after the due date are subject to a late fee of 2% of the invoice total.`}
          </Example>
        </>
      ),
    },
    {
      id: "late-fees",
      title: "Late fees: how much and how to word them",
      body: (
        <>
          <p>
            A late fee is less about the money and more about giving your invoice a deadline that means something. A few
            rules keep it enforceable and friendly:
          </p>
          <ul>
            <li>
              <strong>Agree it first.</strong> Put the fee in your contract or quotation, then repeat it on the invoice. A
              fee that first appears after the due date is easy to dispute.
            </li>
            <li>
              <strong>Keep it modest.</strong> A small fixed amount or a low percentage of the total is typical. The point
              is a nudge, not a penalty.
            </li>
            <li>
              <strong>Check your local rules.</strong> Some countries cap late fees, and some, such as the UK, give
              businesses a legal right to interest on late commercial payments. The details vary, so look up your own.
            </li>
            <li>
              <strong>Apply it when you said you would.</strong> A fee you always waive teaches clients that the due date
              is optional.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "early-payment-discounts",
      title: "Are early payment discounts worth it?",
      body: (
        <>
          <p>
            Terms like 2/10 Net 30 trade a little margin for faster cash. They can help with clients who are reliably slow
            and have a finance team that looks for discounts. For most freelance work a shorter due date and a deposit do
            the same job without giving money away.
          </p>
        </>
      ),
    },
    {
      id: "where-terms-go",
      title: "Where payment terms belong",
      body: (
        <>
          <p>
            Terms that only show up on the invoice are a surprise. Set them out in this order and nobody can say they did
            not know:
          </p>
          <ol>
            <li>In your <Link href="/blog/quotation-vs-invoice-vs-estimate">quotation</Link> or proposal, before the client says yes.</li>
            <li>In the contract, with the late fee.</li>
            <li>On every <Link href="/blog/how-to-write-an-invoice">invoice</Link>, as a due date and a one-line reminder.</li>
          </ol>
          <p>
            And if the date passes anyway, follow up early. These{" "}
            <Link href="/blog/overdue-invoice-email-templates">overdue invoice email templates</Link> cover every stage.
          </p>
          <Note title="Set it once">
            <p>
              In Infinity Invoices every invoice has a due date, and you can attach a fixed or percentage late fee that is
              added once if the invoice goes overdue. <a href={`${APP_URL}/auth/sign-up`}>Try it free</a>.
            </p>
          </Note>
        </>
      ),
    },
  ],
}
