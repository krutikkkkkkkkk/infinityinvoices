import { AlertCircle, CheckCircle2, PencilLine, Send } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"

// Mirrors the status styling in apps/web/lib/document-status.ts: always icon + label, never color alone.
const STATUSES = {
  draft: { label: "Draft", icon: PencilLine, className: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", icon: Send, className: "bg-info/12 text-info" },
  paid: { label: "Paid", icon: CheckCircle2, className: "bg-success/12 text-success" },
  overdue: { label: "Overdue", icon: AlertCircle, className: "bg-destructive/12 text-destructive" },
} as const

export type Status = keyof typeof STATUSES

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { label, icon: Icon, className: tone } = STATUSES[status]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", tone, className)}>
      <Icon className="size-3" aria-hidden />
      {label}
    </span>
  )
}

export function formatUSD(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" })
}
