import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  BarChart3,
  Shield,
  LogOut,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is an admin
  const { data: adminRecord } = await supabase
    .from("super_admins")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!adminRecord) {
    redirect("/dashboard")
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/admin/documents", label: "Documents", icon: FileText },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            <span className="font-bold text-white text-lg">Super Admin</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{adminRecord.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-red-400">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
