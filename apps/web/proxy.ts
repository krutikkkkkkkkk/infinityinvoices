import { auth } from "@/lib/auth/server"

// Only the dashboard needs a session; auth pages, the public share/portal routes, webhooks and
// cron stay reachable. Pages and actions still check the user themselves (getCurrentUser).
export default auth.middleware({ loginUrl: "/auth/login" })

export const config = {
  matcher: ["/dashboard/:path*"],
}
