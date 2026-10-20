import { redirect } from "next/navigation"

// Merged into /dashboard/plan; keep the old URL (and its ?success / ?error params) working.
export default async function LegacyPlanRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") params.set(key, value)
  }
  const query = params.toString()
  redirect(`/dashboard/plan${query ? `?${query}` : ""}`)
}
