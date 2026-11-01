import { and, asc, clients, db, documents, eq, lineItems, profiles } from "@infinity/db"
import { getCurrentUser } from "@/lib/auth/server"
import { getPlanForUser } from "@/lib/plan-server"
import { applyBranding } from "@/lib/plans"
import { notFound } from "next/navigation"
import { DocumentForm } from "@/components/dashboard/document-form"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import type { Document, LineItem, Client, Profile } from "@/lib/types"

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

  const user = await getCurrentUser()

  if (!user) {
    notFound()
  }

  // Fetch document with line items
  const document = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.user_id, user.id)),
    with: { line_items: { orderBy: [asc(lineItems.sort_order)] } },
  })

  if (!document) {
    notFound()
  }

  // Get clients for selection
  const userClients = await db.select().from(clients).where(eq(clients.user_id, user.id)).orderBy(asc(clients.name))

  // Get profile for payment details fallback
  const [[profile], plan] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1),
    getPlanForUser(user.id),
  ])

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
        clients={userClients as Client[]}
        nextNumber={document.number}
        profile={applyBranding(plan, (profile ?? null) as Profile | null)}
      />
    </div>
  )
}
