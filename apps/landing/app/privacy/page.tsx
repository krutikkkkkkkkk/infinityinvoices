import type { Metadata } from "next"
import { LegalPage } from "@/components/landing/legal-page"
import { SUPPORT_EMAIL } from "@/lib/config"

export const metadata: Metadata = {
  title: "Privacy Policy - Infinity Invoice",
  description: "What Infinity Invoice collects, why, who it is shared with, and the choices you have.",
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what information Infinity Invoice collects when you use the service, how it is used, who it is shared with, and the choices you have. It is written to be read, not skimmed, so it is short and specific."
      sections={[
        {
          id: "who-we-are",
          title: "Who we are",
          body: (
            <>
              <p>
                Infinity Invoice (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is an invoicing and quotation service for freelancers and small
                businesses, available at infinityinvoices.com. We are the controller of the personal data described in this policy.
              </p>
              <p>
                Questions about this policy or your data: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-foreground underline underline-offset-4">{SUPPORT_EMAIL}</a>.
              </p>
            </>
          ),
        },
        {
          id: "what-we-collect",
          title: "What we collect",
          body: (
            <>
              <p><strong>Account details.</strong> Your email address and name when you sign up. If you sign in with Google or GitHub, we receive your email, name and profile picture from that provider. Passwords are handled by our authentication provider and never visible to us.</p>
              <p><strong>Business profile.</strong> What you add to your settings: business name, address, tax registration numbers such as a GSTIN, UPI ID, bank or payment details you choose to print on invoices, default currency, and your logo.</p>
              <p><strong>Documents and clients.</strong> The invoices, quotations, credit notes, line items, products, presets, payment records and recurring schedules you create, including client names, email addresses, phone numbers and addresses you enter.</p>
              <p><strong>Billing.</strong> Your plan, subscription status, and customer and subscription identifiers from our payment processor. We never receive or store your card number.</p>
              <p><strong>Usage.</strong> Counts of invoices, quotations and emails you send each month, used to apply plan limits. Server logs with IP addresses and request details, kept briefly for security and debugging.</p>
              <p><strong>Analytics.</strong> Aggregate page-view analytics from Vercel Analytics. It does not use cookies and does not identify you.</p>
            </>
          ),
        },
        {
          id: "how-we-use-it",
          title: "How we use it",
          body: (
            <ul>
              <li>To run the service: generate documents and PDFs, calculate totals, send invoices and reminders, and apply plan limits.</li>
              <li>To bill you for a paid plan and keep your subscription status in sync.</li>
              <li>To send transactional email about your account, such as sign-in links, password resets and billing notices. We do not send marketing email without asking first.</li>
              <li>To keep the service secure, investigate abuse and fix problems.</li>
              <li>To understand which parts of the product are used, in aggregate.</li>
            </ul>
          ),
        },
        {
          id: "who-we-share-with",
          title: "Who we share it with",
          body: (
            <>
              <p>We do not sell your data. We share it only with providers that help us run the service, under their own privacy terms:</p>
              <ul>
                <li><strong>Neon</strong> hosts our database and handles authentication.</li>
                <li><strong>Vercel</strong> hosts the application and provides anonymous analytics.</li>
                <li><strong>Dodo Payments</strong> processes subscription payments as merchant of record and holds your payment details.</li>
                <li><strong>Resend</strong> delivers the invoices, reminders and account emails you send.</li>
                <li><strong>ImgBB</strong> hosts uploaded logos. Logos are stored at a public image URL so they can appear on your invoices and PDFs.</li>
              </ul>
              <p><strong>Your clients.</strong> When you email a document or share its link, the recipient sees everything printed on it, including your business details. Share links do not expire: anyone who has the link can open the document until you delete it.</p>
              <p>We may also disclose data where the law requires it, or to protect the rights and safety of our users and the service.</p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies",
          body: (
            <>
              <p>We use a small number of cookies, all set by us:</p>
              <ul>
                <li><strong>Session cookies</strong> that keep you signed in.</li>
                <li><strong>Preference cookies</strong> that remember things like your theme and whether the sidebar is collapsed or a notice was dismissed.</li>
              </ul>
              <p>We do not use advertising or cross-site tracking cookies.</p>
            </>
          ),
        },
        {
          id: "retention",
          title: "How long we keep it",
          body: (
            <>
              <p>Your account, documents and clients are kept for as long as your account exists, because they are your business records. Server logs are kept for a short period and then deleted.</p>
              <p>When you delete your account, we delete your profile, documents and clients. Billing records may be retained by our payment processor for as long as tax and accounting law requires. Copies in backups are removed on the backup rotation schedule.</p>
            </>
          ),
        },
        {
          id: "your-choices",
          title: "Your rights and choices",
          body: (
            <>
              <ul>
                <li><strong>Access and export.</strong> You can view everything you have entered in the app and download any document as a PDF.</li>
                <li><strong>Correction.</strong> You can edit your profile, clients and documents at any time.</li>
                <li><strong>Deletion.</strong> You can delete documents and clients yourself. To delete your whole account, email us and we will do it promptly.</li>
                <li><strong>Share links.</strong> Deleting a document disables its link.</li>
              </ul>
              <p>Depending on where you live, you may have additional rights under laws such as India&rsquo;s Digital Personal Data Protection Act or the GDPR, including the right to object or complain to a supervisory authority. Email us and we will help.</p>
            </>
          ),
        },
        {
          id: "security",
          title: "Security",
          body: (
            <p>
              Data is encrypted in transit and at rest by our hosting providers. Access to your data is restricted by row-level
              security so that each account can only read its own records. No system is perfectly secure, so if you believe your account has been
              compromised, contact us immediately.
            </p>
          ),
        },
        {
          id: "children",
          title: "Children",
          body: <p>Infinity Invoice is a business tool and is not directed at anyone under 18. We do not knowingly collect data from children.</p>,
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: (
            <p>
              If we make a material change, we will update the date at the top of this page and, where the change affects how we
              use your data, notify you by email or in the app before it takes effect.
            </p>
          ),
        },
      ]}
    />
  )
}
