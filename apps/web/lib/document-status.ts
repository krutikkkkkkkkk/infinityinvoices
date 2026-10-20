import {
  PencilEdit01Icon,
  SentIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

// Theme-token based so every status reads correctly in light and dark mode.
// Each status always ships with an icon + label, never color alone.
export const DOCUMENT_STATUSES = [
  { value: "draft", label: "Draft", icon: PencilEdit01Icon, className: "bg-muted text-muted-foreground", iconClassName: "text-muted-foreground" },
  { value: "sent", label: "Sent", icon: SentIcon, className: "bg-info/12 text-info", iconClassName: "text-info" },
  { value: "paid", label: "Paid", icon: CheckmarkCircle02Icon, className: "bg-success/12 text-success", iconClassName: "text-success" },
  { value: "overdue", label: "Overdue", icon: AlertCircleIcon, className: "bg-destructive/12 text-destructive", iconClassName: "text-destructive" },
  { value: "cancelled", label: "Cancelled", icon: Cancel01Icon, className: "bg-muted text-muted-foreground line-through decoration-1", iconClassName: "text-muted-foreground" },
] as const

export type DocumentStatusValue = (typeof DOCUMENT_STATUSES)[number]["value"]

export function getDocumentStatus(value: string) {
  return DOCUMENT_STATUSES.find((s) => s.value === value) ?? DOCUMENT_STATUSES[0]
}
