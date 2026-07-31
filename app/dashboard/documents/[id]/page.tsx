import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { DocumentDetailView } from "@/components/dashboard/document-detail-view"
import { DocumentForm } from "@/components/dashboard/document-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import type { Document, LineItem, Profile, DocumentType } from "@/lib/types"
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
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const userId = user.id
  
  // Handle "new" - render the new document form
  if (id === "new") {
    const type = (queryParams.type === "quotation" ? "quotation" : "invoice") as DocumentType

    // Get count for generating next number
    const { count } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("type", type)
      .eq("user_id", userId)

    const prefix = type === "invoice" ? "INV" : "QUO"
    const nextNumber = `${prefix}-${String((count || 0) + 1).padStart(4, "0")}`

    // Get clients for selection
    const { data: clients } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("name")

    // Get profile and optional reusable preset
    const [{ data: profile }, { data: selectedPreset }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      queryParams.preset
        ? supabase.from("invoice_presets").select("data").eq("id", queryParams.preset).eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
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
        <DocumentForm type={type} clients={clients || []} nextNumber={nextNumber} profile={profile} preset={(selectedPreset?.data as Partial<import("@/lib/types").DocumentFormData>) || undefined} />
      </div>
    )
  }
  
  // Check if id is a valid UUID
  if (!UUID_REGEX.test(id)) {
    notFound()
  }

  // Check if user is admin
  const adminStatus = await isAdmin()

  // Fetch document with line items
  let query = supabase
    .from("documents")
    .select("*, line_items(*)")
    .eq("id", id)

  // If not admin, filter by user_id
  if (!adminStatus) {
    query = query.eq("user_id", user.id)
  }

  const { data: document, error } = await query.single()

  if (error || !document) {
    notFound()
  }

  // Fetch profile and invoice settlement history
  const [{ data: profile }, { data: paymentRecords }, { data: creditNotes }, { data: recurringSchedule }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    document.type === "invoice"
      ? supabase.from("payment_records").select("id, amount, paid_at, method, reference").eq("document_id", id).eq("user_id", document.user_id).order("paid_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    document.type === "invoice"
      ? supabase.from("credit_notes").select("id, number, amount, reason, issued_at").eq("document_id", id).eq("user_id", document.user_id).order("issued_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    document.type === "invoice"
      ? supabase.from("recurring_schedules").select("frequency, next_run_at, active").eq("source_document_id", id).eq("user_id", document.user_id).eq("active", true).maybeSingle()
      : Promise.resolve({ data: null }),
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
        profile={profile as Profile | null}
        showActions={true}
      />
      {document.type === "invoice" && (
        <>
          <InvoiceSettlementPanel
            documentId={document.id}
            grandTotal={Number(document.grand_total)}
            currency={document.currency}
            payments={paymentRecords || []}
            credits={creditNotes || []}
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
