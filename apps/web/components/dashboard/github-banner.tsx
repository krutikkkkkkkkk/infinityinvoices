"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, StarIcon } from "@hugeicons/core-free-icons"

export const GITHUB_BANNER_COOKIE = "ii_github_banner_dismissed"

export function GitHubBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const dismiss = () => {
    setIsVisible(false)
    document.cookie = `${GITHUB_BANNER_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-3 py-1.5 text-xs sm:px-6 sm:text-sm">
      <p className="min-w-0 truncate text-muted-foreground">
        Infinity Invoices is open source.{" "}
        <a
          href="https://github.com/krutikkkkkkkkk/infinityinvoices"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
        >
          <HugeiconsIcon icon={StarIcon} size={12} aria-hidden />
          Star us on GitHub
        </a>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label="Dismiss open source banner"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={14} />
      </button>
    </div>
  )
}
