import { auth } from "@/lib/auth/server"

// Every admin route needs a session; only the login page and the auth API are public.
// Admin membership itself is checked by requireAdmin() in the layout, pages and actions.
export default auth.middleware({ loginUrl: "/login", publicRoutes: ["/login"] })

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
