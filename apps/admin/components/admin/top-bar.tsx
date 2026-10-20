"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { ComputerIcon, Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons"
import { NAV_ITEMS, isNavActive } from "@/lib/nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="size-9" />

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

export function AdminTopBar() {
  const pathname = usePathname()
  const current = NAV_ITEMS.find((item) => isNavActive(pathname, item.href))

  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 bg-background/85 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="mr-1 h-4!" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{current?.label ?? "Admin"}</span>
      <ThemeToggle />
    </header>
  )
}
