"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PencilEdit01Icon,
  Download01Icon,
  Copy01Icon,
  InvoiceIcon,
  Delete01Icon,
  MoreHorizontalIcon,
  Loading01Icon,
  SentIcon,
  CheckmarkCircle02Icon,
  Notification01Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { toast } from "sonner"
import { useSubscription } from "@/hooks/use-subscription"
import { downloadPdf } from "@/lib/pdf-download"
import { ShareLinkDialog } from "./share-link-dialog"
import type { Document, LineItem } from "@/lib/types"
import type { TemplateType } from "./template-selector"
import type { TemplateColors } from "@/lib/generate-document-html"
import {
  deleteDocument,
  duplicateDocument,
  convertToInvoice,
  updateDocumentStatus,
} from "@/app/dashboard/documents/actions"

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
]

interface DocumentActionsProps {
  document: Document & { line_items: LineItem[] }
  template?: TemplateType
  /** Custom template colours; sent with every export so the file matches the preview. */
  colors?: Partial<TemplateColors> | null
}

export function DocumentActions({ document, template = "classic", colors }: DocumentActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(document.status)
  const [isPending, startTransition] = useTransition()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailData, setEmailData] = useState({
    recipientEmail: document.client_email || "",
    message: "",
  })
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [reminderStatus, setReminderStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showUsageLimitDialog, setShowUsageLimitDialog] = useState(false)
  const [usageLimitTitle, setUsageLimitTitle] = useState("Usage Limit Reached")
  const [usageLimitMessage, setUsageLimitMessage] = useState("")
  const { isPro, isLoading: isPlanLoading } = useSubscription()

  // Email sending (invoices, quotations, reminders) is only available on paid plans.
  // The server enforces this too; checking here avoids filling in a form that can't be sent.
  const requirePaidPlan = (feature: string): boolean => {
    if (isPlanLoading || isPro) return true
    setUsageLimitTitle("Pro feature")
    setUsageLimitMessage(`${feature} is only available on paid plans. Upgrade to Pro to unlock it.`)
    setShowUsageLimitDialog(true)
    return false
  }

  const showProRequired = (message: string) => {
    setUsageLimitTitle(message.toLowerCase().includes("limit") ? "Usage Limit Reached" : "Pro feature")
    setUsageLimitMessage(message)
    setShowUsageLimitDialog(true)
  }

  const handleOpenEmailDialog = () => {
    if (!requirePaidPlan("Sending documents by email")) return
    setShowEmailDialog(true)
  }

  const handleOpenShareDialog = () => {
    if (!requirePaidPlan("Sharing via link")) return
    setShowShareDialog(true)
  }

  const handleSendReminder = async () => {
    if (!requirePaidPlan("Sending payment reminders")) return
    setIsSendingReminder(true)
    setReminderStatus(null)
    
    try {
      const response = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: document.id, template, colors }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.startsWith("PRO_REQUIRED:")) {
          showProRequired(data.error.replace("PRO_REQUIRED:", ""))
        } else {
          setReminderStatus({ type: "error", text: data.error || "Failed to send reminder" })
        }
      } else {
        setReminderStatus({ type: "success", text: "Reminder sent successfully!" })
        setTimeout(() => setReminderStatus(null), 3000)
      }
    } catch {
      setReminderStatus({ type: "error", text: "Failed to send reminder" })
    } finally {
      setIsSendingReminder(false)
    }
  }

  const pdfUrl = (extra = "") => {
    const query = new URLSearchParams({ id: document.id, template })
    if (colors?.primary) query.set("primary", colors.primary)
    if (colors?.accent) query.set("accent", colors.accent)
    return `/api/documents/pdf?${query.toString()}${extra}`
  }

  const handleOpenPdf = () => {
    window.open(pdfUrl("&inline=1"), "_blank", "noopener")
  }

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    const result = await downloadPdf(
      pdfUrl(),
      `${document.type === "quotation" ? "Quotation" : "Invoice"}-${document.number}.pdf`,
      // No headless browser on this server: the browser's print engine honours the same page CSS
      () => toast.info("Opening the print dialog. Choose “Save as PDF” to download.")
    )
    if (result.status === "error") toast.error(result.message)
    setIsGeneratingPdf(false)
  }

  const handleSendEmail = async () => {
    if (!emailData.recipientEmail) return

    setIsSendingEmail(true)
    setEmailStatus(null)

    try {
      const response = await fetch("/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          recipientEmail: emailData.recipientEmail,
          message: emailData.message,
          template,
          colors,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.startsWith("PRO_REQUIRED:")) {
          showProRequired(data.error.replace("PRO_REQUIRED:", ""))
          setShowEmailDialog(false)
        } else {
          setEmailStatus({ type: "error", text: data.error || "Failed to send email" })
        }
      } else {
        setEmailStatus({ type: "success", text: "Email sent with the PDF attached." })
        setCurrentStatus("sent")
        setTimeout(() => {
          setShowEmailDialog(false)
          setEmailStatus(null)
        }, 2000)
      }
    } catch (error) {
      setEmailStatus({ type: "error", text: "Failed to send email" })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as Document["status"])
    startTransition(async () => {
      await updateDocumentStatus(document.id, newStatus)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteDocument(document.id)
    })
  }

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        await duplicateDocument(document.id)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to duplicate"
        if (message.startsWith("USAGE_LIMIT_EXCEEDED:")) {
          setUsageLimitTitle("Usage Limit Reached")
          setUsageLimitMessage(message.replace("USAGE_LIMIT_EXCEEDED:", ""))
          setShowUsageLimitDialog(true)
        }
      }
    })
  }

  const handleConvertToInvoice = () => {
    startTransition(async () => {
      try {
        await convertToInvoice(document.id)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to convert"
        if (message.startsWith("USAGE_LIMIT_EXCEEDED:")) {
          setUsageLimitTitle("Usage Limit Reached")
          setUsageLimitMessage(message.replace("USAGE_LIMIT_EXCEEDED:", ""))
          setShowUsageLimitDialog(true)
        }
      }
    })
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 print:hidden">
        <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleOpenEmailDialog}>
          <HugeiconsIcon icon={SentIcon} size={16} className="mr-2" />
          Send Email
        </Button>
        {document.type === "invoice" && document.status !== "paid" && document.status !== "cancelled" && (
          <Button 
            variant="outline" 
            onClick={handleSendReminder} 
            disabled={isSendingReminder || !document.client_email}
            className={reminderStatus?.type === "success" ? "border-green-500 text-green-600" : ""}
          >
            {isSendingReminder ? (
              <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
            ) : reminderStatus?.type === "success" ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="mr-2" />
            ) : (
              <HugeiconsIcon icon={Notification01Icon} size={16} className="mr-2" />
            )}
            {reminderStatus?.type === "success" ? "Sent!" : "Send Reminder"}
          </Button>
        )}
        <Button variant="outline" onClick={handleOpenShareDialog}>
          <HugeiconsIcon icon={Share08Icon} size={16} className="mr-2" />
          Share
        </Button>
        <Button variant="outline" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
          {isGeneratingPdf ? (
            <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
          ) : (
            <HugeiconsIcon icon={Download01Icon} size={16} className="mr-2" />
          )}
          {isGeneratingPdf ? "Generating..." : "Download PDF"}
        </Button>
        <Button asChild>
          <Link href={`/dashboard/documents/${document.id}/edit`}>
            <HugeiconsIcon icon={PencilEdit01Icon} size={16} className="mr-2" />
            Edit
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
              {isPending ? (
                <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
              ) : (
                <HugeiconsIcon icon={Copy01Icon} size={16} className="mr-2" />
              )}
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenPdf}>
              <HugeiconsIcon icon={InvoiceIcon} size={16} className="mr-2" />
              Open PDF in new tab
            </DropdownMenuItem>
            {document.type === "quotation" && (
              <DropdownMenuItem onClick={handleConvertToInvoice} disabled={isPending}>
                {isPending ? (
                  <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
                ) : (
                  <HugeiconsIcon icon={InvoiceIcon} size={16} className="mr-2" />
                )}
                Convert to Invoice
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <HugeiconsIcon icon={Delete01Icon} size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {document.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {document.type} #{document.number}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send {document.type === "invoice" ? "Invoice" : "Quotation"} via Email</DialogTitle>
            <DialogDescription>
              A short email with {document.number} attached as a PDF, using the currently selected template and colours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={emailData.recipientEmail}
                onChange={(e) =>
                  setEmailData((prev) => ({ ...prev, recipientEmail: e.target.value }))
                }
                placeholder="client@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) =>
                  setEmailData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Add a personal message to your client..."
                rows={3}
              />
            </div>
            {emailStatus && (
              <p
                className={`text-sm ${
                  emailStatus.type === "success" ? "text-green-600" : "text-destructive"
                }`}
              >
                {emailStatus.text}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSendingEmail || !emailData.recipientEmail}
            >
              {isSendingEmail ? (
                <>
                  <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SentIcon} size={16} className="mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareLinkDialog
        document={document}
        template={template}
        colors={colors}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        onProRequired={showProRequired}
      />

      {/* Usage Limit Dialog */}
      <AlertDialog open={showUsageLimitDialog} onOpenChange={setShowUsageLimitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{usageLimitTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {usageLimitMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/dashboard/plan">Upgrade to Pro</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
