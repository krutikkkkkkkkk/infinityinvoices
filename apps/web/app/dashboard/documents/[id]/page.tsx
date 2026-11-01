import { and, asc, clients, creditNotes, db, desc, documents, eq, invoicePresets, lineItems, paymentRecords, profiles, recurringSchedules } from "@infinity/db"
import { requireUserOrRedirect } from "@/lib/auth/server"
import { getPlanForUser } from "@/lib/plan-server"
import { applyBranding } from "@/lib/plans"
import { notFound } from "next/navigation"
import { DocumentDetailView } from "@/components/dashboard/document-detail-view"
import { DocumentForm } from "@/components/dashboard/document-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import type { Client, Document, LineItem, Profile, DocumentType } from "@/lib/types"
import { isAdmin } from "@/lib/admin"
import { InvoiceSettlementPanel } from "@/components/dashboard/invoice-settlement-panel"
import { InvoiceAutomationPanel } from "@/components/dashboard/invoice-automation-panel"
import { SaveAsPresetButton } from "@/components/dashboard/invoice-preset-controls"

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    sent: "default",
    paid: "default",
    overdue: "destructive",
    cancelled: "outline",
  }
  return (
    <Badge variant={variants[status] || "secondary"} className="capitalize">
      {status}
    </Badge>
  )
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function DocumentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string; preset?: string }>
}) {
  const { id } = await params
  const queryParams = await searchParams
  const user = await requireUserOrRedirect()
  const userId = user.id

  // Handle "new" - render the new document form
  if (id === "new") {
    const type = (queryParams.type === "quotation" ? "quotation" : "invoice") as DocumentType

    // Get count for generating next number
    const count = await db.$count(documents, and(eq(documents.type, type), eq(documents.user_id, userId)))

    const prefix = type === "invoice" ? "INV" : "QUO"
    const nextNumber = `${prefix}-${String(count + 1).padStart(4, "0")}`

    // Get clients for selection
    const userClients = await db.select().from(clients).where(eq(clients.user_id, user.id)).orderBy(asc(clients.name))

    // Get profile and optional reusable preset
    const preset = queryParams.preset && UUID_REGEX.test(queryParams.preset) ? queryParams.preset : null
    const [[profile], [selectedPreset], plan] = await Promise.all([
      db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1),
      preset
        ? db.select({ data: invoicePresets.data }).from(invoicePresets).where(and(eq(invoicePresets.id, preset), eq(invoicePresets.user_id, user.id))).limit(1)
        : Promise.resolve([]),
      getPlanForUser(user.id),
    ])

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              New {type === "invoice" ? "Invoice" : "Quotation"}
            </h1>
            <p className="text-muted-foreground">
              Create a new {type === "invoice" ? "invoice" : "quotation"} for your client
            </p>
          </div>
        </div>
        <DocumentForm type={type} clients={userClients as Client[]} nextNumber={nextNumber} profile={applyBranding(plan, (profile ?? null) as Profile | null)} preset={(selectedPreset?.data as Partial<import("@/lib/types").DocumentFormData>) || undefined} />
      </div>
    )
  }
  
  // Check if id is a valid UUID
  if (!UUID_REGEX.test(id)) {
    notFound()
  }

  // Check if user is admin
  const adminStatus = await isAdmin()

  // Fetch document with line items (admins can open any user's document)
  const document = await db.query.documents.findFirst({
    where: adminStatus ? eq(documents.id, id) : and(eq(documents.id, id), eq(documents.user_id, user.id)),
    with: { line_items: { orderBy: [asc(lineItems.sort_order)] } },
  })

  if (!document) {
    notFound()
  }

  // The document owner's plan decides whether the logo shows (previews must match the PDF)
  const plan = await getPlanForUser(document.user_id)

  // Fetch profile and invoice settlement history
  const isInvoice = document.type === "invoice"
  const [[profile], payments, credits, [recurringSchedule]] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1),
    isInvoice
      ? db
          .select({ id: paymentRecords.id, amount: paymentRecords.amount, paid_at: paymentRecords.paid_at, method: paymentRecords.method, reference: paymentRecords.reference, notes: paymentRecords.notes })
          .from(paymentRecords)
          .where(and(eq(paymentRecords.document_id, id), eq(paymentRecords.user_id, document.user_id)))
          .orderBy(desc(paymentRecords.paid_at))
      : Promise.resolve([]),
    isInvoice
      ? db
          .select({ id: creditNotes.id, number: creditNotes.number, amount: creditNotes.amount, reason: creditNotes.reason, issued_at: creditNotes.issued_at })
          .from(creditNotes)
          .where(and(eq(creditNotes.document_id, id), eq(creditNotes.user_id, document.user_id)))
          .orderBy(desc(creditNotes.issued_at))
      : Promise.resolve([]),
    isInvoice
      ? db
          .select({ frequency: recurringSchedules.frequency, next_run_at: recurringSchedules.next_run_at, active: recurringSchedules.active })
          .from(recurringSchedules)
          .where(and(eq(recurringSchedules.source_document_id, id), eq(recurringSchedules.user_id, document.user_id), eq(recurringSchedules.active, true)))
          .limit(1)
      : Promise.resolve([]),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {document.type === "invoice" ? "Invoice" : "Quotation"} {document.number}
          </h1>
          {getStatusBadge(document.status)}
          {document.type === "invoice" && <SaveAsPresetButton document={document as Document & { line_items: LineItem[] }} />}
        </div>
      </div>

      {/* Preview, Actions and Payments */}
      <DocumentDetailView
        document={document as Document & { line_items: LineItem[] }}
        profile={applyBranding(plan, (profile ?? null) as Profile | null)}
        showActions={true}
      />
      {document.type === "invoice" && (
        <>
          <InvoiceSettlementPanel
            documentId={document.id}
            grandTotal={Number(document.grand_total)}
            currency={document.currency as Document["currency"]}
            status={document.status}
            payments={payments}
            credits={credits}
          />
          <InvoiceAutomationPanel
            documentId={document.id}
            lateFeeType={document.late_fee_type || null}
            lateFeeValue={document.late_fee_value ? Number(document.late_fee_value) : null}
            schedule={recurringSchedule || null}
          />
        </>
      )}
    </div>
  )
}
