import { ArrowRight } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { APP_URL } from "@/lib/config"
import { LIFETIME_PRICE } from "@/lib/plans"
import { InView } from "./motion"
import { button, buttonSize } from "./ui"

export function FinalCta() {
  return (
    <section id="get-started" className="px-3 sm:px-4">
      <InView
        reveal
        className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-linear-to-b from-primary/15 via-primary/5 to-card px-5 py-16 text-center sm:px-10 sm:py-24"
      >
        <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Your next invoice could take 30 seconds.
        </h2>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={`${APP_URL}/auth/sign-up`} className={cn(button.brand, buttonSize.lg, "group")}>
            Create it free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a href={`${APP_URL}/dashboard/plan`} className={cn(button.outline, buttonSize.lg)}>
            Get lifetime for {LIFETIME_PRICE}
          </a>
        </div>
      </InView>
    </section>
  )
}
