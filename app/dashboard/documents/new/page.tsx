import { createClient } from "@/lib/supabase/server"
import { DocumentForm } from "@/components/dashboard/document-form"
import { redirect } from "next/navigation"
import type { DocumentType } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const params = await searchParams
  const type = (params.type === "quotation" ? "quotation" : "invoice") as DocumentType

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get count for generating next number
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("type", type)
    .eq("user_id", user.id)

  const prefix = type === "invoice" ? "INV" : "QUO"
  const nextNumber = `${prefix}-${String((count || 0) + 1).padStart(4, "0")}`

  // Get clients for selection
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("name")

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

      <DocumentForm type={type} clients={clients || []} nextNumber={nextNumber} />
    </div>
  )
}
