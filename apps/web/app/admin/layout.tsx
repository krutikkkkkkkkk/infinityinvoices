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
  ArrowLeft,
  TrendingUp
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
  const { data: adminRecord, error } = await supabase
    .from("super_admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!adminRecord) {
    console.log("[v0] Admin check failed for user:", user.id, "Error:", error)
    redirect("/dashboard")
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/revenue", label: "Revenue", icon: TrendingUp },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/admin/documents", label: "Documents", icon: FileText },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-sidebar-foreground text-lg">Admin</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{adminRecord.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors text-sm font-medium"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link href="/dashboard" className="block">
            <Button variant="outline" className="w-full justify-start">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
