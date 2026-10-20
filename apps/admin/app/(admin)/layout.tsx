import { cookies } from "next/headers"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { requireAdmin } from "@/lib/admin"
import { APP_URL } from "@/lib/env"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [admin, cookieStore] = await Promise.all([requireAdmin(), cookies()])
  // Respect the persisted collapsed/expanded state of the sidebar (set by the shadcn sidebar).
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar email={admin.email} role={admin.role} appUrl={APP_URL} />
      <SidebarInset className="flex h-svh w-full min-w-0 flex-col bg-background">
        <AdminTopBar />
        <main className="w-full flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </SidebarInset>
      <Toaster position="bottom-right" richColors closeButton />
    </SidebarProvider>
  )
}
