"use client"

import { Fragment, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CommandMenu } from "@/components/dashboard/command-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun01Icon, Moon02Icon, ComputerIcon } from "@hugeicons/core-free-icons"

const pageTitles: Record<string, string> = {
  "/dashboard/invoices": "Invoices",
  "/dashboard/quotations": "Quotations",
  "/dashboard/presets": "Invoice Presets",
  "/dashboard/clients": "Clients",
  "/dashboard/products": "Products",
  "/dashboard/plan": "Plan & usage",
  "/dashboard/settings": "Settings",
  "/dashboard/bug-report": "Report Bug",
  "/dashboard/tools/currency-converter": "Currency Converter",
}

// Segments that exist only as path prefixes (no page of their own) are shown but not linked.
const NON_PAGE_SEGMENTS = new Set(["/dashboard/documents", "/dashboard/tools"])

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="size-8" />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-9" aria-label="Change theme">
          <HugeiconsIcon icon={resolvedTheme === "dark" ? Moon02Icon : Sun01Icon} size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <HugeiconsIcon icon={Sun01Icon} size={14} /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <HugeiconsIcon icon={Moon02Icon} size={14} /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <HugeiconsIcon icon={ComputerIcon} size={14} /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function useBreadcrumbs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length <= 1) return []

  return segments.slice(1).map((segment, index) => {
    const href = "/" + segments.slice(0, index + 2).join("/")
    let label = pageTitles[href] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

    if (UUID_RE.test(segment)) label = "Details"
    if (segment === "new") {
      const type = searchParams.get("type")
      label = type === "quotation" ? "New quotation" : type === "invoice" ? "New invoice" : "New"
    }

    return {
      href,
      label,
      isLast: index === segments.length - 2,
      linkable: !NON_PAGE_SEGMENTS.has(href),
    }
  })
}

export function DashboardTopBar() {
  const breadcrumbs = useBreadcrumbs()

  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 bg-background/85 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="mr-1 h-4!" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap text-xs sm:text-sm">
          <BreadcrumbItem className={breadcrumbs.length > 1 ? "hidden sm:inline-flex" : undefined}>
            {breadcrumbs.length === 0 ? (
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {breadcrumbs.map((crumb, i) => (
            <Fragment key={crumb.href}>
              <BreadcrumbSeparator className={i === 0 && breadcrumbs.length > 1 ? "hidden sm:inline-flex" : undefined} />
              <BreadcrumbItem className="min-w-0">
                {crumb.isLast ? (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                ) : crumb.linkable ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground">{crumb.label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <CommandMenu />
      <ThemeToggle />
    </header>
  )
}
