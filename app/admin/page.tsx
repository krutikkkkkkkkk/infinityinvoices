import { requireAdmin } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  FileText, 
  TrendingUp,
  UserCheck
} from "lucide-react"

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
      .limit(5),
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

  const stats = [
    {
      title: "Total Users",
      value: totalUsers || 0,
      icon: Users,
    },
    {
      title: "Total Invoices",
      value: totalInvoices || 0,
      icon: FileText,
    },
    {
      title: "Total Quotations",
      value: totalQuotations || 0,
      icon: FileText,
    },
    {
      title: "Total Documents",
      value: totalDocuments || 0,
      icon: TrendingUp,
    },
    {
      title: "New Users This Month",
      value: newUsersThisMonth || 0,
      icon: UserCheck,
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor your platform metrics and user activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-2">{stat.value.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.company_name || "No company"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email || "No email"}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
