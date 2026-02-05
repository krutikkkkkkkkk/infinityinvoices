"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { StatusSelect } from "@/components/dashboard/status-select"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalIcon,
  PencilEdit01Icon,
  Copy01Icon,
  Download01Icon,
  Delete01Icon,
  Share01Icon,
  InvoiceIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useTransition } from "react"
import { duplicateDocument, deleteDocument } from "@/app/dashboard/documents/actions"
import { useRouter } from "next/navigation"
import type { Document } from "@/lib/types"
import { CURRENCIES } from "@/lib/types"

function formatCurrency(amount: number, currency: string) {
  const currencyData = CURRENCIES.find((c) => c.value === currency)
  const symbol = currencyData?.symbol || ""
  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return symbol + formatted
}

export function InvoiceTableRow({ invoice }: { invoice: Document }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        await duplicateDocument(invoice.id)
      } catch {
        // handled by form
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteDocument(invoice.id)
        router.refresh()
      } catch {
        // handled by form
      }
    })
  }

  return (
    <TableRow className={isPending ? "opacity-50" : ""}>
      <TableCell className="font-medium">
        <Link
          href={`/dashboard/documents/${invoice.id}`}
          className="hover:underline"
        >
          {invoice.number}
        </Link>
      </TableCell>
      <TableCell>{invoice.client_name || "-"}</TableCell>
      <TableCell>
        <StatusSelect documentId={invoice.id} currentStatus={invoice.status} compact />
      </TableCell>
      <TableCell>
        {new Date(invoice.issue_date).toLocaleDateString()}
      </TableCell>
      <TableCell>
        {invoice.due_date
          ? new Date(invoice.due_date).toLocaleDateString()
          : "-"}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(Number(invoice.grand_total), invoice.currency)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/documents/${invoice.id}`}>
                <HugeiconsIcon icon={PencilEdit01Icon} size={14} className="mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/documents/${invoice.id}?tab=preview`}>
                <HugeiconsIcon icon={InvoiceIcon} size={14} className="mr-2" />
                Preview
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/share/${invoice.id}`} target="_blank">
                <HugeiconsIcon icon={Share01Icon} size={14} className="mr-2" />
                Share Link
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDuplicate}>
              <HugeiconsIcon icon={Copy01Icon} size={14} className="mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/api/documents/${invoice.id}/pdf`} target="_blank">
                <HugeiconsIcon icon={Download01Icon} size={14} className="mr-2" />
                Download PDF
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
              <HugeiconsIcon icon={Delete01Icon} size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
