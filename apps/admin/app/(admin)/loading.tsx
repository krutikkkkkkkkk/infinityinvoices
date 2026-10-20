import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-0 p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="mt-5 h-8 w-20" />
          </Card>
        ))}
      </div>
      <Card className="gap-3 p-5">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    </div>
  )
}
