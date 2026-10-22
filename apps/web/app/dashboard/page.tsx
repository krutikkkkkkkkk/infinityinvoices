import { Suspense } from "react"
import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { DashboardOverview } from "@/components/dashboard/overview"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { OverviewSkeleton, TableCardSkeleton } from "@/components/dashboard/overview-skeletons"
import { ProfileCompletionBanner, ProfileCompletionCard, PROFILE_BANNER_COOKIE } from "@/components/dashboard/profile-completion-card"
import { getCurrentUser, getOverviewData, getProfile, getRecentDocuments } from "@/lib/dashboard/overview"
import { resolveDashboardPeriod, type DashboardPeriod } from "@/lib/date-range"
import type { Profile } from "@/lib/types"

export const metadata = { title: "Dashboard · Infinity Invoice" }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const [profile, cookieStore, params] = await Promise.all([getProfile(user.id), cookies(), searchParams])
  const bannerDismissed = cookieStore.get(PROFILE_BANNER_COOKIE)?.value === "1"
  const period = resolveDashboardPeriod(params, profile?.financial_year_start || 4)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[32px] sm:leading-tight">
              {profile?.company_name ? `Welcome back, ${profile.company_name}` : "Dashboard"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">Here&apos;s how your invoicing is doing.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="outline" asChild className="order-2 sm:order-1">
            <Link href="/dashboard/documents/new?type=quotation">
              <HugeiconsIcon icon={Add01Icon} size={16} data-icon="inline-start" />
              New quotation
            </Link>
          </Button>
          <Button asChild className="order-1 sm:order-2">
            <Link href="/dashboard/documents/new?type=invoice">
              <HugeiconsIcon icon={Add01Icon} size={16} data-icon="inline-start" />
              New invoice
            </Link>
          </Button>
        </div>
      </header>

      <ProfileNudge profile={profile} bannerDismissed={bannerDismissed} />

      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewSection userId={user.id} profile={profile} period={period} />
      </Suspense>

      <Suspense fallback={<TableCardSkeleton />}>
        <RecentDocumentsSection userId={user.id} />
      </Suspense>
    </div>
  )
}

// Very incomplete profiles get the full checklist; nearly-done ones get a dismissible nudge.
function ProfileNudge({ profile, bannerDismissed }: { profile: Profile | null; bannerDismissed: boolean }) {
  return (
    <>
      <ProfileCompletionCard profile={profile} onlyBelowPercent={50} />
      {!bannerDismissed && <ProfileCompletionBanner profile={profile} onlyAbovePercent={50} />}
    </>
  )
}

async function OverviewSection({
  userId,
  profile,
  period,
}: {
  userId: string
  profile: Profile | null
  period: DashboardPeriod
}) {
  const data = await getOverviewData(userId, profile, period)
  return <DashboardOverview data={data} />
}

async function RecentDocumentsSection({ userId }: { userId: string }) {
  const documents = await getRecentDocuments(userId)
  return <RecentDocuments documents={documents} />
}
