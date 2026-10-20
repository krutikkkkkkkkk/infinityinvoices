"use client"

import { useState, useTransition } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateDocumentStatus } from "@/app/dashboard/documents/actions"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  PencilEdit01Icon, 
  SentIcon, 
  CheckmarkCircle02Icon, 
  AlertCircleIcon, 
  Cancel01Icon 
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
  { 
    value: "draft", 
    label: "Draft", 
    icon: PencilEdit01Icon,
    color: "text-slate-500",
    bgColor: "bg-slate-100",
    iconColor: "#64748b",
  },
  { 
    value: "sent", 
    label: "Sent", 
    icon: SentIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    iconColor: "#2563eb",
  },
  { 
    value: "paid", 
    label: "Paid", 
    icon: CheckmarkCircle02Icon,
    color: "text-green-600",
    bgColor: "bg-green-100",
    iconColor: "#16a34a",
  },
  { 
    value: "overdue", 
    label: "Overdue", 
    icon: AlertCircleIcon,
    color: "text-red-600",
    bgColor: "bg-red-100",
    iconColor: "#dc2626",
  },
  { 
    value: "cancelled", 
    label: "Cancelled", 
    icon: Cancel01Icon,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    iconColor: "#6b7280",
  },
]

interface StatusSelectProps {
  documentId: string
  currentStatus: string
  compact?: boolean
}

export function StatusSelect({ documentId, currentStatus, compact = false }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus)

  const handleStatusChange = (newStatus: string) => {
    const previousStatus = optimisticStatus
    setOptimisticStatus(newStatus)
    startTransition(async () => {
      try {
        await updateDocumentStatus(documentId, newStatus)
      } catch {
        // Revert on error
        setOptimisticStatus(previousStatus)
      }
    })
  }

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === optimisticStatus) || STATUS_OPTIONS[0]

  return (
    <Select value={optimisticStatus} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger 
        className={cn(
          "border-0 [&>span]:flex [&>span]:items-center [&>span]:gap-1.5",
          compact ? "h-8 w-[120px] text-xs" : "w-[140px]",
          currentOption.bgColor,
          currentOption.color
        )}
      >
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={option.icon} size={16} color={option.iconColor} />
              <span className={option.color}>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
