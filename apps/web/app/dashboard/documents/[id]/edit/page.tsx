import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { DocumentForm } from "@/components/dashboard/document-form"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import type { Document, LineItem, Client } from "@/lib/types"

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Check if id is a valid UUID
  if (!UUID_REGEX.test(id)) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch document with line items
  const { data: document, error } = await supabase
    .from("documents")
    .select("*, line_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !document) {
    notFound()
  }

  // Get clients for selection
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("name")

  // Get profile for payment details fallback
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/documents/${id}`}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit {document.type === "invoice" ? "Invoice" : "Quotation"} {document.number}
          </h1>
          <p className="text-muted-foreground">
            Make changes to your {document.type}
          </p>
        </div>
      </div>

      <DocumentForm
        type={document.type}
        document={document as Document & { line_items: LineItem[] }}
        clients={(clients as Client[]) || []}
        nextNumber={document.number}
        profile={profile}
      />
    </div>
  )
}
