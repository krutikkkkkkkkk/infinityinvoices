import "server-only"

import { db, eq, subscriptions } from "@infinity/db"
import { getPlanForSubscription, type Plan } from "@/lib/plans"

/**
 * The plan whose limits apply to a user.
 *
 * Works for any user id (e.g. the owner of a document an admin is viewing, or of a public share
 * link). It's scoped to that one user id, and callers must already have verified they're allowed
 * to act on that user's data.
 */
export async function getPlanForUser(userId: string): Promise<Plan> {
  const [data] = await db
    .select({ plan: subscriptions.plan, status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.user_id, userId))
    .limit(1)
  return getPlanForSubscription(data)
}
