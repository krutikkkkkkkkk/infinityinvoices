import { Skeleton } from "@/components/ui/skeleton"
import { TableCardSkeleton } from "@/components/dashboard/overview-skeletons"

// Generic page skeleton shown instantly while any dashboard route loads.
export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <TableCardSkeleton rows={6} />
    </div>
  )
}
