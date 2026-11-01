import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/server"

export async function POST(request: Request) {
  await auth.signOut()

  return NextResponse.redirect(new URL("/login", request.url), { status: 303 })
}
