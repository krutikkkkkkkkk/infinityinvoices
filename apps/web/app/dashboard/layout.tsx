import React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardTopBar } from "@/components/dashboard/top-bar"
import { GitHubBanner, GITHUB_BANNER_COOKIE } from "@/components/dashboard/github-banner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { ensureProfile } from "@/lib/auth/server"
import { getCurrentUser, getProfile } from "@/lib/dashboard/overview"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // First visit after sign-up: create the profile row the rest of the dashboard reads
  await ensureProfile(user)
  const [profile, cookieStore] = await Promise.all([getProfile(user.id), cookies()])
  const showGitHubBanner = cookieStore.get(GITHUB_BANNER_COOKIE)?.value !== "1"
  // Respect the persisted collapsed/expanded state of the sidebar (set by the shadcn sidebar).
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Skip to content
      </a>
      <AppSidebar user={user} profile={profile} />
      <SidebarInset className="bg-background flex flex-col h-svh w-full min-w-0">
        {showGitHubBanner && <GitHubBanner />}
        <DashboardTopBar />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 w-full outline-none">
          {children}
        </main>
      </SidebarInset>
      <Toaster position="bottom-right" richColors closeButton />
    </SidebarProvider>
  )
}
