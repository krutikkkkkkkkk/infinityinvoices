"use client"

import { useState } from "react"
import { X } from "lucide-react"
import Link from "next/link"

export function GitHubBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <span className="text-xs sm:text-sm font-medium text-slate-300">
          Infinity Invoices is open source!
        </span>
        <Link
          href="https://github.com/krutikkkkkkkkk/infinityinvoices"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm font-semibold text-white hover:text-slate-100 transition-colors whitespace-nowrap"
        >
          Star us on GitHub ⭐
        </Link>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors p-1"
        aria-label="Close banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
