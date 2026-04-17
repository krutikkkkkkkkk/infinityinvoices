"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useSubscription } from "@/hooks/use-subscription"
import { User } from "@supabase/supabase-js"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  InvoiceIcon,
  Logout03Icon,
  Settings01Icon,
  UserIcon,
  Home01Icon,
  Invoice01Icon,
  FileValidationIcon,
  UserMultipleIcon,
  PackageIcon,
  ChartLineData01Icon,
  CreditCardIcon,
  ExchangeIcon,
} from "@hugeicons/core-free-icons"
import { ChevronUp } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home01Icon },
  { href: "/dashboard/invoices", label: "Invoices", icon: Invoice01Icon },
  { href: "/dashboard/quotations", label: "Quotations", icon: FileValidationIcon },
  { href: "/dashboard/clients", label: "Clients", icon: UserMultipleIcon },
  { href: "/dashboard/products", label: "Products", icon: PackageIcon },
]

const toolsNavItems = [
  { href: "/dashboard/tools/currency-converter", label: "Currency Converter", icon: ExchangeIcon },
]

const accountNavItems = [
  { href: "/dashboard/usage", label: "Usage", icon: ChartLineData01Icon },
  { href: "/dashboard/pricing", label: "Pricing", icon: CreditCardIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Settings01Icon },
]

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isPro, isLifetime } = useSubscription()

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Infinity Invoice">
              <Link href="/dashboard">
                <img src="/brand-logo.svg" alt="Infinity Invoice" className="size-8 shrink-0 rounded-lg" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Infinity Invoice</span>
                  <span className="text-xs text-muted-foreground">
                    {isLifetime ? "Lifetime" : isPro ? "Pro" : "Free"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <HugeiconsIcon icon={item.icon} size={18} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <HugeiconsIcon icon={item.icon} size={18} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <HugeiconsIcon icon={item.icon} size={18} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isPro && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-medium text-primary mb-1">Upgrade to Pro</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Unlimited invoices & emails
                </p>
                <Link
                  href="/dashboard/pricing"
                  className="inline-flex h-7 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Upgrade
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={user.email || "Account"}>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <HugeiconsIcon icon={UserIcon} size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="text-sm font-medium truncate">
                      {user.email?.split("@")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side="top"
                align="start"
                sideOffset={8}
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.email?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "mt-1.5 text-[10px]",
                      isPro && "bg-chart-1/10 text-chart-1 border-chart-1/20"
                    )}
                  >
                    {isPro ? "Pro" : "Free"}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/usage">Usage & Billing</Link>
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
                      <Link href="/dashboard/pricing" className="text-primary">
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
