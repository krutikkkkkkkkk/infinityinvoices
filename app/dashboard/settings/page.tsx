import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap } from "lucide-react"
import type { Profile } from "@/lib/types"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business profile and preferences
        </p>
      </div>

      <Alert className="border-purple-200 bg-purple-50">
        <Zap className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-900">
          <span className="font-semibold">Unlimited access</span> till limited time
        </AlertDescription>
      </Alert>

      <SettingsForm profile={profile as Profile | null} />
    </div>
  )
}
