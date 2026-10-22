"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback, useMemo, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DATE_PRESETS, getDatePresets } from "@/lib/date-range"

interface InvoiceFiltersProps {
  status: string
  search: string
  /** Active date preset key, or "" for explicit from/to dates. */
  range: string
  /** Resolved dates — from the preset when one is active. */
  from: string
  to: string
  sort: string
  order: string
  /** Omit to hide the tax filter (e.g. quotations). */
  tax?: string
  /** Month (1-12) the user's financial year starts, for the FY presets. */
  fyStartMonth?: number
}

export function InvoiceFilters({ status, search, range, from, to, sort, order, tax, fyStartMonth = 4 }: InvoiceFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(search)
  const presets = useMemo(() => getDatePresets(fyStartMonth), [fyStartMonth])
  const dateValue = range || (from || to ? "custom" : "all")

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()

      const current = { status, search: searchValue, range, from, to, sort, order, tax, ...updates }

      // Reset to page 1 on filter change
      if (current.status && current.status !== "all") params.set("status", current.status)
      if (current.search) params.set("search", current.search)
      // A preset stays relative to today, so store its key rather than its dates
      if (current.range) params.set("range", current.range)
      else {
        if (current.from) params.set("from", current.from)
        if (current.to) params.set("to", current.to)
      }
      if (current.sort && current.sort !== "created_at") params.set("sort", current.sort)
      if (current.order && current.order !== "desc") params.set("order", current.order)
      if (current.tax && current.tax !== "all") params.set("tax", current.tax)

      const qs = params.toString()
      startTransition(() => {
        router.push(`${pathname}${qs ? `?${qs}` : ""}`)
      })
    },
    [status, searchValue, range, from, to, sort, order, tax, pathname, router]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchValue })
  }

  const clearFilters = () => {
    setSearchValue("")
    startTransition(() => {
      router.push(pathname)
    })
  }

  const handleDatePreset = (value: string) => {
    if (value === "all") updateFilters({ range: "", from: "", to: "" })
    else updateFilters({ range: value, from: "", to: "" })
  }

  // Editing a date turns the active preset into a custom range starting from its dates
  const handleDateChange = (key: "from" | "to", value: string) => {
    updateFilters({ range: "", [key]: value })
  }

  const hasFilters = status !== "all" || (tax ?? "all") !== "all" || search || from || to

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <Input
            placeholder="Search by number or client..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
            Search
          </Button>
        </form>

        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(value) => updateFilters({ status: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Tax Filter */}
        {tax !== undefined && (
        <Select
          value={tax}
          onValueChange={(value) => updateFilters({ tax: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tax" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Invoices</SelectItem>
            <SelectItem value="taxed">With Tax</SelectItem>
            <SelectItem value="no-tax">No Tax</SelectItem>
          </SelectContent>
        </Select>
        )}

        {/* Sort */}
        <Select
          value={`${sort}-${order}`}
          onValueChange={(value) => {
            const [s, o] = value.split("-")
            updateFilters({ sort: s, order: o })
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Newest First</SelectItem>
            <SelectItem value="created_at-asc">Oldest First</SelectItem>
            <SelectItem value="grand_total-desc">Amount: High-Low</SelectItem>
            <SelectItem value="grand_total-asc">Amount: Low-High</SelectItem>
            <SelectItem value="issue_date-desc">Date: Newest</SelectItem>
            <SelectItem value="issue_date-asc">Date: Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Select value={dateValue} onValueChange={handleDatePreset}>
          <SelectTrigger className="w-[180px]" aria-label="Date range">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            {DATE_PRESETS.map((key) => (
              <SelectItem key={key} value={key}>
                {presets[key].label}
              </SelectItem>
            ))}
            <SelectItem value="custom" disabled>
              Custom range
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">From:</span>
          <Input
            type="date"
            value={from}
            onChange={(e) => handleDateChange("from", e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">To:</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => handleDateChange("to", e.target.value)}
            className="w-[160px]"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
