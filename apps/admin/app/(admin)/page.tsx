import Link from "next/link"
import {
  File01Icon,
  FileValidationIcon,
  Invoice01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { requireAdmin } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatDate } from "@/lib/format"
import { PageHeader } from "@/components/admin/page-header"
import { StatCard, StatGrid } from "@/components/admin/stat-card"
import { EmptyRow, SectionCard, TABLE_EDGE } from "@/components/admin/section-card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminDashboard() {
  await requireAdmin()

  const supabase = createAdminClient()
  const startOfMonth = new Date()
  startOfMonth.setUTCDate(1)
  startOfMonth.setUTCHours(0, 0, 0, 0)

  const results = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("type", "invoice"),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("type", "quotation"),
    supabase
      .from("profiles")
      .select("id, email, company_name, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString()),
  ])

  const queryError = results.find((result) => result.error)?.error

  if (queryError) {
    throw new Error(`Unable to load admin dashboard data: ${queryError.message}`)
  }

  const [
    { count: totalUsers },
    { count: totalDocuments },
    { count: totalInvoices },
    { count: totalQuotations },
    { data: recentUsers },
    { count: newUsersThisMonth },
  ] = results

  return (
    <>
      <PageHeader title="Overview" description="Platform metrics and recent sign-ups" />

      <StatGrid>
        <StatCard
          icon={UserMultipleIcon}
          label="Users"
          value={(totalUsers ?? 0).toLocaleString()}
          hint={`+${(newUsersThisMonth ?? 0).toLocaleString()} this month`}
        />
        <StatCard icon={File01Icon} label="Documents" value={(totalDocuments ?? 0).toLocaleString()} />
        <StatCard icon={Invoice01Icon} label="Invoices" value={(totalInvoices ?? 0).toLocaleString()} />
        <StatCard icon={FileValidationIcon} label="Quotations" value={(totalQuotations ?? 0).toLocaleString()} />
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
            {recentUsers && recentUsers.length > 0 ? (
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
