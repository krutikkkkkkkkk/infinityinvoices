import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default async function AdminRevenuePage() {
  const supabase = await createClient()

  // Fetch all pro subscriptions with user profile
  const { data: proSubs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("plan", "pro")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  const proSubsData = proSubs || []

  // Fetch profiles for pro users
  const proUserIds = proSubsData.map((s) => s.user_id)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, company_name, created_at")
    .in("id", proUserIds)

  const profileMap: Record<string, any> = {}
  profiles?.forEach((p) => { profileMap[p.id] = p })

  // All features are currently free - no revenue metrics
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Usage</h1>
        <p className="text-gray-400 text-sm">All features are currently free for all users</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Users</p>
                <p className="text-2xl font-bold text-white mt-1">{totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">All on free plan</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(0)}</p>
                <p className="text-xs text-gray-500 mt-1">No monetization yet</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                <p className="text-2xl font-bold text-white mt-1">Free</p>
                <p className="text-xs text-gray-500 mt-1">Unlimited for everyone</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Expiring Soon</p>
                <p className="text-2xl font-bold text-white mt-1">{expiringSoon.length}</p>
                <p className="text-xs text-gray-500 mt-1">Within 30 days</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pro Subscribers Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pro Subscribers
          </CardTitle>
          <CardDescription className="text-gray-400">
            {activeProCount} active at {formatCurrency(PRO_PRICE)}/month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proSubsData.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Crown className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No Pro subscribers yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">User</TableHead>
                  <TableHead className="text-gray-400">Company</TableHead>
                  <TableHead className="text-gray-400">Subscribed</TableHead>
                  <TableHead className="text-gray-400">Renews</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400 text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proSubsData.map((sub) => {
                  const profile = profileMap[sub.user_id]
                  const isExpiringSoon = expiringSoon.some((e) => e.id === sub.id)
                  const monthsActive = Math.max(1, Math.floor(
                    (Date.now() - new Date(sub.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
                  ))
                  const totalRevenue = monthsActive * PRO_PRICE

                  return (
                    <TableRow key={sub.id} className="border-gray-800">
                      <TableCell className="text-white">
                        {profile?.email || "Unknown"}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {profile?.company_name || "-"}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {formatDate(sub.created_at)}
                      </TableCell>
                      <TableCell>
                        {sub.current_period_end ? (
                          <span className={isExpiringSoon ? "text-orange-400" : "text-gray-400"}>
                            {formatDate(sub.current_period_end)}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isExpiringSoon ? (
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                            Expiring Soon
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-white font-medium">
                        {formatCurrency(totalRevenue)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Monthly Growth */}
      {Object.keys(monthlyGrowth).length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-base font-medium">Subscribers by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(monthlyGrowth).map(([month, count]) => (
                <div key={month} className="flex items-center justify-between py-1 border-b border-gray-800 last:border-0">
                  <span className="text-gray-400">{month}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${(count / activeProCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium w-6 text-right">{count}</span>
                    <span className="text-gray-500 text-xs w-20 text-right">{formatCurrency(count * PRO_PRICE)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
