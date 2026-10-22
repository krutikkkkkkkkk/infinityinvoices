import { CreditCard, Download, KeyRound, Link2, Lock, UserCheck } from "lucide-react"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"

const ITEMS = [
  { icon: UserCheck, title: "Your data only", description: "Row-level security means each account can read nothing but its own records." },
  { icon: CreditCard, title: "No card numbers stored", description: "Subscriptions are handled by Dodo Payments. Card details never touch our servers." },
  { icon: Lock, title: "Encrypted everywhere", description: "Data is encrypted in transit and at rest by our hosting providers." },
  { icon: Link2, title: "Share links you control", description: "Each document gets its own random link. Delete the document and the link stops working." },
  { icon: KeyRound, title: "Sign in your way", description: "Use Google, GitHub, or email and password. Sessions are handled by Supabase Auth." },
  { icon: Download, title: "Export any time", description: "Every invoice and quotation can be downloaded as a PDF whenever you need it." },
]

export function Security() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Security"
        title="Secure by design"
        description="Your invoices are your business records. Here is how we look after them."
      />
      <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, description }, i) => (
          <li key={title}>
            <InView
              reveal
              className="flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-background p-4"
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-foreground ring-1 ring-border/60" aria-hidden>
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs text-pretty text-muted-foreground">{description}</p>
              </div>
            </InView>
          </li>
        ))}
      </ul>
    </Section>
  )
}
