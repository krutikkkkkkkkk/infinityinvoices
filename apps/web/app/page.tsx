import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to dashboard if logged in, otherwise to login
  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/auth/login")
  }
}
