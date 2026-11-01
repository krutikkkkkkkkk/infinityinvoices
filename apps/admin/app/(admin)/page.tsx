import Link from "next/link"
import {
  File01Icon,
  FileValidationIcon,
  Invoice01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { requireAdmin } from "@/lib/admin"
import { authUsers, count, db, desc, documents, eq, gte, profiles } from "@infinity/db"
import { formatDate } from "@/lib/format"
import { PageHeader } from "@/components/admin/page-header"
import { StatCard, StatGrid } from "@/components/admin/stat-card"
import { EmptyRow, SectionCard, TABLE_EDGE } from "@/components/admin/section-card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminDashboard() {
  await requireAdmin()

  const startOfMonth = new Date()
  startOfMonth.setUTCDate(1)
  startOfMonth.setUTCHours(0, 0, 0, 0)

  // Users come from Neon Auth's user table: someone who signed up but never opened the
  // dashboard has no profile row yet.
  const countRows = (rows: { value: number }[]) => rows[0]?.value ?? 0
  const [totalUsers, totalDocuments, totalInvoices, totalQuotations, recentUsers, newUsersThisMonth] = await Promise.all([
    db.select({ value: count() }).from(authUsers).then(countRows),
    db.select({ value: count() }).from(documents).then(countRows),
    db.select({ value: count() }).from(documents).where(eq(documents.type, "invoice")).then(countRows),
    db.select({ value: count() }).from(documents).where(eq(documents.type, "quotation")).then(countRows),
    db
      .select({
        id: authUsers.id,
        email: authUsers.email,
        company_name: profiles.company_name,
        created_at: authUsers.createdAt,
      })
      .from(authUsers)
      .leftJoin(profiles, eq(profiles.id, authUsers.id))
      .orderBy(desc(authUsers.createdAt))
      .limit(8),
    db
      .select({ value: count() })
      .from(authUsers)
      .where(gte(authUsers.createdAt, startOfMonth.toISOString()))
      .then(countRows),
  ])

  return (
    <>
      <PageHeader title="Overview" description="Platform metrics and recent sign-ups" />

      <StatGrid>
        <StatCard
          icon={UserMultipleIcon}
          label="Users"
          value={totalUsers.toLocaleString()}
          hint={`+${newUsersThisMonth.toLocaleString()} this month`}
        />
        <StatCard icon={File01Icon} label="Documents" value={totalDocuments.toLocaleString()} />
        <StatCard icon={Invoice01Icon} label="Invoices" value={totalInvoices.toLocaleString()} />
        <StatCard icon={FileValidationIcon} label="Quotations" value={totalQuotations.toLocaleString()} />
      </StatGrid>

      <SectionCard
        title="Recent sign-ups"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/users">View all</Link>
          </Button>
        }
      >
        <Table className={TABLE_EDGE}>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.company_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email || "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {formatDate(user.created_at)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyRow colSpan={3}>No users yet</EmptyRow>
            )}
          </TableBody>
        </Table>
      </SectionCard>
    </>
  )
}
