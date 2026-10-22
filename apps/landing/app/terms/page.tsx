import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage } from "@/components/landing/legal-page"
import { SUPPORT_EMAIL } from "@/lib/config"

export const metadata: Metadata = {
  title: "Terms & Conditions - Infinity Invoice",
  description: "The terms that apply when you use Infinity Invoice.",
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="These terms are the agreement between you and Infinity Invoice when you create an account or use the service. By using Infinity Invoice you agree to them. If you are using it on behalf of a business, you confirm you can agree on its behalf."
      sections={[
        {
          id: "the-service",
          title: "The service",
          body: (
            <p>
              Infinity Invoice lets you create invoices, quotations and related documents, send them to your clients, track
              their status, schedule recurring invoices, and manage your account through an optional Telegram bot. We may add,
              change or remove features over time. We will give reasonable notice before removing anything you rely on.
            </p>
          ),
        },
        {
          id: "your-account",
          title: "Your account",
          body: (
            <ul>
              <li>You must be at least 18 and provide accurate information when you sign up.</li>
              <li>You are responsible for everything done through your account and for keeping your sign-in details, and any linked Telegram account, secure.</li>
              <li>One person may not share an account with others. Tell us straight away if you think your account has been accessed without permission.</li>
            </ul>
          ),
        },
        {
          id: "your-content",
          title: "Your content",
          body: (
            <>
              <p>
                The documents, client records, products, logos and other content you add are yours. You give us only the
                permission needed to store, process, display and send that content so the service can work as described.
              </p>
              <p>
                You are responsible for what your documents say. That includes the accuracy of amounts, taxes such as GST,
                payment details and UPI IDs, legal numbering and record-keeping requirements, and having the right to use any
                logo or client information you upload. Infinity Invoice calculates totals from what you enter but does not
                check whether your invoices comply with the law that applies to you.
              </p>
            </>
          ),
        },
        {
          id: "acceptable-use",
          title: "Acceptable use",
          body: (
            <>
              <p>You agree not to use Infinity Invoice to:</p>
              <ul>
                <li>Create fake, misleading or fraudulent invoices or quotations, or impersonate another business.</li>
                <li>Send email to people who have not done business with you or asked to hear from you. Invoice and reminder emails must go to genuine clients.</li>
                <li>Upload content that is unlawful, infringing or malicious, or use the logo upload as general image hosting.</li>
                <li>Probe, overload or interfere with the service, bypass plan limits, or access other users&rsquo; data.</li>
                <li>Resell or sublicense the service without our written agreement.</li>
              </ul>
            </>
          ),
        },
        {
          id: "plans-and-billing",
          title: "Plans and billing",
          body: (
            <>
              <p>
                <strong>Free plan.</strong> Includes a monthly allowance of invoices and quotations, shown on the{" "}
                <Link href="/#pricing" className="text-foreground underline underline-offset-4">pricing section</Link>. Allowances reset each calendar month. Email sending is not included.
              </p>
              <p>
                <strong>Pro plan.</strong> Billed monthly in advance at the price shown when you subscribe. It renews
                automatically until you cancel. You can cancel at any time from your plan page; Pro features stay active until the
                end of the period you have paid for, and you will not be charged again.
              </p>
              <p>
                <strong>Payments</strong> are processed by Dodo Payments as merchant of record, under its own terms. Prices exclude
                any taxes that apply where you are, which may be added at checkout.
              </p>
              <p>
                <strong>Refunds.</strong> If something is wrong with the service, email us within 14 days of a charge and we will
                work it out with you, including a refund where that is fair. We do not refund for partial periods after you
                cancel.
              </p>
              <p>
                <strong>Price changes.</strong> We will give you at least 30 days&rsquo; notice by email before a price increase
                takes effect on your subscription.
              </p>
            </>
          ),
        },
        {
          id: "email-and-telegram",
          title: "Email sending and the Telegram bot",
          body: (
            <>
              <p>
                Emails you send through Infinity Invoice go out in your name, from our sending domain, to the addresses you
                provide. We may limit or pause sending if it causes delivery problems or complaints.
              </p>
              <p>
                The Telegram bot acts on your instructions. Actions that record a payment ask you to confirm first, and all bot
                actions are logged to your account. You are responsible for anything done through a Telegram account you link.
              </p>
            </>
          ),
        },
        {
          id: "share-links",
          title: "Share links",
          body: (
            <p>
              A document&rsquo;s share link can be opened by anyone who has it, without signing in, until you delete the
              document. Share links only with the people who should see the document.
            </p>
          ),
        },
        {
          id: "availability",
          title: "Availability and changes",
          body: (
            <p>
              We aim to keep the service available at all times but cannot promise it will be uninterrupted. We may suspend it
              for maintenance, security or reasons outside our control. You should keep your own copies of important documents;
              every document can be downloaded as a PDF.
            </p>
          ),
        },
        {
          id: "termination",
          title: "Ending the agreement",
          body: (
            <>
              <p>You can stop using Infinity Invoice and ask us to delete your account at any time.</p>
              <p>
                We may suspend or close your account if you break these terms, if your use creates legal or security risk, or if
                a paid plan goes unpaid. Where reasonable, we will warn you first and give you a chance to export your documents.
              </p>
            </>
          ),
        },
        {
          id: "disclaimers",
          title: "Disclaimers and liability",
          body: (
            <>
              <p>
                Infinity Invoice is provided &ldquo;as is&rdquo;. It is not accounting, tax or legal advice, and we do not
                guarantee that documents produced with it meet the requirements of any tax authority.
              </p>
              <p>
                To the extent the law allows, we are not liable for indirect or consequential losses, lost profits, or lost data,
                and our total liability for any claim is limited to the amount you paid us in the 12 months before the claim.
                Nothing in these terms limits liability that cannot be limited by law.
              </p>
            </>
          ),
        },
        {
          id: "governing-law",
          title: "Governing law",
          body: (
            <p>
              These terms are governed by the laws of India, and the courts of India have jurisdiction over any dispute. If you
              are a consumer in another country, you keep any protection your local law gives you.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to these terms",
          body: (
            <p>
              We may update these terms. For material changes we will give notice by email or in the app at least 14 days before
              they apply. Continuing to use the service after that date means you accept the updated terms.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          body: (
            <p>
              Questions about these terms: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-foreground underline underline-offset-4">{SUPPORT_EMAIL}</a>.
              Our <Link href="/privacy" className="text-foreground underline underline-offset-4">Privacy Policy</Link> explains how we handle your data.
            </p>
          ),
        },
      ]}
    />
  )
}
