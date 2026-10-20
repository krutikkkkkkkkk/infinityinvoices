import { NextResponse } from "next/server"

export async function GET() {
  // All features are free - no Pro plan currently
  return NextResponse.json({
    plan: null,
    message: "All features are currently free",
  })
}
