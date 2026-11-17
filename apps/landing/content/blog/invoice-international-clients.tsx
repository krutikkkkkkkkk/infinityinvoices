import Link from "next/link"
import { DataTable, Example, Note } from "@/components/blog/blocks"
import { APP_URL } from "@/lib/config"
import type { BlogPost } from "@/lib/blog"

export const post: BlogPost = {
  slug: "invoice-international-clients",
  title: "How to invoice international clients as a freelancer",
  description:
    "Which currency to invoice in, what an international invoice needs, how tax works across borders, and how to get paid without losing a slice to fees and exchange rates.",
  category: "Getting paid",
  keywords: [
    "invoice international clients",
    "international invoice",
    "invoice in foreign currency",
    "multi-currency invoice",
    "invoice overseas client",
    "freelancer international payments",
  ],
  publishedAt: "2026-11-17",
  intro: (
    <>
      <p>
        A client in another country pays the same way a local one does: they receive an invoice and send money. The
        difference is the three places that money can leak on the way: the exchange rate, the transfer fees, and a tax
        question nobody answered in advance.
      </p>
      <p>Settle these before you send the first invoice and overseas clients are no harder to bill than the one down the road.</p>
    </>
  ),
  sections: [
    {
      id: "which-currency",
      title: "Which currency should you invoice in?",
      body: (
        <>
          <p>Whoever is not invoiced in their own currency carries the exchange rate risk. So the choice is really about who that should be.</p>
          <DataTable
            head={["Invoice in", "Good for", "The catch"]}
            rows={[
              ["Your client’s currency", "Quick approval. It is the number they budgeted for.", "You receive a little more or less depending on the rate that day."],
              ["Your own currency", "Knowing exactly what you will receive.", "The client has to convert, and may push back or pay a rounded amount."],
              ["A common third currency, such as USD", "Clients and freelancers who both already deal in it.", "Both sides may pay to convert."],
            ]}
          />
          <p>
            Agree the currency in the <Link href="/blog/quotation-vs-invoice-vs-estimate">quotation</Link>, and never
            switch it between the quote and the invoice.
          </p>
        </>
      ),
    },
    {
      id: "what-to-include",
      title: "What an international invoice needs",
      body: (
        <>
          <p>
            Start with <Link href="/blog/how-to-write-an-invoice">everything a normal invoice has</Link>, then add:
          </p>
          <ul>
            <li>
              <strong>The currency code, not just the symbol.</strong> “$” means a different amount in the US, Canada,
              Australia and Singapore. Write USD 2,400.00.
            </li>
            <li>
              <strong>Full legal names and addresses, with countries,</strong> for both you and the client.
            </li>
            <li>
              <strong>Tax registration numbers</strong> for both sides, where they exist.
            </li>
            <li>
              <strong>International bank details.</strong> Account name, account number or IBAN, the bank’s SWIFT or BIC
              code, and the bank’s name and address.
            </li>
            <li>
              <strong>A line about tax,</strong> if no tax is charged, saying why.
            </li>
            <li>
              <strong>Who pays transfer fees.</strong>
            </li>
            <li>
              <strong>Dates written out.</strong> 03/11/2026 is March in one country and November in another. “3 November
              2026” is the same everywhere.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "tax",
      title: "Do you charge tax to a foreign client?",
      body: (
        <>
          <p>
            Often not, but the reason matters and it belongs on the invoice. Cross-border services between businesses are
            commonly taxed where the client is, not where you are. A few patterns you will run into:
          </p>
          <ul>
            <li>
              <strong>Clients in the EU or UK</strong> often account for VAT themselves under the reverse charge. The
              invoice then shows their VAT number and a note that the reverse charge applies.
            </li>
            <li>
              <strong>Freelancers in India</strong> can usually treat overseas work as a zero-rated export of services.
              See the <Link href="/blog/gst-invoice-format-india">GST invoice format guide</Link>.
            </li>
            <li>
              <strong>Clients in the US</strong> may ask you for a W-8BEN form. It is paperwork for their records, not
              something that changes your invoice.
            </li>
          </ul>
          <p>
            These are starting points, not rulings. Tax on cross-border work depends on both countries, so ask an
            accountant once and reuse the answer.
          </p>
        </>
      ),
    },
    {
      id: "getting-paid",
      title: "How to get paid from abroad",
      body: (
        <>
          <DataTable
            head={["Method", "Good for", "Watch out for"]}
            rows={[
              ["International bank transfer (SWIFT)", "Large invoices and corporate clients", "Fees taken by banks along the way, and the rate your bank converts at"],
              ["Multi-currency account", "Regular clients in one or two countries", "The client pays to local account details, so check they can use them"],
              ["PayPal and similar wallets", "Small invoices and fast payment", "Percentage fees and a weaker exchange rate"],
              ["Card payment through a processor", "Clients who prefer cards", "Percentage fees and the risk of chargebacks"],
            ]}
          />
          <p>
            Compare what actually lands in your account, not the advertised fee. A transfer with “no fee” and a poor
            exchange rate can cost more than one with a flat charge.
          </p>
        </>
      ),
    },
    {
      id: "fees",
      title: "Decide who pays the fees",
      body: (
        <>
          <p>
            With an international transfer, charges can be paid by the sender, split, or taken out of what you receive. If
            you say nothing, a $2,400 invoice can arrive as $2,365 and you are left deciding whether $35 is worth an email.
          </p>
          <Example label="Wording to add to the invoice">
            {`Please pay the full invoice amount in USD.
All bank and transfer charges are to be paid by the sender.`}
          </Example>
          <p>For clients who pay often, it can be simpler to build an allowance for fees into your rate and stop thinking about it.</p>
        </>
      ),
    },
    {
      id: "exchange-rates",
      title: "Protect yourself from exchange rate swings",
      body: (
        <>
          <ul>
            <li>
              <strong>Use short payment terms.</strong> The rate moves less in 14 days than in 60. More on{" "}
              <Link href="/blog/invoice-payment-terms">choosing payment terms</Link>.
            </li>
            <li>
              <strong>Take a deposit.</strong> Part of the fee is then converted at a rate you already know.
            </li>
            <li>
              <strong>Invoice in your own currency for long projects,</strong> or agree to revisit the price if the rate
              moves by more than a set amount.
            </li>
            <li>
              <strong>Record the rate on the day you are paid.</strong> Your accountant will ask.
            </li>
          </ul>
          <Note title="A different currency per invoice">
            <p>
              In Infinity Invoices you choose the currency on each invoice, your bank details including the SWIFT code
              print in the payment section, and there is a built-in currency converter for checking what an amount is
              worth at home. <a href={`${APP_URL}/auth/sign-up`}>Send your first invoice free</a>.
            </p>
          </Note>
        </>
      ),
    },
  ],
}
