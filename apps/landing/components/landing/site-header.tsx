import Link from "next/link"
import { Github, Star } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { APP_URL, GITHUB_URL } from "@/lib/config"
import { formatStars, getGithubStars } from "@/lib/github"
import { ThemeToggle } from "./theme-toggle"
import { button } from "./ui"

const NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#open-source", label: "Open source" },
  { href: "/#faq", label: "FAQ" },
]

export async function SiteHeader() {
  const stars = await getGithubStars()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">
          <img src="/logo.svg" alt="" className="h-7 w-7" />
          Infinity Invoice
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className={cn(button.ghost, "h-8 px-3.5 text-[13px] text-muted-foreground")}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={GITHUB_URL}
            aria-label={stars === null ? "GitHub" : `Star on GitHub, ${stars.toLocaleString("en-US")} stars`}
            className={cn(button.outline, "hidden h-9 gap-1.5 px-3 text-[13px] sm:inline-flex")}
          >
            <Github className="size-4" aria-hidden />
            {stars !== null && (
              <>
                <Star className="size-3.5 fill-current text-amber-500" aria-hidden />
                <span className="tabular-nums">{formatStars(stars)}</span>
              </>
            )}
          </a>
          <ThemeToggle />
          <a href={`${APP_URL}/dashboard`} className={cn(button.outline, "hidden h-9 px-4 sm:inline-flex")}>
            Log in
          </a>
          <a href={`${APP_URL}/auth/sign-up`} className={cn(button.brand, "h-9 px-4")}>
            Get started
          </a>
        </div>
      </div>
    </header>
  )
}
