import { requireAdmin } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"
import { ChartAverageIcon, FileValidationIcon, Invoice01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons"
import { lastMonths, monthKey } from "@/lib/format"
import { PageHeader } from "@/components/admin/page-header"
import { StatCard, StatGrid } from "@/components/admin/stat-card"
import { BarList } from "@/components/admin/bar-list"
import { SectionCard } from "@/components/admin/section-card"

export default async function AdminAnalyticsPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Get monthly user signups for last 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: users } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true })

  const { data: documents } = await supabase
    .from("documents")
    .select("created_at, type, grand_total")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true })

  // Group by month
  const monthlyUsers: Record<string, number> = {}
  const monthlyDocuments: Record<string, number> = {}
  const monthlyRevenue: Record<string, number> = {}

  users?.forEach((user: any) => {
    const month = monthKey(user.created_at)
    monthlyUsers[month] = (monthlyUsers[month] || 0) + 1
  })

  documents?.forEach((doc: any) => {
    const month = monthKey(doc.created_at)
    monthlyDocuments[month] = (monthlyDocuments[month] || 0) + 1
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (Number(doc.grand_total) || 0)
  })

  const months = lastMonths(6)

  // Usage tracking stats
  const { data: usageData } = await supabase
    .from("usage_tracking")
    .select("*")
    .order("month_year", { ascending: false })
    .limit(100)

  const totalInvoicesCreated = usageData?.reduce((sum: number, u: any) => sum + (u.invoices_created || 0), 0) || 0
  const totalQuotationsCreated = usageData?.reduce((sum: number, u: any) => sum + (u.quotations_created || 0), 0) || 0
  const avgPerUser = users?.length ? ((totalInvoicesCreated + totalQuotationsCreated) / users.length).toFixed(1) : "0"

  return (
    <>
      <PageHeader title="Analytics" description="Platform growth and usage over the last 6 months" />

      <StatGrid>
        <StatCard icon={UserAdd01Icon} label="New users" value={(users?.length ?? 0).toLocaleString()} hint="Last 6 months" />
        <StatCard icon={Invoice01Icon} label="Invoices created" value={totalInvoicesCreated.toLocaleString()} />
        <StatCard icon={FileValidationIcon} label="Quotations created" value={totalQuotationsCreated.toLocaleString()} />
        <StatCard icon={ChartAverageIcon} label="Avg docs / user" value={avgPerUser} />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Sign-ups">
          <BarList
            className="p-4 sm:p-5"
            items={months.map((month) => ({
              label: month,
              value: monthlyUsers[month] || 0,
              display: `${monthlyUsers[month] || 0} users`,
            }))}
          />
        </SectionCard>
        <SectionCard title="Documents created">
          <BarList
            className="p-4 sm:p-5"
            items={months.map((month) => ({
              label: month,
              value: monthlyDocuments[month] || 0,
              display: `${monthlyDocuments[month] || 0} docs`,
            }))}
          />
        </SectionCard>
        <SectionCard title="Document value" description="Sum of grand totals, all currencies">
          <BarList
            className="p-4 sm:p-5"
            items={months.map((month) => ({
              label: month,
              value: monthlyRevenue[month] || 0,
              display: (monthlyRevenue[month] || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
            }))}
          />
        </SectionCard>
      </div>
    </>
  )
}
