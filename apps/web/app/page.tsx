import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/server"

export default async function Home() {
  const user = await getCurrentUser()

  // Redirect to dashboard if logged in, otherwise to login
  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/auth/login")
  }
}
