"use client"

import { useEffect } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, Refresh01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Empty className="mx-auto min-h-[60vh] max-w-xl">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
          <HugeiconsIcon icon={AlertCircleIcon} />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          We couldn&apos;t load this page. Your data is safe — this is usually a temporary connection issue.
          {error.digest && (
            <span className="mt-2 block font-mono text-xs text-muted-foreground">Ref: {error.digest}</span>
          )}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button onClick={reset}>
          <HugeiconsIcon icon={Refresh01Icon} size={16} data-icon="inline-start" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/bug-report">Report a bug</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
