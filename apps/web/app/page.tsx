import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const code = typeof params.code === "string" ? params.code : null

  // Supabase falls back to the project's Site URL (this page) when the
  // redirectTo of an auth email is not on its allow-list. The only email flow
  // that redirects somewhere other than /auth/callback is the password reset,
  // so hand the code to the callback and continue the reset there.
  if (code) {
    const query = new URLSearchParams({ code, next: "/auth/reset-password" })
    redirect(`/auth/callback?${query.toString()}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to dashboard if logged in, otherwise to login
  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/auth/login")
  }
}
