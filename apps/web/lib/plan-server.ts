import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { getPlanForSubscription, type Plan } from "@/lib/plans"

/**
 * The plan whose limits apply to a user.
 *
 * Uses the service role so it works for any user id (e.g. the owner of a document an admin is
 * viewing, or of a public share link). It's scoped to that one user id, and callers must already
 * have verified they're allowed to act on that user's data.
 */
export async function getPlanForUser(userId: string): Promise<Plan> {
  const { data } = await createAdminClient()
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle()
  return getPlanForSubscription(data)
}
