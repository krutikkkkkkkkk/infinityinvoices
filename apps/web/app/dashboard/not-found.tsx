import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileNotFoundIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export default function DashboardNotFound() {
  return (
    <Empty className="mx-auto min-h-[60vh] max-w-xl">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={FileNotFoundIcon} />
        </EmptyMedia>
        <EmptyTitle>Not found</EmptyTitle>
        <EmptyDescription>
          This page or document doesn&apos;t exist, or it may have been deleted.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/invoices">View invoices</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
