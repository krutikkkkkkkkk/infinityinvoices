"use client"

// Dashboard header component
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@supabase/supabase-js"
import { HugeiconsIcon } from "@hugeicons/react"
import { InvoiceIcon, Logout03Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function DashboardHeader({ user }: { user: User }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <HugeiconsIcon icon={InvoiceIcon} size={20} />
            <span>Infinity Invoice</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link
              href="/dashboard"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/invoices"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Invoices
            </Link>
            <Link
              href="/dashboard/quotations"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Quotations
            </Link>
            <Link
              href="/dashboard/clients"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Clients
            </Link>
            <Link
              href="/dashboard/products"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Products
            </Link>
            <Link
              href="/dashboard/usage"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Usage
            </Link>
            <Link
              href="/dashboard/pricing"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <HugeiconsIcon icon={UserIcon} size={16} />
                <span className="hidden sm:inline-block max-w-[150px] truncate">
                  {user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/pricing" className="flex items-center gap-2">
                  Upgrade
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center gap-2">
                  <HugeiconsIcon icon={Settings01Icon} size={16} />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive gap-2">
                <HugeiconsIcon icon={Logout03Icon} size={16} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
