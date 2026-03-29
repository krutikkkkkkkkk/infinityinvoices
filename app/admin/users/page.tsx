import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Crown, Search } from "lucide-react"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; plan?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch all users with their subscription info
  let query = supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      company_name,
      created_at
    `)
    .order("created_at", { ascending: false })

  if (params.search) {
    query = query.or(`email.ilike.%${params.search}%,full_name.ilike.%${params.search}%,company_name.ilike.%${params.search}%`)
  }

  const { data: users, error } = await query

  console.log("[v0] Admin users query result:", { usersCount: users?.length, error })

  // Fetch subscriptions separately for all users
  const userIds = users?.map((u: any) => u.id) || []
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("user_id, plan, status")
    .in("user_id", userIds)

  // Map subscriptions to users
  const subscriptionMap: Record<string, any> = {}
  subscriptions?.forEach((sub: any) => {
    subscriptionMap[sub.user_id] = sub
  })

  // Filter by plan if specified
  let filteredUsers = users || []
  if (params.plan) {
    filteredUsers = filteredUsers.filter((user: any) => {
      const subscription = subscriptionMap[user.id]
      if (params.plan === "pro") return subscription?.plan === "pro"
      if (params.plan === "free") return !subscription || subscription.plan === "free"
      return true
    })
  }

  // Get document counts per user
  const filteredUserIds = filteredUsers.map((u: any) => u.id)
  const { data: documentCounts } = await supabase
    .from("documents")
    .select("user_id")
    .in("user_id", filteredUserIds)

  const docCountMap: Record<string, number> = {}
  documentCounts?.forEach((doc: any) => {
    docCountMap[doc.user_id] = (docCountMap[doc.user_id] || 0) + 1
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <p className="text-gray-400 mt-1">Manage and view all registered users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            name="search"
            placeholder="Search users..."
            defaultValue={params.search}
            className="pl-10 bg-gray-900 border-gray-800 text-white"
          />
        </form>
        <div className="flex gap-2">
          <a href="/admin/users">
            <Badge variant={!params.plan ? "default" : "outline"} className="cursor-pointer px-4 py-2">
              All
            </Badge>
          </a>
          <a href="/admin/users?plan=pro">
            <Badge variant={params.plan === "pro" ? "default" : "outline"} className="cursor-pointer px-4 py-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          </a>
          <a href="/admin/users?plan=free">
            <Badge variant={params.plan === "free" ? "default" : "outline"} className="cursor-pointer px-4 py-2">
              Free
            </Badge>
          </a>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            {filteredUsers.length} Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">User</TableHead>
                <TableHead className="text-gray-400">Company</TableHead>
                <TableHead className="text-gray-400">Plan</TableHead>
                <TableHead className="text-gray-400">Documents</TableHead>
                <TableHead className="text-gray-400">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: any) => {
                const subscription = subscriptionMap[user.id]
                const isPro = subscription?.plan === "pro"
                
                return (
                  <TableRow key={user.id} className="border-gray-800">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{user.full_name || "No name"}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.company_name || "-"}
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
                    <TableCell className="text-gray-300">
                      {docCountMap[user.id] || 0}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
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
