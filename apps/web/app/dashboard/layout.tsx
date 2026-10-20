import React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardTopBar } from "@/components/dashboard/top-bar"
import { GitHubBanner } from "@/components/dashboard/github-banner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile to get default currency
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_currency")
    .eq("id", user.id)
    .single()

  return (
    <SidebarProvider>
      <AppSidebar user={user} profile={profile} />
      <SidebarInset className="bg-background flex flex-col h-screen w-full">
        <GitHubBanner />
        <DashboardTopBar />
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 w-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
