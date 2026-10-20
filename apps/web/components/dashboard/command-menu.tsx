"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  Add01Icon,
  Bug01Icon,
  ComputerIcon,
  ExchangeIcon,
  FileValidationIcon,
  Home01Icon,
  Invoice01Icon,
  InvoiceIcon,
  Moon02Icon,
  PackageIcon,
  Search01Icon,
  Settings01Icon,
  Sun01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

type Item = {
  id: string
  group: string
  label: string
  icon: typeof Home01Icon
  keywords?: string
  run: () => void
}

export function CommandMenu() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const [modKey, setModKey] = useState("⌘")

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setModKey("Ctrl")
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const go = useCallback((href: string) => () => router.push(href), [router])

  const items = useMemo<Item[]>(() => {
    const base: Item[] = [
      { id: "new-invoice", group: "Create", label: "New invoice", icon: Add01Icon, keywords: "create bill", run: go("/dashboard/documents/new?type=invoice") },
      { id: "new-quote", group: "Create", label: "New quotation", icon: Add01Icon, keywords: "create quote estimate", run: go("/dashboard/documents/new?type=quotation") },
      { id: "dashboard", group: "Go to", label: "Dashboard", icon: Home01Icon, keywords: "home overview", run: go("/dashboard") },
      { id: "invoices", group: "Go to", label: "Invoices", icon: Invoice01Icon, run: go("/dashboard/invoices") },
      { id: "overdue", group: "Go to", label: "Overdue invoices", icon: Invoice01Icon, keywords: "late unpaid chase", run: go("/dashboard/invoices?status=overdue") },
      { id: "presets", group: "Go to", label: "Invoice presets", icon: InvoiceIcon, keywords: "templates", run: go("/dashboard/presets") },
      { id: "quotations", group: "Go to", label: "Quotations", icon: FileValidationIcon, keywords: "quotes estimates", run: go("/dashboard/quotations") },
      { id: "clients", group: "Go to", label: "Clients", icon: UserMultipleIcon, keywords: "customers contacts", run: go("/dashboard/clients") },
      { id: "products", group: "Go to", label: "Products", icon: PackageIcon, keywords: "items services catalog", run: go("/dashboard/products") },
      { id: "converter", group: "Go to", label: "Currency converter", icon: ExchangeIcon, keywords: "fx exchange rate", run: go("/dashboard/tools/currency-converter") },
      { id: "usage", group: "Go to", label: "Plan & usage", icon: Activity01Icon, keywords: "billing subscription pro upgrade limits pricing", run: go("/dashboard/plan") },
      { id: "settings", group: "Go to", label: "Settings", icon: Settings01Icon, keywords: "profile company bank upi", run: go("/dashboard/settings") },
      { id: "bug", group: "Go to", label: "Report a bug", icon: Bug01Icon, keywords: "feedback issue", run: go("/dashboard/bug-report") },
      { id: "theme-light", group: "Theme", label: "Light theme", icon: Sun01Icon, keywords: "appearance", run: () => setTheme("light") },
      { id: "theme-dark", group: "Theme", label: "Dark theme", icon: Moon02Icon, keywords: "appearance", run: () => setTheme("dark") },
      { id: "theme-system", group: "Theme", label: "System theme", icon: ComputerIcon, keywords: "appearance auto", run: () => setTheme("system") },
    ]

    const q = query.trim().toLowerCase()
    // Rank label matches above keyword-only matches ("over" → Overdue before Dashboard/overview).
    const score = (i: Item) => {
      const label = i.label.toLowerCase()
      if (label.startsWith(q)) return 3
      if (label.split(" ").some((w) => w.startsWith(q))) return 2
      if (label.includes(q)) return 1
      return `${i.keywords ?? ""} ${i.group}`.toLowerCase().includes(q) ? 0 : -1
    }
    const filtered = q
      ? base
          .map((item) => ({ item, s: score(item) }))
          .filter((x) => x.s >= 0)
          .sort((a, b) => b.s - a.s)
          .map((x) => x.item)
      : base

    // Free-text search goes last so Enter opens the best page match first.
    if (q) {
      filtered.push({
        id: "search-invoices",
        group: "Search",
        label: `Search invoices for “${query.trim()}”`,
        icon: Search01Icon,
        run: go(`/dashboard/invoices?search=${encodeURIComponent(query.trim())}`),
      })
    }
    // Keep groups contiguous (ordered by their best match) so arrow-key order matches what's on screen.
    const order = Array.from(new Set(filtered.map((i) => i.group)))
    return order.flatMap((g) => filtered.filter((i) => i.group === g))
  }, [query, go, setTheme])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active])

  const select = (item: Item | undefined) => {
    if (!item) return
    setOpen(false)
    setQuery("")
    item.run()
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      select(items[active])
    }
  }

  const groups = Array.from(new Set(items.map((i) => i.group)))

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="size-9 gap-2 px-0 text-muted-foreground sm:h-9 sm:w-60 sm:justify-start sm:px-3.5"
        aria-label="Open command menu"
      >
        <HugeiconsIcon icon={Search01Icon} size={14} />
        <span className="hidden flex-1 text-left font-normal sm:inline">Search or jump to…</span>
        <Kbd className="hidden sm:inline-flex">{modKey} K</Kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) setQuery("")
        }}
        title="Command menu"
        description="Jump to a page, create a document or change the theme"
        showCloseButton={false}
        className="top-[20%] translate-y-0 sm:max-w-lg"
      >
        <CommandInput
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Type a command or search…"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-menu-list"
          aria-activedescendant={items[active] ? `cmd-${items[active].id}` : undefined}
          className="h-11"
        />
        <CommandList ref={listRef} id="command-menu-list" role="listbox" className="max-h-[360px] p-1">
          {items.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
          {groups.map((group) => (
            <CommandGroup key={group} role="group" aria-label={group}>
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{group}</p>
              {items.map((item, index) =>
                item.group !== group ? null : (
                  <CommandItem
                    key={item.id}
                    id={`cmd-${item.id}`}
                    role="option"
                    aria-selected={index === active}
                    data-index={index}
                    onMouseMove={() => setActive(index)}
                    onClick={() => select(item)}
                    className={cn("cursor-pointer", index === active && "bg-accent text-accent-foreground")}
                  >
                    <HugeiconsIcon icon={item.icon} size={16} className="text-muted-foreground" />
                    {item.label}
                    {index === active && <CommandShortcut>↵</CommandShortcut>}
                  </CommandItem>
                )
              )}
            </CommandGroup>
          ))}
        </CommandList>
        <div className="flex items-center gap-3 border-t px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
          <span className="flex items-center gap-1"><Kbd>esc</Kbd> close</span>
        </div>
      </CommandDialog>
    </>
  )
}
