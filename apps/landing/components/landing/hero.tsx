import { ArrowRight, Github } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { APP_URL, GITHUB_URL } from "@/lib/config"
import { LIFETIME_PRICE } from "@/lib/plans"
import { InvoiceDocument } from "./invoice-document"
import { Eyebrow } from "./section"
import { button, buttonSize } from "./ui"

export function Hero() {
  return (
    <section className="px-3 pt-3 sm:px-4">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="mx-auto max-w-3xl px-5 pt-14 text-center sm:pt-20">
          <Eyebrow className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700">Open source invoicing for freelancers</Eyebrow>
          <h1 className="animate-in fade-in-0 slide-in-from-bottom-3 mt-5 font-heading text-4xl font-semibold tracking-tight text-balance duration-700 sm:text-[56px] sm:leading-[1.05]">
            Invoicing for people who send four invoices a month, not forty.
          </h1>
          <p className="animate-in fade-in-0 slide-in-from-bottom-3 mx-auto mt-5 max-w-xl text-pretty text-muted-foreground delay-100 duration-700 fill-mode-both sm:text-lg">
            Make a clean invoice in 30 seconds, email it to your client, get paid. No accounting suite, no per-seat pricing,
            no &ldquo;contact sales.&rdquo; Open source, {LIFETIME_PRICE} once.
          </p>
          <div className="animate-in fade-in-0 slide-in-from-bottom-3 mt-8 flex justify-center delay-200 duration-700 fill-mode-both">
            <a href={`${APP_URL}/auth/sign-up`} className={cn(button.brand, buttonSize.lg, "group w-full sm:w-auto")}>
              Create your first invoice
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
          <p className="animate-in fade-in-0 mt-4 text-sm text-muted-foreground delay-300 duration-700 fill-mode-both">
            Free for 5 invoices a month. No card.
          </p>
          <a
            href={GITHUB_URL}
            className="animate-in fade-in-0 mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors delay-300 duration-700 fill-mode-both hover:text-foreground"
          >
            <Github className="size-3.5" aria-hidden />
            MIT licensed on GitHub
          </a>
        </div>

        <div className="relative mt-12 px-4 sm:mt-16 sm:px-10">
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 top-16 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent"
          />
          <div className="animate-in fade-in-0 slide-in-from-bottom-6 relative translate-y-10 delay-300 duration-1000 fill-mode-both">
            <InvoiceDocument />
          </div>
        </div>
      </div>
    </section>
  )
}
