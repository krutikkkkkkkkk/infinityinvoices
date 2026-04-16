import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp,
  Crown,
  UserCheck
} from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: totalUsers },
    { data: subscriptions },
    { count: totalDocuments },
    { data: recentUsers }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("plan"),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("profiles")
      .select("id, email, full_name, company_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
  ])

  const proUsers = subscriptions?.filter(s => s.plan === "pro").length || 0
  const lifetimeUsers = subscriptions?.filter(s => s.plan === "lifetime").length || 0
  const paidUsers = proUsers + lifetimeUsers
  const freeUsers = (totalUsers || 0) - paidUsers

  // Get this month's new users
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { count: newUsersThisMonth } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  const stats = [
    {
      title: "Total Users",
      value: totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Pro Users",
      value: proUsers,
      icon: Crown,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Lifetime Users",
      value: `${lifetimeUsers}/200`,
      icon: Crown,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Free Users",
      value: freeUsers,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Total Documents",
      value: totalDocuments || 0,
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "New This Month",
      value: newUsersThisMonth || 0,
      icon: TrendingUp,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Monitor your platform metrics and user activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Users */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-white">{user.full_name || user.email}</p>
                  <p className="text-sm text-gray-400">{user.company_name || "No company"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
