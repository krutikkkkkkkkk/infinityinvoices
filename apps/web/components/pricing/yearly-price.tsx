import { PRO_YEARLY, formatUsd } from "@/lib/plans"
import { cn } from "@/lib/utils"

/** The yearly Pro price with its pre-discount price struck through: "or ~~$36~~ $30 per year · $2.50/mo". */
export function YearlyPrice({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      or <s className="text-muted-foreground/70">{formatUsd(PRO_YEARLY.compareAtPriceInCents)}</s>{" "}
      <span className="font-medium text-foreground tabular-nums">{formatUsd(PRO_YEARLY.priceInCents)}</span> per year ·{" "}
      {formatUsd(PRO_YEARLY.priceInCents / 12)}/mo
    </p>
  )
}
