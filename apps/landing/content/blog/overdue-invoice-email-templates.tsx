import Link from "next/link"
import { DataTable, Example, Note } from "@/components/blog/blocks"
import { APP_URL } from "@/lib/config"
import type { BlogPost } from "@/lib/blog"

export const post: BlogPost = {
  slug: "overdue-invoice-email-templates",
  title: "How to ask for payment on an overdue invoice (5 emails)",
  description:
    "Five payment reminder email templates for overdue invoices, from a friendly nudge to a final notice, plus a follow-up schedule and what to do when emails stop working.",
  category: "Getting paid",
  keywords: [
    "overdue invoice",
    "payment reminder email",
    "overdue invoice email template",
    "how to ask for payment",
    "unpaid invoice follow up",
    "late payment reminder",
  ],
  publishedAt: "2026-10-27",
  intro: (
    <>
      <p>
        Chasing an unpaid invoice feels personal. It rarely is. Most overdue invoices are stuck, not refused: waiting on an
        approval, sent to someone on holiday, or missing a purchase order number.
      </p>
      <p>
        So the goal of a reminder is to make paying you the easiest thing in someone’s inbox. Below is a schedule to follow
        and five emails to copy, each a little firmer than the last.
      </p>
    </>
  ),
  sections: [
    {
      id: "before-you-chase",
      title: "Before you chase: check the basics",
      body: (
        <>
          <ul>
            <li>Did the invoice go to the person who pays, or only to your day-to-day contact?</li>
            <li>Is the due date written on it, and has it actually passed?</li>
            <li>Does the client need a purchase order number or a supplier form before they can pay?</li>
            <li>Are the payment details complete and correct?</li>
          </ul>
          <p>
            If any of those is a no, fix it and resend before you send a reminder. Getting these right the first time is
            covered in <Link href="/blog/how-to-write-an-invoice">how to write an invoice</Link>.
          </p>
        </>
      ),
    },
    {
      id: "reminder-schedule",
      title: "A payment reminder schedule that works",
      body: (
        <>
          <DataTable
            head={["When", "What to send", "Tone"]}
            rows={[
              ["1 to 3 days before due", "A heads-up with the invoice attached", "Helpful"],
              ["1 to 7 days overdue", "First reminder", "Friendly, assumes an oversight"],
              ["14 days overdue", "Second reminder, asking for a payment date", "Direct"],
              ["30 days overdue", "Firm reminder, mentioning late fees or pausing work", "Firm"],
              ["45 to 60 days overdue", "Final notice with a deadline", "Formal"],
            ]}
          />
          <p>Consistency matters more than wording. A client who knows you follow up every week pays you before the people who do not.</p>
        </>
      ),
    },
    {
      id: "email-templates",
      title: "Five overdue invoice email templates",
      body: (
        <>
          <p>Attach the invoice to every one of these. Never make someone search for it.</p>

          <h3>1. Before the due date</h3>
          <Example label="Subject: Invoice 2026-031 due on 17 November">
            {`Hi Sam,

A quick heads-up that invoice 2026-031 for $5,098.58 is due on 17 November. I've attached a copy so it's easy to find.

Let me know if you need anything from me to process it.

Thanks,
Mara`}
          </Example>

          <h3>2. First reminder, a few days overdue</h3>
          <Example label="Subject: Invoice 2026-031 is now overdue">
            {`Hi Sam,

I hope you're well. Invoice 2026-031 for $5,098.58 was due on 17 November and I haven't seen the payment come through yet.

It may have just slipped through, so I've attached it again. Could you let me know when I can expect it?

Thanks,
Mara`}
          </Example>

          <h3>3. Second reminder, two weeks overdue</h3>
          <Example label="Subject: Second reminder: invoice 2026-031, 14 days overdue">
            {`Hi Sam,

Following up on invoice 2026-031 for $5,098.58, which is now 14 days overdue.

Could you confirm the date it will be paid? If something is holding it up on your side, such as a missing PO number or an approval, tell me and I'll sort it out today.

Thanks,
Mara`}
          </Example>

          <h3>4. Firm reminder, 30 days overdue</h3>
          <Example label="Subject: Invoice 2026-031 is 30 days overdue">
            {`Hi Sam,

Invoice 2026-031 for $5,098.58 is now 30 days overdue, and I haven't had a reply to my earlier emails.

As set out in our agreement, a late fee now applies to this invoice, and I'll need to pause further work until it is settled. Please arrange payment this week, or call me if there is a problem I should know about.

Thanks,
Mara`}
          </Example>

          <h3>5. Final notice</h3>
          <Example label="Subject: Final notice: invoice 2026-031">
            {`Hi Sam,

This is a final notice for invoice 2026-031 for $5,098.58, which was due on 17 November and remains unpaid.

If I don't receive payment or hear from you by 31 January, I'll have to consider other options for recovering the amount. I'd much rather resolve this directly, so please get in touch.

Regards,
Mara`}
          </Example>

          <p>
            Only mention a late fee if it was in your contract or on the invoice. If it was not, leave that sentence out and
            read up on <Link href="/blog/invoice-payment-terms">setting payment terms</Link> for next time.
          </p>
        </>
      ),
    },
    {
      id: "when-emails-fail",
      title: "What to do when emails stop working",
      body: (
        <>
          <ul>
            <li>
              <strong>Call.</strong> A two-minute phone call resolves more overdue invoices than a fifth email.
            </li>
            <li>
              <strong>Go around.</strong> Email the accounts team or your contact’s manager, politely, with the invoice
              attached.
            </li>
            <li>
              <strong>Pause the work.</strong> Do not deliver the next milestone while the last one is unpaid.
            </li>
            <li>
              <strong>Offer a plan.</strong> If the client is short of cash, part payments now beat a full payment never.
            </li>
            <li>
              <strong>Escalate formally.</strong> A letter of demand, a small claims court or a collections agency are
              last resorts. What is available and worthwhile depends on your country and the amount, so get local advice
              first.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "prevent-late-payments",
      title: "How to get paid on time next time",
      body: (
        <>
          <ul>
            <li>Take a deposit before starting work with a new client.</li>
            <li>Use shorter terms. Net 14 gives you a reason to follow up two weeks sooner than Net 30.</li>
            <li>Send the invoice the day the work is delivered.</li>
            <li>Offer more than one way to pay.</li>
            <li>Remind before the due date, not only after it.</li>
          </ul>
          <Note title="Let the reminders send themselves">
            <p>
              On Infinity Invoices Pro and Lifetime, turn on auto reminders for a client and they get an email the day
              before an invoice is due, then one a week until it is paid. You can also send a reminder by hand in one
              click. <a href={`${APP_URL}/auth/sign-up`}>Start free</a>.
            </p>
          </Note>
        </>
      ),
    },
  ],
}
