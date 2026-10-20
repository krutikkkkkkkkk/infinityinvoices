import { HugeiconsIcon } from "@hugeicons/react"
import type { Wallet01Icon } from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Icon = typeof Wallet01Icon

export function IconChip({ icon, className }: { icon: Icon; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground ring-1 ring-border/60",
        className
      )}
      aria-hidden
    >
      <HugeiconsIcon icon={icon} size={16} />
    </span>
  )
}

export function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: Icon
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
}) {
  return (
    <Card className="h-full gap-0 p-4 sm:p-5">
      <CardContent className="flex h-full flex-col px-0">
        <div className="flex min-w-0 items-center gap-2.5">
          <IconChip icon={icon} />
          <span className="truncate text-sm font-medium">{label}</span>
        </div>
        <p className="mt-4 truncate text-2xl font-semibold tracking-tight tabular-nums sm:mt-5 sm:text-[28px]">
          {value}
        </p>
        {hint && <p className="mt-2 truncate text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

export function StatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4", className)}>{children}</div>
}
