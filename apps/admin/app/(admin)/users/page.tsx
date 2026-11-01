import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { requireAdmin } from "@/lib/admin"
import { authUsers, count, db, desc, documents, eq, ilike, inArray, or, profiles, subscriptions } from "@infinity/db"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/admin/page-header"
import { PlanBadge } from "@/components/admin/badges"
import { EmptyRow, SectionCard, TABLE_EDGE } from "@/components/admin/section-card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserActionsCell } from "./user-actions-cell"

const PLAN_FILTERS = [
  { value: undefined, label: "All" },
  { value: "pro", label: "Pro" },
  { value: "lifetime", label: "Lifetime" },
  { value: "free", label: "Free" },
]

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; plan?: string }>
}) {
  await requireAdmin()
  const params = await searchParams

  // Every Neon Auth user, with the company from their profile (missing until they open the dashboard)
  const search = params.search?.trim()
  // Escape LIKE wildcards so a search for "50%" matches literally
  const pattern = search ? `%${search.replace(/[\\%_]/g, "\\$&")}%` : null
  const users = await db
    .select({
      id: authUsers.id,
      email: authUsers.email,
      company_name: profiles.company_name,
      created_at: authUsers.createdAt,
    })
    .from(authUsers)
    .leftJoin(profiles, eq(profiles.id, authUsers.id))
    .where(pattern ? or(ilike(authUsers.email, pattern), ilike(profiles.company_name, pattern)) : undefined)
    .orderBy(desc(authUsers.createdAt))

  // Fetch subscriptions separately for all users
  const userIds = users.map((u) => u.id)
  const userSubscriptions = userIds.length
    ? await db
        .select({ user_id: subscriptions.user_id, plan: subscriptions.plan, status: subscriptions.status })
        .from(subscriptions)
        .where(inArray(subscriptions.user_id, userIds))
    : []

  // Map subscriptions to users
  const subscriptionMap: Record<string, (typeof userSubscriptions)[number]> = {}
  userSubscriptions.forEach((sub) => {
    subscriptionMap[sub.user_id] = sub
  })

  // Filter by plan if specified
  let filteredUsers = users
  if (params.plan) {
    filteredUsers = filteredUsers.filter((user) => {
      const subscription = subscriptionMap[user.id]
      if (params.plan === "pro") return subscription?.plan === "pro" || subscription?.plan === "lifetime"
      if (params.plan === "lifetime") return subscription?.plan === "lifetime"
      if (params.plan === "free") return !subscription || subscription.plan === "free"
      return true
    })
  }

  // Get document counts per user
  const filteredUserIds = filteredUsers.map((u) => u.id)
  const documentCounts = filteredUserIds.length
    ? await db
        .select({ user_id: documents.user_id, value: count() })
        .from(documents)
        .where(inArray(documents.user_id, filteredUserIds))
        .groupBy(documents.user_id)
    : []

  const docCountMap: Record<string, number> = {}
  documentCounts.forEach((row) => {
    docCountMap[row.user_id] = row.value
  })

  const filterHref = (plan?: string) => {
    const qs = new URLSearchParams()
    if (params.search) qs.set("search", params.search)
    if (plan) qs.set("plan", plan)
    const s = qs.toString()
    return s ? `/users?${s}` : "/users"
  }

  return (
    <>
      <PageHeader title="Users" description="Manage and view all registered users" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form className="relative w-full sm:max-w-xs">
          {params.plan && <input type="hidden" name="plan" value={params.plan} />}
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            name="search"
            type="search"
            placeholder="Search email or company…"
            defaultValue={params.search}
            aria-label="Search users"
            className="h-9 rounded-full bg-card pl-9"
          />
        </form>
        <nav aria-label="Filter by plan" className="flex gap-1 self-start rounded-full bg-muted p-1">
          {PLAN_FILTERS.map((filter) => {
            const active = params.plan === filter.value
            return (
              <Link
                key={filter.label}
                href={filterHref(filter.value)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                )}
              >
                {filter.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <SectionCard title={`${filteredUsers.length.toLocaleString()} ${filteredUsers.length === 1 ? "user" : "users"}`}>
        <Table className={TABLE_EDGE}>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Documents</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const plan = subscriptionMap[user.id]?.plan

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.company_name || "No company"}</p>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={plan} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{docCountMap[user.id] || 0}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <UserActionsCell userId={user.id} isPro={plan === "pro" || plan === "lifetime"} />
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <EmptyRow colSpan={5}>No users match these filters.</EmptyRow>
            )}
          </TableBody>
        </Table>
      </SectionCard>
    </>
  )
}
