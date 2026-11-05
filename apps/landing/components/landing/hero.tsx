import Image from "next/image"
import { Check, CircleCheckBig } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { APP_URL } from "@/lib/config"
import { formatUSD } from "./invoice-bits"
import { button, buttonSize } from "./ui"

const FACTS = ["MIT licensed", "No card to start", "Self-host or use ours"]

const LINES = [
  { item: "Website design", amount: 1800 },
  { item: "Brand refresh", amount: 600 },
]
const TOTAL = LINES.reduce((sum, line) => sum + line.amount, 0)

/**
 * A paid invoice on paper. Explicit light colours (not theme tokens) because it sits inside the
 * dark hero but should read as a printed document.
 */
function InvoiceCard() {
  return (
    <div className="rounded-2xl bg-white p-5 text-zinc-900 shadow-[0_30px_60px_-15px_rgb(0_0_0/0.6)] ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-semibold text-white">M</span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Mara Lind Studio</p>
            <p className="text-[11px] text-zinc-500">Billed to Northwind Coffee Co.</p>
          </div>
        </div>
        <div className="text-right leading-tight">
          <p className="text-[10px] font-medium tracking-[0.14em] text-zinc-400 uppercase">Invoice</p>
          <p className="text-xs font-medium tabular-nums">2026-032</p>
        </div>
      </div>

      <dl className="mt-5 space-y-2 text-xs">
        {LINES.map(({ item, amount }) => (
          <div key={item} className="flex justify-between gap-4">
            <dt className="text-zinc-600">{item}</dt>
            <dd className="tabular-nums">{formatUSD(amount)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-dashed border-zinc-200 pt-4">
        <div>
          <p className="text-[11px] text-zinc-500">Total</p>
          <p className="font-heading text-2xl font-semibold tabular-nums">{formatUSD(TOTAL)}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/15">
          <CircleCheckBig className="size-3.5" aria-hidden />
          Paid
        </span>
      </div>
    </div>
  )
}

/** The notification that arrives a moment after the page loads. */
function PaymentToast() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-black/45 py-2.5 pr-4 pl-2.5 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md">
      <span className="grid size-8 place-items-center rounded-full bg-emerald-500/90">
        <Check className="size-4" aria-hidden />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-medium">Payment received</p>
        <p className="text-xs text-white/70 tabular-nums">Northwind Coffee Co. · {formatUSD(TOTAL)}</p>
      </div>
    </div>
  )
}

/**
 * The right side of the hero: a freelancer getting paid, faded into the dark stage on its inner edge
 * (left on desktop, top on mobile). On desktop the invoice overlaps the seam to tie the halves together.
 */
function Artwork() {
  return (
    <div className="relative min-h-136 sm:min-h-144 lg:min-h-0">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/freelancer-film.jpg"
          alt="A freelancer seen from behind, carrying a laptop through a sunlit doorway as letters drift around them"
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover object-[50%_40%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-[#06060a] via-transparent via-30% to-[#06060a]/70 lg:bg-linear-to-r lg:via-[#06060a]/20 lg:via-30% lg:to-transparent"
        />
      </div>

      <div className="animate-in fade-in-0 slide-in-from-top-2 absolute top-8 right-5 hidden delay-1000 duration-500 fill-mode-both sm:block lg:top-12 lg:right-10">
        <PaymentToast />
      </div>

      <div className="animate-in fade-in-0 slide-in-from-bottom-4 absolute right-5 bottom-6 left-5 delay-500 duration-700 fill-mode-both sm:right-auto sm:left-10 sm:w-80 lg:bottom-12 lg:-left-16">
        <InvoiceCard />
      </div>
    </div>
  )
}

/** A word wrapped in a design-tool selection box, as if someone is editing the headline. */
function Selected({ children }: { children: string }) {
  const handle = "absolute size-1.5 border border-white/80 bg-[#06060a]"
  return (
    <span className="relative inline-block px-[0.12em]">
      <span
        aria-hidden
        className="animate-in fade-in-0 zoom-in-95 absolute inset-x-0 inset-y-[0.08em] border border-white/45 bg-white/6 delay-700 duration-500 fill-mode-both"
      >
        <span className={cn(handle, "-top-0.75 -left-0.75")} />
        <span className={cn(handle, "-top-0.75 -right-0.75")} />
        <span className={cn(handle, "-bottom-0.75 -left-0.75")} />
        <span className={cn(handle, "-right-0.75 -bottom-0.75")} />
      </span>
      <span className="relative">{children}</span>
    </span>
  )
}

export function Hero() {
  return (
    <section
      id="top"
      className="dark relative mb-12 grid overflow-hidden bg-[#06060a] text-white sm:mb-16 lg:min-h-[calc(100svh-3.5rem)] lg:grid-cols-[1.1fr_1fr]"
    >
      {/* On desktop the text column starts roughly in line with the header logo. */}
      <div className="relative flex w-full flex-col justify-center px-5 py-14 sm:px-10 sm:py-20 lg:ml-auto lg:max-w-152 lg:pr-8 lg:pl-6">
        <span className="animate-in fade-in-0 slide-in-from-bottom-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-white/80 uppercase ring-1 ring-white/20 duration-700">
          Invoicing made easy
        </span>
        <h1 className="animate-in fade-in-0 slide-in-from-bottom-3 mt-6 font-heading text-[2.6rem] leading-[1.04] font-semibold tracking-[-0.03em] text-balance duration-700 sm:text-6xl lg:text-[3.25rem] xl:text-[3.5rem]">
          Send the <Selected>invoice</Selected>.
          <span className="block text-white/60">Skip the accounting software.</span>
        </h1>
        <p className="animate-in fade-in-0 slide-in-from-bottom-3 mt-6 max-w-md text-pretty text-white/70 delay-100 duration-700 fill-mode-both sm:text-[17px]">
          Infinity Invoice does one thing well: clean invoices you can send in 30 seconds and get paid from. Free for
          5 a month.
        </p>
        <div className="animate-in fade-in-0 slide-in-from-bottom-3 mt-9 flex flex-col gap-3 delay-200 duration-700 fill-mode-both sm:flex-row">
          <a href={`${APP_URL}/auth/sign-up`} className={cn(button.brand, buttonSize.lg)}>
            Create your first invoice
          </a>
          <a href="#how-it-works" className={cn(button.base, buttonSize.lg, "text-white ring-1 ring-white/40 hover:bg-white/10")}>
            See how it works
          </a>
        </div>

        <ul className="animate-in fade-in-0 mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70 delay-300 duration-700 fill-mode-both">
          {FACTS.map((fact) => (
            <li key={fact} className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400" aria-hidden />
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <Artwork />
    </section>
  )
}
