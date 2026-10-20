import { requireAdmin } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"
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
  const supabase = await createClient()

  // Fetch all subscriptions with user info
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(`
      *,
      profiles:user_id(email, full_name, company_name)
    `)
    .order("created_at", { ascending: false })

  // Calculate stats
  const allSubscriptions = subscriptions || []
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
              allSubscriptions.map((sub: any) => {
                const profile = sub.profiles

                return (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <p className="font-medium">{profile?.full_name || profile?.company_name || "No name"}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
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
