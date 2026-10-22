import Link from "next/link"
import { APP_URL, SUPPORT_EMAIL } from "@/lib/config"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#use-cases", label: "Use cases" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: `${APP_URL}/auth/sign-up`, label: "Sign up" },
      { href: `${APP_URL}/dashboard`, label: "Log in" },
      { href: `${APP_URL}/pricing`, label: "Plans" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="px-3 pt-4 pb-3 sm:px-4">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="grid gap-10 px-5 pt-12 sm:px-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">
              <img src="/logo.svg" alt="" className="h-7 w-7" />
              Infinity Invoice
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Invoices and quotations for freelancers and small businesses, with UPI, GST and multi-currency built in.
            </p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-4 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground">
              {SUPPORT_EMAIL}
            </a>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium">{column.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="transition-colors hover:text-foreground">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div aria-hidden className="mt-10 overflow-hidden px-5 sm:px-10">
          <p className="translate-y-[22%] text-center font-heading text-[23vw] leading-none font-bold tracking-tight text-primary select-none sm:text-[13rem]">
            Infinity
          </p>
        </div>

        <div className="border-t border-border/60">
          <p className="px-5 py-5 text-center text-xs text-muted-foreground sm:px-10">
            © {new Date().getFullYear()} Infinity Invoice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
