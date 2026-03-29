import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Crown, CreditCard, TrendingUp } from "lucide-react"

export default async function AdminSubscriptionsPage() {
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
  const totalSubscriptions = subscriptions?.length || 0
  const proSubscriptions = subscriptions?.filter(s => s.plan === "pro") || []
  const activeSubscriptions = subscriptions?.filter(s => s.status === "active") || []
  
  // Calculate MRR (Monthly Recurring Revenue) - assuming $9.99/month for pro
  const mrr = proSubscriptions.filter(s => s.status === "active").length * 9.99

  const stats = [
    {
      title: "Total Subscriptions",
      value: totalSubscriptions,
      icon: CreditCard,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Pro Subscriptions",
      value: proSubscriptions.length,
      icon: Crown,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Active",
      value: activeSubscriptions.length,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Est. MRR",
      value: `$${mrr.toFixed(2)}`,
      icon: CreditCard,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
        <p className="text-gray-400 mt-1">Monitor subscription revenue and user plans</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Subscriptions Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">User</TableHead>
                <TableHead className="text-gray-400">Plan</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Started</TableHead>
                <TableHead className="text-gray-400">Ends</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions?.map((sub: any) => {
                const profile = sub.profiles
                const isPro = sub.plan === "pro"
                
                return (
                  <TableRow key={sub.id} className="border-gray-800">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{profile?.full_name || "No name"}</p>
                        <p className="text-sm text-gray-400">{profile?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isPro ? (
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-800 text-gray-400">
                          Free
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={sub.status === "active" ? "default" : "secondary"}
                        className={sub.status === "active" 
                          ? "bg-green-500/20 text-green-500 border-green-500/50" 
                          : "bg-gray-800 text-gray-400"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {sub.current_period_end 
                        ? new Date(sub.current_period_end).toLocaleDateString()
                        : "-"
                      }
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
