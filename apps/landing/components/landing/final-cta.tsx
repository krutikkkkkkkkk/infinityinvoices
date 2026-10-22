import { ArrowRight } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { APP_URL } from "@/lib/config"
import { HeroInvoice } from "./hero-invoice"
import { InView } from "./motion"
import { Eyebrow } from "./section"
import { button, buttonSize } from "./ui"

export function FinalCta() {
  return (
    <section className="px-3 sm:px-4">
      <InView
        reveal
        className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-card lg:grid-cols-2"
      >
        <div className="order-last flex items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 py-10 sm:px-10 lg:order-none">
          <HeroInvoice />
        </div>
        <div className="flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-16">
          <Eyebrow>Get started</Eyebrow>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Your next invoice could be out the door in minutes
          </h2>
          <p className="mt-4 max-w-md text-pretty text-muted-foreground">
            Create a free account, add your logo and UPI details, and send something you are proud of. Upgrade only when you
            outgrow the free plan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={`${APP_URL}/auth/sign-up`} className={cn(button.brand, buttonSize.lg, "group")}>
              Create your free account
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href={`${APP_URL}/dashboard`} className={cn(button.outline, buttonSize.lg)}>
              Log in
            </a>
          </div>
        </div>
      </InView>
    </section>
  )
}
