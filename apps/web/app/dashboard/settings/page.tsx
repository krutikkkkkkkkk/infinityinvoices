import { requireUserOrRedirect } from "@/lib/auth/server"
import { getProfile } from "@/lib/dashboard/overview"
import { SettingsForm } from "@/components/dashboard/settings-form"
import type { Profile } from "@/lib/types"

export default async function SettingsPage() {
  const user = await requireUserOrRedirect()

  // Fetch profile
  const profile = await getProfile(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business profile and preferences
        </p>
      </div>


      <SettingsForm profile={profile as Profile | null} accountEmail={user.email} />
    </div>
  )
}
