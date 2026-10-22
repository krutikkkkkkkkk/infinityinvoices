import { Clock, Copy } from "lucide-react"
import { QuoteFlowVisual } from "./bento-visuals"
import { InView } from "./motion"

const SIDE = [
  {
    icon: Copy,
    title: "Nothing typed twice",
    description: "Client, line items, taxes, notes and payment details all carry over from the quotation to the invoice.",
  },
  {
    icon: Clock,
    title: "Late fees, when you need them",
    description: "Add a one-time fixed or percentage fee to an invoice that goes overdue, without editing the original.",
  },
]

export function Spotlight() {
  return (
    <section className="px-3 sm:px-4">
      <InView
        reveal
        className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-info px-5 py-12 text-white sm:px-10 sm:py-16"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
            Quotations
          </span>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            From quotation to paid invoice, in one place
          </h2>
          <p className="mt-3 text-pretty text-white/80 sm:text-lg">
            Send a quotation, get it accepted, and convert it to an invoice with one click. The same client, the same
            numbers, no copy-paste.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-4 lg:grid-cols-[1fr_1.3fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {SIDE.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm">
                <Icon className="size-5" aria-hidden />
                <p className="mt-4 font-medium">{title}</p>
                <p className="mt-1.5 text-sm text-pretty text-white/75">{description}</p>
              </div>
            ))}
          </div>
          <InView className="order-first rounded-2xl bg-card p-4 text-foreground shadow-[0_32px_64px_-32px_rgb(0_0_0/0.45)] sm:p-5 lg:order-none">
            <QuoteFlowVisual />
          </InView>
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm">
            <p className="text-sm font-medium">Also on every document</p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {["Duplicate any invoice or quotation", "Save a setup as a reusable preset", "Pick from six templates per document", "Share a link or download the PDF", "Switch currency per client", "Mark as sent, paid or cancelled"].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-white" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </InView>
    </section>
  )
}
