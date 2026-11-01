import { and, asc, clients, db, documents, eq, invoicePresets, profiles } from "@infinity/db"
import { requireUserOrRedirect } from "@/lib/auth/server"
import { getPlanForUser } from "@/lib/plan-server"
import { applyBranding } from "@/lib/plans"
import { DocumentForm } from "@/components/dashboard/document-form"
import type { Client, DocumentType, Profile } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { getUsageStatus } from "@/lib/usage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplyDocumentStyle } from "@/components/dashboard/apply-document-style"
import { parseDocumentStyle } from "@/lib/document-style"
import type { DocumentFormData } from "@/lib/types"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; client?: string; preset?: string }>
}) {
  const params = await searchParams
  const type = (params.type === "quotation" ? "quotation" : "invoice") as DocumentType

  const user = await requireUserOrRedirect()

  // Get count for generating next number
  const count = await db.$count(documents, and(eq(documents.type, type), eq(documents.user_id, user.id)))

  const prefix = type === "invoice" ? "INV" : "QUO"
  const nextNumber = `${prefix}-${String(count + 1).padStart(4, "0")}`

  // Get clients for selection
  const userClients = await db.select().from(clients).where(eq(clients.user_id, user.id)).orderBy(asc(clients.name))

  // ?client=<id> (from a client page) pre-selects that client
  const presetClient = params.client ? userClients.find((c) => c.id === params.client) : undefined
  const clientPreset = presetClient
    ? {
        client_id: presetClient.id,
        client_name: presetClient.name,
        client_email: presetClient.email || "",
        client_address: presetClient.address || "",
        client_gst_id: presetClient.gst_id || "",
      }
    : undefined

  // ?preset=<id> (from the presets page) pre-fills the form and applies the preset's saved look
  const [selectedPreset] =
    params.preset && UUID_REGEX.test(params.preset)
      ? await db
          .select({ data: invoicePresets.data })
          .from(invoicePresets)
          .where(and(eq(invoicePresets.id, params.preset), eq(invoicePresets.user_id, user.id)))
          .limit(1)
      : []
  const presetData = (selectedPreset?.data as (Partial<DocumentFormData> & { style?: unknown }) | null) || null
  const presetStyle = parseDocumentStyle(presetData?.style)
  // A client chosen explicitly wins over the client stored in the preset
  const formPreset: Partial<DocumentFormData> | undefined =
    presetData || clientPreset ? { ...presetData, ...clientPreset } : undefined

  // Get profile for auto-filling payment methods
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1)

  // Check usage limits
  const usageType = type === "invoice" ? "invoice" : "quotation"
  const usageStatus = await getUsageStatus(usageType)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={presetClient ? `/dashboard/clients/${presetClient.id}` : "/dashboard"}>
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
                <Link href="/dashboard/plan">Upgrade to Pro</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/plan">View plan & usage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <ApplyDocumentStyle style={presetStyle} />
          <DocumentForm type={type} clients={userClients as Client[]} nextNumber={nextNumber} profile={applyBranding(await getPlanForUser(user.id), (profile ?? null) as Profile | null)} preset={formPreset} />
        </>
      )}
    </div>
  )
}
