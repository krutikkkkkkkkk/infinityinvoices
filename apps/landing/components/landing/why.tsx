import type { ReactNode } from "react"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import { BellRing, Brush, Clock, Download, FileText, FolderLock } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { StatusBadge, formatUSD, type Status } from "./invoice-bits"
import { InView } from "./motion"
import { Section, SectionHeading } from "./section"
import { IconChip, cardInset } from "./ui"

type Reason = {
  icon: LucideIcon
  title: string
  description: string
  /** Big cards carry a photo behind the text; small ones are plain with a product detail. */
  image?: string
  /** Which part of the picture to keep in view when the card crops it. */
  focus?: string
  visual?: ReactNode
  /** Where the card sits in the bento grid. */
  span?: string
}

function FilesVisual() {
  return (
    <ul className="space-y-2 text-xs">
      {["Invoice-2026-031.pdf", "Invoice-2026-030.pdf"].map((file) => (
        <li key={file} className="flex items-center gap-2 rounded-lg bg-background px-2.5 py-2 ring-1 ring-border/60">
          <span className="grid size-6 place-items-center rounded bg-destructive/10 text-destructive">
            <FileText className="size-3.5" />
          </span>
          <span className="flex-1 truncate font-medium">{file}</span>
          <Download className="size-3.5 text-muted-foreground" />
        </li>
      ))}
    </ul>
  )
}

const OWED: { client: string; amount: number; status: Status }[] = [
  { client: "Northwind Coffee Co.", amount: 1800, status: "paid" },
  { client: "Harbor & Pine", amount: 2450, status: "overdue" },
  { client: "Kestrel Labs", amount: 640, status: "sent" },
]

function OwedVisual() {
  return (
    <ul className="divide-y divide-border/60 text-xs">
      {OWED.map(({ client, amount, status }) => (
        <li key={client} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
          <span className="flex-1 truncate font-medium">{client}</span>
          <span className="text-muted-foreground tabular-nums">{formatUSD(amount)}</span>
          <StatusBadge status={status} />
        </li>
      ))}
    </ul>
  )
}

// Bento on large screens (3 columns, 2 rows):
//   [ billing photo (2 wide)    ][ templates ]
//   [ yours to keep ][ who owes ][ photo     ]
//                                [ (2 tall)  ]
// Two columns on tablets with the same wide and tall cards, and a single stack on phones.
const REASONS: Reason[] = [
  {
    icon: Clock,
    title: "Built for how freelancers actually bill.",
    description:
      "Hourly or fixed, partial payments and credit notes, recurring invoices for retainers. Bill in any currency, and set a tax rate per line, so GST, VAT and sales tax all work without a plugin.",
    image: "/images/bento-worktable.jpg",
    span: "md:col-span-2",
  },
  {
    icon: Brush,
    title: "Looks like you, not like software.",
    description:
      "Every invoice is designed to be the nicest-looking document your client receives that month. Pick one of six templates, then add your logo and set your own colors.",
    image: "/images/bento-swatches.jpg",
    focus: "object-[50%_25%]",
    span: "md:row-span-2 md:min-h-0 lg:col-start-3 lg:row-start-1",
  },
  {
    icon: FolderLock,
    title: "Yours to keep.",
    description:
      "Download any invoice as a PDF, any time. Self-host it from the repo if you'd rather. Your billing history shouldn't live inside someone's subscription.",
    visual: <FilesVisual />,
  },
  {
    icon: BellRing,
    title: "Know who still owes you.",
    description:
      "Sent, paid and overdue at a glance. Record partial payments, and nudge the invoices that go quiet in one click.",
    visual: <OwedVisual />,
  },
]

function ReasonCard({ reason, index }: { reason: Reason; index: number }) {
  const { icon: Icon, title, description, image, focus, visual, span } = reason

  if (!image) {
    return (
      <InView
        reveal
        className={cn(cardInset, "flex min-h-80 flex-col justify-between gap-6 p-5 sm:p-6", span)}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <div className="space-y-5">
          <IconChip icon={Icon} className="bg-card" />
          {visual && (
            <div className="rounded-xl bg-card p-3" aria-hidden>
              {visual}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{description}</p>
        </div>
      </InView>
    )
  }

  return (
    <InView
      reveal
      className={cn("group relative isolate flex min-h-80 overflow-hidden rounded-2xl bg-[#06060a] text-white", span)}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="(min-width: 1024px) 66vw, (min-width: 768px) 50vw, 100vw"
        className={cn(
          "-z-10 object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]",
          focus
        )}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/35 via-45% to-transparent" />

      <div className="mt-auto max-w-md p-5 sm:p-6">
        <span className="grid size-9 place-items-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
          <Icon className="size-4" aria-hidden />
        </span>
        <h3 className="mt-4 font-medium">{title}</h3>
        <p className="mt-1.5 text-sm text-pretty text-white/75">{description}</p>
      </div>
    </InView>
  )
}

export function Why() {
  return (
    <Section id="why">
      <SectionHeading eyebrow="Why this" title="Why this instead of the big ones" />

      <div className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-2 md:auto-rows-[minmax(20rem,auto)] lg:grid-cols-3">
        {REASONS.map((reason, i) => (
          <ReasonCard key={reason.title} reason={reason} index={i} />
        ))}
      </div>
    </Section>
  )
}
