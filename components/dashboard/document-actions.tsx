"use client"

import { useState, useTransition } from "react"
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
  Share01Icon,
  Link01Icon,
  CheckmarkCircle02Icon,
  Notification01Icon,
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
import { createClient } from "@/lib/supabase/client"
import type { Document, LineItem } from "@/lib/types"
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
}

export function DocumentActions({ document }: DocumentActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(document.status)
  const [isPending, startTransition] = useTransition()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailData, setEmailData] = useState({
    recipientEmail: document.client_email || "",
    message: "",
  })
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [reminderStatus, setReminderStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showUsageLimitDialog, setShowUsageLimitDialog] = useState(false)
  const [usageLimitMessage, setUsageLimitMessage] = useState("")

  const handleSendReminder = async () => {
    setIsSendingReminder(true)
    setReminderStatus(null)
    
    try {
      const response = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: document.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.startsWith("PRO_REQUIRED:")) {
          setUsageLimitMessage(data.error.replace("PRO_REQUIRED:", ""))
          setShowUsageLimitDialog(true)
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

  const handleGenerateShareLink = async () => {
    setIsGeneratingLink(true)
    const supabase = createClient()
    
    // Check if document already has a share token
    const { data: doc } = await supabase
      .from("documents")
      .select("share_token")
      .eq("id", document.id)
      .single()

    let token = doc?.share_token
    
    if (!token) {
      // Generate new token
      token = crypto.randomUUID()
      await supabase
        .from("documents")
        .update({ share_token: token })
        .eq("id", document.id)
    }

    const baseUrl = window.location.origin
    setShareLink(`${baseUrl}/invoice/${token}`)
    setIsGeneratingLink(false)
    setShowShareDialog(true)
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      const element = window.document.getElementById("document-preview")
      if (!element) {
        console.error("Document preview element not found")
        return
      }

      // A4 dimensions in pixels at 96 DPI
      const A4_WIDTH_PX = 794 // 210mm at 96dpi
      const A4_HEIGHT_PX = 1123 // 297mm at 96dpi

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: A4_WIDTH_PX,
        windowWidth: A4_WIDTH_PX,
        onclone: (clonedDoc: globalThis.Document) => {
          const preview = clonedDoc.getElementById("document-preview")
          if (!preview) return

          // Force exact A4 width on the preview
          preview.style.width = `${A4_WIDTH_PX}px`
          preview.style.maxWidth = `${A4_WIDTH_PX}px`
          preview.style.minHeight = `${A4_HEIGHT_PX}px`
          preview.style.boxSizing = "border-box"

          // Remove stylesheets that use modern color functions (oklch, lab)
          const sheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]')
          sheets.forEach((s) => s.remove())

          // Add clean styles with only hex colors
          const style = clonedDoc.createElement("style")
          style.textContent = `
            * {
              font-family: system-ui, -apple-system, Arial, sans-serif !important;
              box-sizing: border-box;
            }
            #document-preview {
              background: #ffffff !important;
              color: #000000 !important;
              padding: 40px !important;
              width: ${A4_WIDTH_PX}px !important;
              max-width: ${A4_WIDTH_PX}px !important;
            }
            #document-preview > div { 
              max-width: 100% !important; 
              width: 100% !important;
              padding: 0 !important;
            }
            #document-preview table { width: 100%; border-collapse: collapse; }
            #document-preview th { text-align: left; padding: 8px; border-bottom: 2px solid #e5e7eb; font-weight: 600; font-size: 12px; color: #6b7280; }
            #document-preview td { padding: 8px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
            #document-preview h1, #document-preview h2, #document-preview h3 { color: #111827; }
            #document-preview p { color: #374151; }
            .text-muted-foreground { color: #6b7280 !important; }
            .text-foreground { color: #111827 !important; }
            .bg-muted { background-color: #f9fafb !important; }
            .border { border-color: #e5e7eb !important; }
            .bg-primary { background-color: #111827 !important; }
            .text-primary { color: #111827 !important; }
            .text-primary-foreground { color: #ffffff !important; }
          `
          clonedDoc.head.appendChild(style)

          // Inline computed layout styles from live DOM
          const sourcePreview = window.document.getElementById("document-preview")
          if (sourcePreview) {
            const sourceElements = sourcePreview.querySelectorAll("*")
            const clonedElements = preview.querySelectorAll("*")
            
            sourceElements.forEach((srcEl, i) => {
              if (clonedElements[i]) {
                const computed = window.getComputedStyle(srcEl)
                const clonedEl = clonedElements[i] as HTMLElement
                
                clonedEl.style.display = computed.display
                clonedEl.style.flexDirection = computed.flexDirection
                clonedEl.style.justifyContent = computed.justifyContent
                clonedEl.style.alignItems = computed.alignItems
                clonedEl.style.gap = computed.gap
                clonedEl.style.padding = computed.padding
                clonedEl.style.margin = computed.margin
                clonedEl.style.fontSize = computed.fontSize
                clonedEl.style.fontWeight = computed.fontWeight
                clonedEl.style.textAlign = computed.textAlign
                clonedEl.style.lineHeight = computed.lineHeight
              }
            })
          }
        },
      })

      const imgData = canvas.toDataURL("image/png")

      // Create PDF with A4 dimensions
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth() // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight() // 297mm

      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Scale image to fit A4 width exactly
      const ratio = pdfWidth / imgWidth
      const scaledHeight = imgHeight * ratio

      if (scaledHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight)
      } else {
        // Multi-page: slice the canvas into A4-height pages
        const pageHeightInPx = pdfHeight / ratio
        let y = 0

        while (y < imgHeight) {
          const sliceH = Math.min(pageHeightInPx, imgHeight - y)
          const pageCanvas = window.document.createElement("canvas")
          pageCanvas.width = imgWidth
          pageCanvas.height = sliceH

          const ctx = pageCanvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(canvas, 0, y, imgWidth, sliceH, 0, 0, imgWidth, sliceH)
            const pageData = pageCanvas.toDataURL("image/png")
            if (y > 0) pdf.addPage()
            pdf.addImage(pageData, "PNG", 0, 0, pdfWidth, sliceH * ratio)
          }
          y += sliceH
        }
      }

      pdf.save(`${document.type}-${document.number}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPdf(false)
    }
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.startsWith("PRO_REQUIRED:")) {
          setUsageLimitMessage(data.error.replace("PRO_REQUIRED:", ""))
          setShowUsageLimitDialog(true)
          setShowEmailDialog(false)
        } else {
          setEmailStatus({ type: "error", text: data.error || "Failed to send email" })
        }
      } else {
        setEmailStatus({ type: "success", text: "Email sent successfully!" })
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
    setCurrentStatus(newStatus)
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
          setUsageLimitMessage(message.replace("USAGE_LIMIT_EXCEEDED:", ""))
          setShowUsageLimitDialog(true)
        }
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-2 print:hidden">
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
        <Button variant="outline" onClick={() => setShowEmailDialog(true)}>
          <HugeiconsIcon icon={SentIcon} size={16} className="mr-2" />
          Send Email
        </Button>
        <Button variant="outline" onClick={handleGenerateShareLink} disabled={isGeneratingLink}>
          {isGeneratingLink ? (
            <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
          ) : (
            <HugeiconsIcon icon={Share01Icon} size={16} className="mr-2" />
          )}
          Share Link
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
              Send {document.number} to your client via email.
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

      {/* Share Link Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {document.type === "invoice" ? "Invoice" : "Quotation"}</DialogTitle>
            <DialogDescription>
              Share this link with your client to let them view the {document.type} online.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input value={shareLink} readOnly className="font-mono text-sm" />
              <Button onClick={handleCopyLink} variant="outline" size="icon">
                {linkCopied ? (
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color="#16a34a" />
                ) : (
                  <HugeiconsIcon icon={Link01Icon} size={16} />
                )}
              </Button>
            </div>
            {linkCopied && (
              <p className="text-sm text-green-600">Link copied to clipboard!</p>
            )}
            <p className="text-sm text-muted-foreground">
              Anyone with this link can view the {document.type} details and payment options.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usage Limit Dialog */}
      <AlertDialog open={showUsageLimitDialog} onOpenChange={setShowUsageLimitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usage Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              {usageLimitMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/dashboard/pricing">Upgrade to Pro</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
