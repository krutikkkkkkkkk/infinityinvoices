import { createClient } from "@/lib/supabase/server"
import { DocumentForm } from "@/components/dashboard/document-form"
import { redirect } from "next/navigation"
import type { DocumentType } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { getUsageStatus } from "@/lib/usage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

  // Check usage limits
  const usageType = type === "invoice" ? "invoice" : "quotation"
  const usageStatus = await getUsageStatus(usageType)

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

      {!usageStatus.canCreate ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Usage Limit Reached</CardTitle>
            <CardDescription>
              You&apos;ve reached your monthly limit of {usageStatus.limit} {usageType}s ({usageStatus.current}/{usageStatus.limit} used).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro for unlimited {usageType}s and access to all premium features.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard/pricing">Upgrade to Pro</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/usage">View Usage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DocumentForm type={type} clients={clients || []} nextNumber={nextNumber} />
      )}
    </div>
  )
}
