"use client"

import Link from "next/link"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@infinity/ui/lib/utils"
import { APP_URL } from "@/lib/config"
import { button, buttonSize } from "./ui"

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
]

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()

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
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className={cn(button.outline, buttonSize.icon)}
          >
            <Sun className="hidden size-4 dark:block" />
            <Moon className="size-4 dark:hidden" />
          </button>
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
