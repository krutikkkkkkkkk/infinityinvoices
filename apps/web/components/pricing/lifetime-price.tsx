import { LIFETIME, formatUsd } from "@/lib/plans"
import { cn } from "@/lib/utils"

/** The one-time alternative to monthly Pro: "or $29 once for lifetime access". */
export function LifetimePrice({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      or <span className="font-medium text-foreground tabular-nums">{formatUsd(LIFETIME.priceInCents)}</span> once for
      lifetime access
    </p>
  )
}
