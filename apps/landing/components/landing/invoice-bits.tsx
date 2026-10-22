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

export function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}

const QR_SIZE = 21

function isFinder(x: number, y: number) {
  const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7
  return inBox(0, 0) || inBox(QR_SIZE - 7, 0) || inBox(0, QR_SIZE - 7)
}

function finderModule(x: number, y: number) {
  const lx = x >= QR_SIZE - 7 ? x - (QR_SIZE - 7) : x
  const ly = y >= QR_SIZE - 7 ? y - (QR_SIZE - 7) : y
  const ring = Math.max(Math.abs(lx - 3), Math.abs(ly - 3))
  return ring !== 2
}

// Deterministic so server and client render the same decorative pattern.
const QR_PATH = (() => {
  let d = ""
  let seed = 7
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      const on = isFinder(x, y) ? finderModule(x, y) : (seed >> 16) % 2 === 0
      if (on) d += `M${x} ${y}h1v1h-1z`
    }
  }
  return d
})()

/** Decorative UPI-style QR code (not scannable). */
export function MiniQr({ className }: { className?: string }) {
  return (
    <svg viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`} className={className} aria-hidden shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={QR_SIZE + 2} height={QR_SIZE + 2} fill="white" rx="1.5" />
      <path d={QR_PATH} fill="#111" />
    </svg>
  )
}
