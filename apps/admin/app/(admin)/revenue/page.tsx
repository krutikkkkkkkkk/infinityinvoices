import { requireAdmin } from "@/lib/admin"
import { and, authUsers, count, db, desc, eq, inArray, profiles as profilesTable, subscriptions } from "@infinity/db"
import {
  Calendar03Icon,
  CrownIcon,
  MoneyReceive01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { formatDate, formatMoney, lastMonths, monthKey } from "@/lib/format"
import { PageHeader } from "@/components/admin/page-header"
import { StatCard, StatGrid } from "@/components/admin/stat-card"
import { ToneBadge } from "@/components/admin/badges"
import { BarList } from "@/components/admin/bar-list"
import { EmptyRow, SectionCard, TABLE_EDGE } from "@/components/admin/section-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const PRO_PRICE = 5

export default async function AdminRevenuePage() {
  await requireAdmin()
  // Fetch all pro subscriptions with user profile
  const proSubsData = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.plan, "pro"), eq(subscriptions.status, "active")))
    .orderBy(desc(subscriptions.created_at))
  const activeProCount = proSubsData.length

  const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000
  const expiringSoon = new Set(
    proSubsData
      .filter((s) => s.current_period_end && new Date(s.current_period_end).getTime() <= thirtyDaysFromNow)
      .map((s) => s.id)
  )

  const monthlyGrowth: Record<string, number> = {}
  proSubsData.forEach((s) => {
    const month = monthKey(s.created_at)
    monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1
  })

  // Fetch profiles for pro users
  const proUserIds = proSubsData.map((s) => s.user_id)
  const profiles = proUserIds.length
    ? await db
        .select({
          id: profilesTable.id,
          email: profilesTable.email,
          company_name: profilesTable.company_name,
          created_at: profilesTable.created_at,
        })
        .from(profilesTable)
        .where(inArray(profilesTable.id, proUserIds))
    : []

  const profileMap: Record<string, (typeof profiles)[number]> = {}
  profiles.forEach((p) => { profileMap[p.id] = p })

  // Every Neon Auth user counts, including ones who haven't opened the dashboard yet
  const [{ value: totalUsers }] = await db.select({ value: count() }).from(authUsers)

  const conversion = totalUsers ? ((activeProCount / totalUsers) * 100).toFixed(1) : "0"

  return (
    <>
      <PageHeader title="Revenue" description="Active Pro subscribers and estimated recurring revenue" />

      <StatGrid>
        <StatCard
          icon={MoneyReceive01Icon}
          label="Est. MRR"
          value={formatMoney(activeProCount * PRO_PRICE)}
          hint={`${formatMoney(PRO_PRICE)} per Pro subscriber`}
        />
        <StatCard icon={CrownIcon} label="Pro subscribers" value={activeProCount.toLocaleString()} />
        <StatCard
          icon={UserMultipleIcon}
          label="Total users"
          value={totalUsers.toLocaleString()}
          hint={`${conversion}% on Pro`}
        />
        <StatCard icon={Calendar03Icon} label="Expiring soon" value={expiringSoon.size} hint="Within 30 days" />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <SectionCard title="Pro subscribers" className="lg:col-span-2">
          <Table className={TABLE_EDGE}>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Renews</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proSubsData.length > 0 ? (
                proSubsData.map((sub) => {
                  const profile = profileMap[sub.user_id]
                  const isExpiringSoon = expiringSoon.has(sub.id)
                  const monthsActive = Math.max(1, Math.floor(
                    (Date.now() - new Date(sub.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
                  ))

                  return (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <p className="font-medium">{profile?.email || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{profile?.company_name || "No company"}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{formatDate(sub.created_at)}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{formatDate(sub.current_period_end)}</TableCell>
                      <TableCell>
                        {isExpiringSoon ? (
                          <ToneBadge tone="warning">Expiring soon</ToneBadge>
                        ) : (
                          <ToneBadge tone="good">Active</ToneBadge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatMoney(monthsActive * PRO_PRICE)}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <EmptyRow colSpan={5}>No Pro subscribers yet</EmptyRow>
              )}
            </TableBody>
          </Table>
        </SectionCard>

        <SectionCard title="New subscribers" description="Last 6 months">
          <BarList
            className="p-4 sm:p-5"
            items={lastMonths(6).map((month) => ({
              label: month,
              value: monthlyGrowth[month] || 0,
              display: String(monthlyGrowth[month] || 0),
            }))}
          />
        </SectionCard>
      </div>
    </>
  )
}
