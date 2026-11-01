import { HugeiconsIcon } from "@hugeicons/react"
import { Diamond02Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TONES = {
  neutral: "bg-muted text-muted-foreground",
  good: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
  brand: "bg-primary/10 text-primary",
} as const

export type Tone = keyof typeof TONES

export function ToneBadge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: React.ReactNode
}) {
  return (
    <Badge className={cn("border-transparent font-medium capitalize", TONES[tone], className)}>{children}</Badge>
  )
}

export function PlanBadge({ plan }: { plan: string | null | undefined }) {
  if (plan === "lifetime" || plan === "pro") {
    return (
      <ToneBadge tone={plan === "lifetime" ? "warning" : "brand"}>
        <HugeiconsIcon icon={Diamond02Icon} size={12} />
        {plan === "lifetime" ? "Lifetime" : "Pro"}
      </ToneBadge>
    )
  }
  return <ToneBadge>Free</ToneBadge>
}

const STATUS_TONES: Record<string, Tone> = {
  active: "good",
  paid: "good",
  accepted: "good",
  trialing: "brand",
  sent: "brand",
  overdue: "critical",
  cancelled: "critical",
  canceled: "critical",
  rejected: "critical",
  past_due: "warning",
  expired: "warning",
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const value = status || "unknown"
  return <ToneBadge tone={STATUS_TONES[value] ?? "neutral"}>{value.replace(/_/g, " ")}</ToneBadge>
}
