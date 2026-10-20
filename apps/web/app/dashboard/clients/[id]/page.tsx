import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, CheckmarkCircle02Icon, Notification03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClientAvatar } from "@/components/dashboard/client-avatar"
import {
  ClientDetailsCard,
  ClientDocuments,
  ClientHeaderActions,
  ClientOverview,
} from "@/components/dashboard/client-detail"
import { getClientDetail } from "@/lib/dashboard/client"
import { getCurrentUser, getProfile } from "@/lib/dashboard/overview"
import { formatDate } from "@/lib/format"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || !UUID_RE.test(id)) return { title: "Client · Infinity Invoice" }
  const detail = await getClientDetail(user.id, id)
  return { title: `${detail?.client.name ?? "Client"} · Infinity Invoice` }
}

export default async function ClientPage({ params }: Props) {
  const { id } = await params
  if (!UUID_RE.test(id)) notFound()

  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const profile = await getProfile(user.id)
  const detail = await getClientDetail(user.id, id, profile?.default_currency || "INR")
  if (!detail) notFound()

  const { client } = detail
  const subtitle = [client.company_name !== client.name ? client.company_name : null, client.contact_person]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link href="/dashboard/clients" aria-label="Back to clients">
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            </Link>
          </Button>
          <ClientAvatar name={client.name} className="size-12 text-base sm:size-14 sm:text-lg" />
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-[28px] sm:leading-tight">{client.name}</h1>
            {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <ClientHeaderActions client={client} />
      </header>

      <div className="-mt-2 flex flex-wrap gap-2">
        {client.gst_id ? (
          <Badge variant="outline" className="gap-1 bg-card py-1 font-normal">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-success" aria-hidden />
            GST registered
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-card py-1 font-normal text-muted-foreground">
            Not GST registered
          </Badge>
        )}
        <Badge variant="outline" className="bg-card py-1 font-normal text-muted-foreground">
          Client since {formatDate(client.created_at)}
        </Badge>
        {detail.lastInvoiceDate && (
          <Badge variant="outline" className="bg-card py-1 font-normal text-muted-foreground">
            Last invoiced {formatDate(detail.lastInvoiceDate)}
          </Badge>
        )}
        {detail.openQuotes > 0 && (
          <Badge variant="outline" className="bg-card py-1 font-normal text-muted-foreground">
            {detail.openQuotes} open {detail.openQuotes === 1 ? "quote" : "quotes"}
          </Badge>
        )}
        <Badge variant="outline" className="gap-1 bg-card py-1 font-normal text-muted-foreground">
          <HugeiconsIcon icon={Notification03Icon} size={12} aria-hidden />
          Reminders {client.auto_reminder ? "on" : "off"}
        </Badge>
      </div>

      <ClientOverview
        clientName={client.name}
        currencies={detail.currencies}
        primaryCurrency={detail.primaryCurrency}
        byCurrency={detail.byCurrency}
        details={<ClientDetailsCard client={client} />}
        documents={<ClientDocuments clientId={client.id} documents={detail.documents} />}
      />
    </div>
  )
}
