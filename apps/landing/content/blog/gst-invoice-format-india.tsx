import Link from "next/link"
import { DataTable, Example, Note } from "@/components/blog/blocks"
import { APP_URL } from "@/lib/config"
import type { BlogPost } from "@/lib/blog"

export const post: BlogPost = {
  slug: "gst-invoice-format-india",
  title: "GST invoice format for freelancers in India",
  description:
    "The mandatory fields on a GST invoice, when to charge CGST and SGST or IGST, SAC codes, invoice numbering rules, and how to bill clients outside India. Written for freelancers.",
  category: "India",
  keywords: [
    "GST invoice format",
    "GST invoice for freelancers",
    "tax invoice format India",
    "GSTIN on invoice",
    "SAC code for freelancers",
    "export of services invoice",
    "UPI QR code on invoice",
  ],
  publishedAt: "2026-11-10",
  intro: (
    <>
      <p>
        If you freelance in India and are registered for GST, your invoice is a tax document with a list of required fields.
        Miss one and your client may not be able to claim input tax credit, which is usually when you get the invoice sent
        back.
      </p>
      <p>This is the format to follow, in plain language.</p>
      <Note>
        <p>
          This is general information, not tax advice. GST rules and limits change, so confirm the details that apply to
          you with a chartered accountant or on the GST portal.
        </p>
      </Note>
    </>
  ),
  sections: [
    {
      id: "do-you-need-gst",
      title: "Do you need to charge GST at all?",
      body: (
        <>
          <p>
            Service providers generally have to register for GST once their total turnover in a financial year crosses ₹20
            lakh. The limit is ₹10 lakh in a few special category states.
          </p>
          <ul>
            <li>
              <strong>Not registered:</strong> send an ordinary invoice with no GST on it. You cannot collect GST without a
              GSTIN.
            </li>
            <li>
              <strong>Registered:</strong> every invoice for a taxable service has to be a tax invoice in the format below.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "mandatory-fields",
      title: "Mandatory fields on a GST invoice",
      body: (
        <>
          <p>A GST tax invoice for services has to show:</p>
          <ol>
            <li>Your name, address and GSTIN.</li>
            <li>A consecutive invoice number, unique within the financial year.</li>
            <li>The date of issue.</li>
            <li>Your client’s name, address and GSTIN, if they are registered.</li>
            <li>A description of the service and its SAC code.</li>
            <li>The taxable value, after any discount.</li>
            <li>The tax rate and the tax amount, shown separately as CGST, SGST or IGST.</li>
            <li>The place of supply, with the state name, when you bill a client in another state.</li>
            <li>Whether tax is payable under reverse charge.</li>
            <li>Your signature or digital signature.</li>
          </ol>
          <p>
            For services, the invoice normally has to be issued within 30 days of providing the service. Everything else
            that makes an invoice easy to pay is in{" "}
            <Link href="/blog/how-to-write-an-invoice">how to write an invoice</Link>.
          </p>
        </>
      ),
    },
    {
      id: "cgst-sgst-igst",
      title: "CGST and SGST, or IGST?",
      body: (
        <>
          <p>It depends on where your client is. Most professional services are taxed at 18%.</p>
          <DataTable
            head={["Your client is in", "You charge", "On a ₹50,000 invoice at 18%"]}
            rows={[
              ["The same state as you", "CGST + SGST, half each", "₹4,500 CGST + ₹4,500 SGST"],
              ["Another Indian state", "IGST", "₹9,000 IGST"],
              ["Outside India", "Usually nothing, as an export of services", "See below"],
            ]}
          />
          <p>The total tax is the same either way. What changes is which line it sits on.</p>
        </>
      ),
    },
    {
      id: "sac-codes",
      title: "SAC codes for freelance services",
      body: (
        <>
          <p>
            Services are classified with a Services Accounting Code. Freelance work mostly falls under heading 9983, which
            covers professional, technical and business services. For example, 998314 is IT design and development and
            998313 is IT consulting and support.
          </p>
          <p>
            Smaller businesses can usually quote the first four digits on invoices to registered clients, and larger ones
            need six. Look up the code for your own service on the GST portal rather than borrowing one from another
            freelancer’s invoice.
          </p>
        </>
      ),
    },
    {
      id: "invoice-numbering",
      title: "GST invoice numbering rules",
      body: (
        <>
          <ul>
            <li>Numbers must run consecutively, with no gaps or repeats.</li>
            <li>Each number must be unique within the financial year, April to March.</li>
            <li>The number can be at most 16 characters.</li>
            <li>It can contain letters, digits, hyphens and slashes.</li>
          </ul>
          <p>
            A format such as <strong>2026-27/031</strong> meets all four and shows which financial year the invoice belongs
            to.
          </p>
        </>
      ),
    },
    {
      id: "sample-format",
      title: "A sample GST invoice format",
      body: (
        <>
          <Example label="GST invoice example, client in another state" columns>
            {`TAX INVOICE                         Invoice no: 2026-27/031
                                    Date: 17 November 2026

From:  Asha Rao Design
       Bengaluru, Karnataka
       GSTIN: 29ABCDE1234F1Z5

To:    Northwind Retail Pvt Ltd
       Mumbai, Maharashtra
       GSTIN: 27ABCDE1234F1Z5

Place of supply: Maharashtra (27)

Website design and development
SAC 998314                                     ₹50,000.00

Taxable value                                  ₹50,000.00
IGST @ 18%                                      ₹9,000.00
Total                                          ₹59,000.00

Reverse charge: No
Pay by UPI: asharao@upi, or scan the QR code`}
          </Example>
          <p>The GSTINs above are placeholders that show the layout. The first two digits are the state code.</p>
        </>
      ),
    },
    {
      id: "foreign-clients",
      title: "Invoicing clients outside India",
      body: (
        <>
          <p>
            Work for an overseas client that is paid in foreign currency generally counts as an export of services, which
            is zero-rated. Registered freelancers usually handle it in one of two ways:
          </p>
          <ul>
            <li>
              <strong>Export under a Letter of Undertaking (LUT).</strong> You file the LUT on the GST portal each year,
              charge no IGST, and note on the invoice that the supply is an export under LUT without payment of integrated
              tax.
            </li>
            <li>
              <strong>Charge IGST and claim a refund.</strong> Less common, because it ties up your money.
            </li>
          </ul>
          <p>
            You can invoice in the client’s currency. Keep the bank’s inward remittance record for each payment, since it is
            your proof that the export happened. There is more on currencies and fees in{" "}
            <Link href="/blog/invoice-international-clients">how to invoice international clients</Link>.
          </p>
        </>
      ),
    },
    {
      id: "upi-qr-code",
      title: "Add a UPI QR code and get paid faster",
      body: (
        <>
          <p>
            A QR code is not required on most freelancers’ invoices, but it removes the step where a client copies your
            account number into their banking app. They scan, the amount is already filled in, and they pay.
          </p>
          <Note title="How Infinity Invoices handles GST invoices">
            <p>
              The tax invoice template prints your GSTIN and your client’s, a tax rate on every line item and the GST
              total. Add your UPI ID and each invoice carries a scannable QR code for the balance due. It does not generate
              e-invoices or file returns. See what the <Link href="/gst-invoice-generator">free GST invoice generator</Link>{" "}
              covers, or <a href={`${APP_URL}/auth/sign-up`}>create a GST invoice free</a>.
            </p>
          </Note>
        </>
      ),
    },
  ],
}
