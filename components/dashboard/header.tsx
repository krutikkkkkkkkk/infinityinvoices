"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@supabase/supabase-js"
import { HugeiconsIcon } from "@hugeicons/react"
import { InvoiceIcon, Logout03Icon, Settings01Icon, UserIcon, Menu01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useSubscription } from "@/hooks/use-subscription"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/quotations", label: "Quotations" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/usage", label: "Usage" },
  { href: "/dashboard/pricing", label: "Pricing" },
]

export function DashboardHeader({ user }: { user: User }) {
  const router = useRouter()
  const pathname = usePathname()
  const { subscription, isPro } = useSubscription()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon icon={InvoiceIcon} size={18} />
            </div>
            <span className="hidden sm:inline-block">Infinity Invoice</span>
          </Link>
        </div>
          
        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Usage, Upgrade, User */}
        <div className="flex items-center gap-3">
          {/* Usage Badge - Desktop */}
          <Link href="/dashboard/usage" className="hidden md:block">
            <Badge 
              variant={isPro ? "default" : "secondary"} 
              className={cn(
                "cursor-pointer transition-colors",
                isPro 
                  ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" 
                  : "hover:bg-accent"
              )}
            >
              {isPro ? "Pro Plan" : "Free Plan"}
            </Badge>
          </Link>

          {/* Upgrade Button - Only for Free users */}
          {!isPro && (
            <Button asChild size="sm" className="hidden sm:flex">
              <Link href="/dashboard/pricing">Upgrade</Link>
            </Button>
          )}

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <HugeiconsIcon icon={UserIcon} size={16} />
                </div>
                <span className="hidden lg:inline-block max-w-[120px] truncate text-sm">
                  {user.email?.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.email?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/usage" className="flex items-center gap-2">
                  Usage & Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center gap-2">
                  <HugeiconsIcon icon={Settings01Icon} size={16} />
                  Settings
                </Link>
              </DropdownMenuItem>
              {!isPro && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/pricing" className="flex items-center gap-2 text-primary">
                      Upgrade to Pro
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive gap-2">
                <HugeiconsIcon icon={Logout03Icon} size={16} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <HugeiconsIcon icon={Menu01Icon} size={20} />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-2 border-t" />
                <Link
                  href="/dashboard/usage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
                >
                  Usage & Billing
                </Link>
                <Link
                  href="/dashboard/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
                >
                  Pricing
                </Link>
                {!isPro && (
                  <Button asChild className="mt-4 mx-4">
                    <Link href="/dashboard/pricing" onClick={() => setMobileMenuOpen(false)}>
                      Upgrade to Pro
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
