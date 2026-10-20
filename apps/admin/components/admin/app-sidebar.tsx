"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Logout03Icon, Shield01Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons"
import { createClient } from "@/lib/supabase/client"
import { NAV_ITEMS, isNavActive } from "@/lib/nav"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar({ email, role, appUrl }: { email: string; role: string; appUrl: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Infinity Invoice Admin">
              <Link href="/">
                <img src="/brand-logo.svg" alt="" className="size-8 shrink-0 rounded-lg" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Infinity Invoice</span>
                  <span className="text-xs text-muted-foreground">Admin console</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isNavActive(pathname, item.href)} tooltip={item.label}>
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
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={email}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <HugeiconsIcon icon={Shield01Icon} size={16} />
                  </span>
                  <div className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">{email}</span>
                    <span className="truncate text-xs capitalize text-muted-foreground">{role.replace(/_/g, " ")}</span>
                  </div>
                  <HugeiconsIcon icon={UnfoldMoreIcon} size={14} className="ml-auto text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl"
              >
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href={appUrl}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                    Back to app
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleSignOut}>
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
