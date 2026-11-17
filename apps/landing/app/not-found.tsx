import type { Metadata } from "next"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { formatUSD } from "@/components/landing/invoice-bits"
import { Eyebrow } from "@/components/landing/section"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Pill, button, buttonSize, cardInset } from "@/components/landing/ui"
import { APP_URL, SUPPORT_EMAIL } from "@/lib/config"

export const metadata: Metadata = {
  title: "Page not found - Infinity Invoices",
  description: "This page doesn't exist. Head back to Infinity Invoices to create and send an invoice.",
  robots: { index: false, follow: true },
}

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: `mailto:${SUPPORT_EMAIL}`, label: "Contact support" },
]

/** The missing page, written up as an invoice with nothing to pay. Decorative: the text beside it says the same. */
function MissingInvoice() {
  return (
    <div aria-hidden className={cn(cardInset, "mx-auto w-full max-w-sm p-5 lg:rotate-2")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="" className="size-8 rounded-lg" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Infinity Invoices</p>
            <p className="text-[11px] text-muted-foreground">Billed to a lost visitor</p>
          </div>
        </div>
        <div className="text-right leading-tight">
          <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Invoice</p>
          <p className="text-xs font-medium tabular-nums">404</p>
        </div>
      </div>

      <dl className="mt-5 space-y-2 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">The page you asked for</dt>
          <dd>Missing</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Wrong turn fee</dt>
          <dd className="tabular-nums">{formatUSD(0)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-dashed border-border pt-4">
        <div>
          <p className="text-[11px] text-muted-foreground">Total due</p>
          <p className="font-heading text-2xl font-semibold tabular-nums">{formatUSD(0)}</p>
        </div>
        <Pill tone="critical">
          <AlertCircle className="size-3.5" />
          Not found
        </Pill>
      </div>
    </div>
  )
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex flex-1 flex-col px-3 pt-4 sm:px-4">
        <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 rounded-3xl border border-border/60 bg-card px-5 py-14 sm:px-10 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-in fade-in-0 slide-in-from-bottom-3 text-center duration-700 lg:text-left">
            <Eyebrow>Error 404</Eyebrow>
            <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              We can&apos;t find that page.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground sm:text-lg lg:mx-0">
              The link may be old, or the address may have a typo. Nothing is owed for the detour.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/" className={cn(button.brand, buttonSize.lg, "group")}>
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
                Back to home
              </Link>
              <a href={`${APP_URL}/auth/sign-up`} className={cn(button.outline, buttonSize.lg)}>
                Create an invoice
              </a>
            </div>

            <nav aria-label="Helpful links" className="mt-8">
              <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                {LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="underline-offset-4 transition-colors hover:text-foreground hover:underline">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="animate-in fade-in-0 slide-in-from-bottom-4 delay-150 duration-700 fill-mode-both">
            <MissingInvoice />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
