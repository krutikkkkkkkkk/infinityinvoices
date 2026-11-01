import { cn } from "@infinity/ui/lib/utils"
import { APP_URL } from "@/lib/config"
import { SilkWaves } from "./silk-waves"
import { button, buttonSize } from "./ui"

const FACTS = ["MIT licensed", "No card to start", "Self-host or use ours"]

/** Silk drifting across a dark stage, faded back on the left so the headline stays readable. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <SilkWaves />
      <div className="absolute inset-0 bg-linear-to-r from-[#06060a]/90 from-10% via-[#06060a]/55 via-40% to-transparent to-70%" />
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
        className="animate-in fade-in-0 zoom-in-95 absolute inset-x-0 inset-y-[0.08em] border border-white/45 bg-white/[0.06] delay-700 duration-500 fill-mode-both"
      >
        <span className={cn(handle, "-top-[3px] -left-[3px]")} />
        <span className={cn(handle, "-top-[3px] -right-[3px]")} />
        <span className={cn(handle, "-bottom-[3px] -left-[3px]")} />
        <span className={cn(handle, "-right-[3px] -bottom-[3px]")} />
      </span>
      <span className="relative">{children}</span>
    </span>
  )
}

export function Hero() {
  return (
    <section id="top" className="dark relative mb-12 overflow-hidden bg-[#06060a] text-white sm:mb-16">
      <Backdrop />
      <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl flex-col px-5 sm:px-10 lg:px-14">
        <div className="relative my-auto max-w-3xl py-12 sm:py-14">
          <span className="animate-in fade-in-0 slide-in-from-bottom-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-white/80 uppercase ring-1 ring-white/20 duration-700">
            Invoicing made easy
          </span>
          <h1 className="animate-in fade-in-0 slide-in-from-bottom-3 mt-6 font-heading text-[2.6rem] leading-[1.04] font-semibold tracking-[-0.03em] text-balance duration-700 sm:text-6xl lg:text-[4.25rem]">
            Send the <Selected>invoice</Selected>.
            <span className="block">Skip the accounting software.</span>
          </h1>
          <p className="animate-in fade-in-0 slide-in-from-bottom-3 mt-6 max-w-md text-pretty text-white/70 delay-100 duration-700 fill-mode-both sm:text-[17px]">
            Infinity Invoice does one thing well: clean invoices you can send in 30 seconds and get paid from. Free for
            5 a month.
          </p>
          <div className="animate-in fade-in-0 slide-in-from-bottom-3 mt-9 flex flex-col gap-3 delay-200 duration-700 fill-mode-both sm:flex-row">
            <a href="#how-it-works" className={cn(button.base, buttonSize.lg, "text-white ring-1 ring-white/40 hover:bg-white/10")}>
              See how it works
            </a>
            <a href={`${APP_URL}/auth/sign-up`} className={cn(button.brand, buttonSize.lg)}>
              Create your first invoice
            </a>
          </div>
        </div>

        <div className="relative pb-8 text-xs text-white/75">
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {FACTS.map((fact, i) => (
              <li key={fact} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden className="size-1 rounded-full bg-white/60" />}
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
