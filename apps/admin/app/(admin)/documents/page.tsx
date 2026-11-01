import { requireAdmin } from "@/lib/admin"
import { count, db, desc, documents as documentsTable, eq, inArray, profiles as profilesTable } from "@infinity/db"
import { HugeiconsIcon } from "@hugeicons/react"
import { File01Icon, FileValidationIcon, Invoice01Icon, MoneyBag02Icon } from "@hugeicons/core-free-icons"
import { formatDate } from "@/lib/format"
import { PageHeader } from "@/components/admin/page-header"
import { StatCard, StatGrid } from "@/components/admin/stat-card"
import { StatusBadge } from "@/components/admin/badges"
import { EmptyRow, SectionCard, TABLE_EDGE } from "@/components/admin/section-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type AdminDocument = {
  id: string
  user_id: string
  type: "invoice" | "quotation"
  number: string
  client_name: string | null
  grand_total: number | string | null
  currency: string
  status: string
  created_at: string
}

type ProfileSummary = {
  id: string
  email: string | null
  company_name: string | null
}

function formatAmount(value: number | string | null, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export default async function AdminDocumentsPage() {
  await requireAdmin()

  const countRows = (rows: { value: number }[]) => rows[0]?.value ?? 0
  const [documents, totalCount, invoiceCount, quotationCount]: [AdminDocument[], number, number, number] = await Promise.all([
    db
      .select({
        id: documentsTable.id,
        user_id: documentsTable.user_id,
        type: documentsTable.type,
        number: documentsTable.number,
        client_name: documentsTable.client_name,
        grand_total: documentsTable.grand_total,
        currency: documentsTable.currency,
        status: documentsTable.status,
        created_at: documentsTable.created_at,
      })
      .from(documentsTable)
      .orderBy(desc(documentsTable.created_at))
      .limit(100),
    db.select({ value: count() }).from(documentsTable).then(countRows),
    db.select({ value: count() }).from(documentsTable).where(eq(documentsTable.type, "invoice")).then(countRows),
    db.select({ value: count() }).from(documentsTable).where(eq(documentsTable.type, "quotation")).then(countRows),
  ])

  const userIds = [...new Set(documents.map((document) => document.user_id))]
  const profiles: ProfileSummary[] = userIds.length
    ? await db
        .select({ id: profilesTable.id, email: profilesTable.email, company_name: profilesTable.company_name })
        .from(profilesTable)
        .where(inArray(profilesTable.id, userIds))
    : []

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]))
  const totalsByCurrency = documents.reduce<Record<string, number>>((totals, document) => {
    const currency = document.currency || "INR"
    totals[currency] = (totals[currency] ?? 0) + (Number(document.grand_total) || 0)
    return totals
  }, {})
  const recentValue = Object.entries(totalsByCurrency)
    .map(([currency, value]) => formatAmount(value, currency))
    .join(" · ") || formatAmount(0, "INR")

  return (
    <>
      <PageHeader title="Documents" description="Invoices and quotations across all users" />

      <StatGrid>
        <StatCard icon={File01Icon} label="Documents" value={totalCount.toLocaleString()} />
        <StatCard icon={Invoice01Icon} label="Invoices" value={invoiceCount.toLocaleString()} />
        <StatCard icon={FileValidationIcon} label="Quotations" value={quotationCount.toLocaleString()} />
        <StatCard icon={MoneyBag02Icon} label="Recent value" value={recentValue} hint={`Across the latest ${documents.length}`} />
      </StatGrid>

      <SectionCard title="Recent documents" description="Latest 100">
        <Table className={TABLE_EDGE}>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length > 0 ? (
              documents.map((document) => {
                const profile = profilesById.get(document.user_id)

                return (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                          <HugeiconsIcon
                            icon={document.type === "invoice" ? Invoice01Icon : FileValidationIcon}
                            size={14}
                            aria-hidden
                          />
                        </span>
                        <div>
                          <p className="font-medium">{document.number || "Draft"}</p>
                          <p className="text-xs capitalize text-muted-foreground">{document.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{profile?.company_name || "No company"}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email || "No email"}</p>
                    </TableCell>
                    <TableCell>{document.client_name || "—"}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatAmount(document.grand_total, document.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={document.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{formatDate(document.created_at)}</TableCell>
                  </TableRow>
                )
              })
            ) : (
              <EmptyRow colSpan={6}>No documents found.</EmptyRow>
            )}
          </TableBody>
        </Table>
      </SectionCard>
    </>
  )
}
