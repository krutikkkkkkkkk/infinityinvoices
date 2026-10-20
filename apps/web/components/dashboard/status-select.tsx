"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateDocumentStatus } from "@/app/dashboard/documents/actions"
import { HugeiconsIcon } from "@hugeicons/react"
import { DOCUMENT_STATUSES, getDocumentStatus } from "@/lib/document-status"
import { cn } from "@/lib/utils"

interface StatusSelectProps {
  documentId: string
  currentStatus: string
  compact?: boolean
  documentNumber?: string
}

export function StatusSelect({ documentId, currentStatus, compact = false, documentNumber }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus)

  const handleStatusChange = (newStatus: string) => {
    const previousStatus = optimisticStatus
    setOptimisticStatus(newStatus)
    startTransition(async () => {
      try {
        await updateDocumentStatus(documentId, newStatus)
        toast.success(`${documentNumber ?? "Document"} marked as ${getDocumentStatus(newStatus).label.toLowerCase()}`)
      } catch {
        setOptimisticStatus(previousStatus)
        toast.error("Couldn't update status", { description: "Your change was reverted. Please try again." })
      }
    })
  }

  const currentOption = getDocumentStatus(optimisticStatus)

  return (
    <Select value={optimisticStatus} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger
        aria-label={`Status: ${currentOption.label}`}
        className={cn(
          "border-0 font-medium shadow-none [&>span]:flex [&>span]:items-center [&>span]:gap-1.5",
          compact ? "h-7 w-[118px] text-xs" : "w-[140px]",
          isPending && "opacity-70",
          currentOption.className
        )}
      >
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {DOCUMENT_STATUSES.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <HugeiconsIcon icon={option.icon} size={14} className={option.iconClassName} />
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
