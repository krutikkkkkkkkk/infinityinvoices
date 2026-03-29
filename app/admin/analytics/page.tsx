import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Activity
} from "lucide-react"

export default async function AdminAnalyticsPage() {
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
    const month = new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    monthlyUsers[month] = (monthlyUsers[month] || 0) + 1
  })

  documents?.forEach((doc: any) => {
    const month = new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    monthlyDocuments[month] = (monthlyDocuments[month] || 0) + 1
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (doc.grand_total || 0)
  })

  // Get last 6 months in order
  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push(d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }))
  }

  // Usage tracking stats
  const { data: usageData } = await supabase
    .from("usage_tracking")
    .select("*")
    .order("month_year", { ascending: false })
    .limit(100)

  const totalInvoicesCreated = usageData?.reduce((sum: number, u: any) => sum + (u.invoices_created || 0), 0) || 0
  const totalQuotationsCreated = usageData?.reduce((sum: number, u: any) => sum + (u.quotations_created || 0), 0) || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Platform growth and usage metrics</p>
      </div>

      {/* Monthly Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              User Growth (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {months.map((month) => {
                const count = monthlyUsers[month] || 0
                const maxCount = Math.max(...Object.values(monthlyUsers), 1)
                const percentage = (count / maxCount) * 100

                return (
                  <div key={month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{month}</span>
                      <span className="text-white font-medium">{count} users</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Document Growth */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Documents Created (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {months.map((month) => {
                const count = monthlyDocuments[month] || 0
                const maxCount = Math.max(...Object.values(monthlyDocuments), 1)
                const percentage = (count / maxCount) * 100

                return (
                  <div key={month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{month}</span>
                      <span className="text-white font-medium">{count} docs</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Stats */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            Platform Usage Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">Total Invoices Created</p>
              <p className="text-3xl font-bold text-white mt-1">{totalInvoicesCreated}</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">Total Quotations Created</p>
              <p className="text-3xl font-bold text-white mt-1">{totalQuotationsCreated}</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">Avg Documents/User</p>
              <p className="text-3xl font-bold text-white mt-1">
                {users?.length ? ((totalInvoicesCreated + totalQuotationsCreated) / users.length).toFixed(1) : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Month */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-500" />
            Document Value by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {months.map((month) => {
              const value = monthlyRevenue[month] || 0
              const maxValue = Math.max(...Object.values(monthlyRevenue), 1)
              const percentage = (value / maxValue) * 100

              return (
                <div key={month} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{month}</span>
                    <span className="text-white font-medium">₹{value.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
