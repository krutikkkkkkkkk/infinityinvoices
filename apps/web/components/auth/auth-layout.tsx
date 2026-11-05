import Image from "next/image"
import Link from "next/link"
import { CheckIcon } from "lucide-react"

const HIGHLIGHTS = [
  "Professional invoice templates with your logo",
  "Download as PDF or share a secure link",
  "Email invoices straight to your clients",
]

function BrandLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <img src="/brand-logo.svg" alt="Infinity Invoice" className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg" />
      <span className="text-base sm:text-xl font-bold">InfinityInvoice</span>
    </Link>
  )
}

/**
 * Two columns from lg up: a brand panel on the left and the page's form on the right.
 * Below lg the brand panel is hidden and the form column stands alone, with the logo above it.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-zinc-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-10">
        <Image
          src="/images/freelancer-film.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

        <BrandLink className="relative" />

        <div className="relative max-w-md space-y-6">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-balance">
            Send polished invoices in minutes, not hours.
          </h2>
          <ul className="space-y-3 text-sm text-white/80">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <CheckIcon className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form column */}
      <div className="flex min-h-svh flex-col items-center justify-between gap-4 p-4 sm:gap-6 sm:p-6 md:p-10">
        {/* Header Navigation */}
        <div className="flex w-full items-center justify-between">
          <div></div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>

        <div className="w-full max-w-sm px-0">
          {/* Logo: the brand panel carries it on large screens */}
          <div className="mb-6 flex justify-center sm:mb-8 lg:hidden">
            <BrandLink />
          </div>

          {/* Content */}
          <div className="px-2 sm:px-0">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs sm:text-xs text-muted-foreground px-2">
          <p className="break-words">
            Simplify your invoicing workflow — {" "}
            <Link href="https://infinitylinkage.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors whitespace-nowrap">
              Developed by infinitylinkage
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
