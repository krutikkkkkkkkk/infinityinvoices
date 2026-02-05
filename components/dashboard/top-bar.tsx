"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/invoices": "Invoices",
  "/dashboard/quotations": "Quotations",
  "/dashboard/clients": "Clients",
  "/dashboard/products": "Products",
  "/dashboard/usage": "Usage",
  "/dashboard/pricing": "Pricing",
  "/dashboard/settings": "Settings",
}

export function DashboardTopBar() {
  const pathname = usePathname()

  const getPageTitle = () => {
    // Check for exact match first
    if (pageTitles[pathname]) return pageTitles[pathname]

    // Check for nested routes
    if (pathname.includes("/documents/new")) return "New Document"
    if (pathname.includes("/documents/") && pathname.includes("/edit")) return "Edit Document"
    if (pathname.includes("/invoices")) return "Invoices"
    if (pathname.includes("/quotations")) return "Quotations"
    if (pathname.includes("/clients")) return "Clients"
    if (pathname.includes("/products")) return "Products"

    return "Dashboard"
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length <= 1) return null

    return segments.slice(1).map((segment, index) => {
      const href = "/" + segments.slice(0, index + 2).join("/")
      const label = pageTitles[href] || segment.charAt(0).toUpperCase() + segment.slice(1)
      const isLast = index === segments.length - 2
      return { href, label, isLast }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="mr-2 !h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs && breadcrumbs.length > 0 && breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
