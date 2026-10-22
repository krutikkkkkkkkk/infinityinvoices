import { ArrowRight } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { APP_URL } from "@/lib/config"
import { DashboardMockup } from "./dashboard-mockup"
import { Eyebrow } from "./section"
import { button, buttonSize } from "./ui"

export function Hero() {
  return (
    <section className="px-3 pt-3 sm:px-4">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="mx-auto max-w-2xl px-5 pt-14 text-center sm:pt-20">
          <Eyebrow className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700">Invoicing for freelancers & small businesses</Eyebrow>
          <h1 className="animate-in fade-in-0 slide-in-from-bottom-3 mt-5 font-heading text-4xl font-semibold tracking-tight text-balance duration-700 sm:text-[52px] sm:leading-[1.08]">
            Send invoices that get paid faster
          </h1>
          <p className="animate-in fade-in-0 slide-in-from-bottom-3 mx-auto mt-5 max-w-xl text-pretty text-muted-foreground delay-100 duration-700 fill-mode-both sm:text-lg">
            Create GST-ready invoices and quotations in minutes. Add a UPI QR code, send them by email, and let Infinity
            Invoice handle the totals, reminders and recurring billing.
          </p>
          <div className="animate-in fade-in-0 slide-in-from-bottom-3 mt-8 flex flex-col items-center justify-center gap-3 delay-200 duration-700 fill-mode-both sm:flex-row">
            <a href={`${APP_URL}/auth/sign-up`} className={cn(button.brand, buttonSize.lg, "group w-full sm:w-auto")}>
              Start for free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#features" className={cn(button.outline, buttonSize.lg, "w-full sm:w-auto")}>
              See how it works
            </a>
          </div>
          <p className="animate-in fade-in-0 mt-4 text-xs text-muted-foreground delay-300 duration-700 fill-mode-both">
            Free plan · No card needed · 6 templates included
          </p>
        </div>

        <div className="relative mt-12 px-4 sm:mt-16 sm:px-10">
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 top-10 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent"
          />
          <p
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 text-center font-heading text-[22vw] leading-none font-bold tracking-tight text-primary/[0.06] select-none lg:text-[15rem]"
          >
            INFINITY
          </p>
          <div className="animate-in fade-in-0 slide-in-from-bottom-6 relative mx-auto max-w-4xl translate-y-6 delay-300 duration-1000 fill-mode-both">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
