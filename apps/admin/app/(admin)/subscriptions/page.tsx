import { requireAdmin } from "@/lib/admin"
import { authUsers, db, desc, eq, getTableColumns, profiles, subscriptions as subscriptionsTable } from "@infinity/db"
import { CreditCardIcon, CrownIcon, InfinityIcon, MoneyReceive01Icon } from "@hugeicons/core-free-icons"
import { formatDate, formatMoney } from "@/lib/format"
import { PageHeader } from "@/components/admin/page-header"
import { StatCard, StatGrid } from "@/components/admin/stat-card"
import { PlanBadge, StatusBadge } from "@/components/admin/badges"
import { EmptyRow, SectionCard, TABLE_EDGE } from "@/components/admin/section-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const LIFETIME_SEATS = 200

export default async function AdminSubscriptionsPage() {
  await requireAdmin()

  // Fetch all subscriptions with user info (email from Neon Auth, names from the profile)
  const allSubscriptions = await db
    .select({
      ...getTableColumns(subscriptionsTable),
      email: authUsers.email,
      full_name: profiles.full_name,
      company_name: profiles.company_name,
    })
    .from(subscriptionsTable)
    .leftJoin(authUsers, eq(authUsers.id, subscriptionsTable.user_id))
    .leftJoin(profiles, eq(profiles.id, subscriptionsTable.user_id))
    .orderBy(desc(subscriptionsTable.created_at))

  // Calculate stats
  const proSubscriptions = allSubscriptions.filter((s) => s.plan === "pro")
  const lifetimeSubscriptions = allSubscriptions.filter((s) => s.plan === "lifetime")
  const activeSubscriptions = allSubscriptions.filter((s) => s.status === "active")

  // Calculate MRR (Monthly Recurring Revenue) - $5/month for pro, lifetime is one-time so not MRR
  const mrr = proSubscriptions.filter((s) => s.status === "active").length * 5

  return (
    <>
      <PageHeader title="Subscriptions" description="Every plan on the platform and its billing status" />

      <StatGrid>
        <StatCard
          icon={CreditCardIcon}
          label="Subscriptions"
          value={allSubscriptions.length.toLocaleString()}
          hint={`${activeSubscriptions.length.toLocaleString()} active`}
        />
        <StatCard icon={CrownIcon} label="Pro" value={proSubscriptions.length.toLocaleString()} />
        <StatCard
          icon={InfinityIcon}
          label="Lifetime"
          value={`${lifetimeSubscriptions.length}/${LIFETIME_SEATS}`}
          hint={`${Math.max(0, LIFETIME_SEATS - lifetimeSubscriptions.length)} seats left`}
        />
        <StatCard icon={MoneyReceive01Icon} label="Est. MRR" value={formatMoney(mrr)} hint="Pro plans only" />
      </StatGrid>

      <SectionCard title="All subscriptions">
        <Table className={TABLE_EDGE}>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Ends</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allSubscriptions.length > 0 ? (
              allSubscriptions.map((sub) => {
                return (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <p className="font-medium">{sub.full_name || sub.company_name || "No name"}</p>
                      <p className="text-xs text-muted-foreground">{sub.email}</p>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={sub.plan} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sub.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{formatDate(sub.created_at)}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {sub.plan === "lifetime" ? "Never" : formatDate(sub.current_period_end)}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <EmptyRow colSpan={5}>No subscriptions yet</EmptyRow>
            )}
          </TableBody>
        </Table>
      </SectionCard>
    </>
  )
}
