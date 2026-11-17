import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileNotFoundIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "Page not found - Infinity Invoices",
}

/**
 * Catches every unmatched URL outside the dashboard (which has its own not-found inside the app shell),
 * including shared invoice links whose token is wrong or revoked. The visitor may be a signed-out client,
 * so the copy stays neutral and the only action is "/", which routes to the dashboard or the login page.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-2 bg-background p-4 text-foreground">
      <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">
        <img src="/logo.svg" alt="" className="size-7 rounded-lg" />
        Infinity Invoices
      </Link>

      <Empty className="max-w-xl flex-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={FileNotFoundIcon} />
          </EmptyMedia>
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Error 404</p>
          <EmptyTitle className="font-heading text-2xl">Page not found</EmptyTitle>
          <EmptyDescription>
            This page doesn&apos;t exist, or the link is no longer active. If someone sent you this link, ask them to
            share it again.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">Go to Infinity Invoices</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
