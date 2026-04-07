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
  searchParams: Promise<{ type?: string }>
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

    // Get profile for pre-filling payment details
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

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
        <DocumentForm type={type} clients={clients || []} nextNumber={nextNumber} profile={profile} />
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

  // Fetch profile for header info
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {document.type === "invoice" ? "Invoice" : "Quotation"} {document.number}
          </h1>
          {getStatusBadge(document.status)}
        </div>
      </div>

      {/* Preview, Actions and Payments */}
      <DocumentDetailView
        document={document as Document & { line_items: LineItem[] }}
        profile={profile as Profile | null}
        showActions={true}
      />
    </div>
  )
}
