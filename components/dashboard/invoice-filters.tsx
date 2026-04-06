"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InvoiceFiltersProps {
  status: string
  search: string
  from: string
  to: string
  sort: string
  order: string
  tax: string
}

export function InvoiceFilters({ status, search, from, to, sort, order, tax }: InvoiceFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(search)

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()

      const current = { status, search: searchValue, from, to, sort, order, tax, ...updates }

      // Reset to page 1 on filter change
      if (current.status && current.status !== "all") params.set("status", current.status)
      if (current.search) params.set("search", current.search)
      if (current.from) params.set("from", current.from)
      if (current.to) params.set("to", current.to)
      if (current.sort && current.sort !== "created_at") params.set("sort", current.sort)
      if (current.order && current.order !== "desc") params.set("order", current.order)
      if (current.tax && current.tax !== "all") params.set("tax", current.tax)

      const qs = params.toString()
      startTransition(() => {
        router.push(`${pathname}${qs ? `?${qs}` : ""}`)
      })
    },
    [status, searchValue, from, to, sort, order, pathname, router]
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

  const hasFilters = status !== "all" || tax !== "all" || search || from || to

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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">From:</span>
          <Input
            type="date"
            value={from}
            onChange={(e) => updateFilters({ from: e.target.value })}
            className="w-[160px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">To:</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => updateFilters({ to: e.target.value })}
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
