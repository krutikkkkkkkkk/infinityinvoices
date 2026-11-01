import Link from "next/link"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  Diamond02Icon,
  FileValidationIcon,
  Invoice01Icon,
  Mail01Icon,
  SparklesIcon,
  UserGroupIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconChip } from "@/components/dashboard/overview"
import { getCurrentUser } from "@/lib/dashboard/overview"
import { getPlanOverview, type PlanId, type PlanOverview } from "@/lib/dashboard/plan"
import { FREE_PLAN, LIFETIME, PRO_PLAN, formatUsd } from "@/lib/plans"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata = { title: "Plan & usage · Infinity Invoice" }

const PLAN_NAMES: Record<PlanId, string> = { free: "Free", pro: "Pro", lifetime: "Lifetime" }

const STATUS_COPY: Record<string, string> = {
  on_hold: "Your last payment didn't go through, so Pro features are paused.",
  failed: "Your payment failed, so Pro features are paused.",
  paused: "Your subscription is paused.",
  pending: "Your payment is still being confirmed.",
  canceled: "Your subscription was canceled.",
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const [{ success, error }, overview] = await Promise.all([searchParams, getPlanOverview(user.id)])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[32px] sm:leading-tight">Plan & usage</h1>
        <p className="text-sm text-muted-foreground">Your subscription, this month&apos;s usage, and what each plan includes.</p>
      </header>

      <Notices success={success} error={error} overview={overview} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <CurrentPlanCard overview={overview} />
        <UsageCard overview={overview} />
      </div>

      <section aria-labelledby="compare-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="compare-heading" className="text-base font-semibold">
            Compare plans
          </h2>
          <p className="text-sm text-muted-foreground">Every plan includes PDF downloads, UPI QR codes and multi-currency invoicing.</p>
        </div>
        <div className={cn("grid grid-cols-1 gap-4", overview.checkout.lifetime ? "md:grid-cols-3" : "md:grid-cols-2")}>
          <PlanOption
            id="free"
            overview={overview}
            name="Free"
            price="$0"
            cadence="forever"
            description={FREE_PLAN.description}
            features={FREE_PLAN.features}
          />
          <PlanOption
            id="pro"
            overview={overview}
            name="Pro"
            price={formatUsd(PRO_PLAN.priceInCents)}
            cadence="per month"
            description={PRO_PLAN.description}
            features={["Everything in Free", ...PRO_PLAN.features]}
            highlight
          />
          {overview.checkout.lifetime && (
            <PlanOption
              id="lifetime"
              overview={overview}
              name="Lifetime"
              price={formatUsd(LIFETIME.priceInCents)}
              cadence="once, no renewals"
              description="Pro, forever. Pay once."
              features={["Everything in Pro", "Pay once, keep it forever", "All future features"]}
            />
          )}
        </div>
      </section>

      <Faq />
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Notices({ success, error, overview }: { success?: string; error?: string; overview: PlanOverview }) {
  const notices: { tone: "good" | "bad"; text: React.ReactNode }[] = []
  if (success) notices.push({ tone: "good", text: "Payment received — your plan is now active. It can take a few seconds to show up here." })
  if (error === "checkout_failed") notices.push({ tone: "bad", text: "We couldn't start checkout. Please try again in a moment." })
  if (error === "portal_failed") notices.push({ tone: "bad", text: "We couldn't open the billing portal. Please try again in a moment." })
  if (error === "invalid_plan") notices.push({ tone: "bad", text: "That plan isn't available." })
  if (overview.inactivePaidPlan) {
    notices.push({
      tone: "bad",
      text: (
        <>
          {STATUS_COPY[overview.status] ?? `Your ${PLAN_NAMES[overview.inactivePaidPlan]} plan isn't active.`} You&apos;re on Free
          limits until it&apos;s fixed.
          {overview.canManageBilling && (
            <>
              {" "}
              <a href="/api/portal" className="font-medium underline underline-offset-4">
                Update billing
              </a>
            </>
          )}
        </>
      ),
    })
  }
  if (notices.length === 0) return null

  return (
    <div className="flex flex-col gap-2" role="status">
      {notices.map((n, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-3 rounded-2xl px-4 py-3 text-sm",
            n.tone === "good" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          <HugeiconsIcon icon={n.tone === "good" ? CheckmarkCircle02Icon : Alert02Icon} size={18} className="mt-px shrink-0" />
          <p className="text-foreground">{n.text}</p>
        </div>
      ))}
    </div>
  )
}

function CurrentPlanCard({ overview }: { overview: PlanOverview }) {
  const { planId, isPaid } = overview
  const priceLine =
    planId === "pro"
      ? `${formatUsd(PRO_PLAN.priceInCents)} per month`
      : planId === "lifetime"
        ? "Paid once — no renewals"
        : "Free forever"

  let renewalLine: string | null = null
  if (planId === "pro" && overview.renewsAt) {
    renewalLine = overview.cancelsAtPeriodEnd
      ? `Ends on ${formatDate(overview.renewsAt)} — you won't be charged again`
      : `Renews on ${formatDate(overview.renewsAt)}`
  }

  return (
    <Card className="gap-6 border-0 bg-spotlight p-6 text-spotlight-foreground shadow-[0_12px_32px_-16px_rgb(0_0_0/0.45)] lg:col-span-2 dark:border dark:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <IconChip icon={isPaid ? Diamond02Icon : SparklesIcon} className="bg-spotlight-muted text-spotlight-foreground ring-white/10" />
          <span className="text-sm text-spotlight-foreground/60">Current plan</span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            overview.inactivePaidPlan
              ? "bg-destructive/20 text-spotlight-foreground"
              : overview.cancelsAtPeriodEnd
                ? "bg-warning/20 text-spotlight-foreground"
                : "bg-white/10 text-spotlight-foreground"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              overview.inactivePaidPlan ? "bg-destructive" : overview.cancelsAtPeriodEnd ? "bg-warning" : "bg-success"
            )}
            aria-hidden
          />
          {overview.inactivePaidPlan ? "Needs attention" : overview.cancelsAtPeriodEnd ? "Canceling" : "Active"}
        </span>
      </div>

      <div>
        <p className="text-4xl font-semibold tracking-tight">{PLAN_NAMES[planId]}</p>
        <p className="mt-1 text-sm text-spotlight-foreground/60">{priceLine}</p>
        {renewalLine && <p className="mt-3 text-sm">{renewalLine}</p>}
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        {!isPaid && overview.checkout.pro && (
          <a
            href="/api/checkout?plan=pro"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-spotlight-foreground px-5 text-sm font-medium text-spotlight transition-[opacity,transform] hover:opacity-90 active:scale-[0.97]"
          >
            <HugeiconsIcon icon={Diamond02Icon} size={16} />
            Upgrade to Pro
          </a>
        )}
        {overview.canManageBilling && (
          <a
            href="/api/portal"
            className="inline-flex h-10 items-center rounded-full bg-white/10 px-5 text-sm font-medium transition-[background-color,transform] hover:bg-white/15 active:scale-[0.97]"
          >
            {overview.inactivePaidPlan ? "Fix payment" : "Manage billing"}
          </a>
        )}
        {!isPaid && !overview.checkout.pro && (
          <p className="text-xs text-spotlight-foreground/60">Upgrades aren&apos;t available right now.</p>
        )}
      </div>
    </Card>
  )
}

function UsageCard({ overview }: { overview: PlanOverview }) {
  const rows: { key: string; label: string; icon: typeof Invoice01Icon; used: number; limit: number; atLimitHint?: string }[] = [
    { key: "invoices", label: "Invoices", icon: Invoice01Icon, ...overview.usage.invoices },
    { key: "quotations", label: "Quotations", icon: FileValidationIcon, ...overview.usage.quotations },
    { key: "emails", label: "Emails sent", icon: Mail01Icon, ...overview.usage.emails },
    { key: "clients", label: "Clients", icon: UserGroupIcon, ...overview.usage.clients, atLimitHint: "delete a client or upgrade to add more." },
  ]
  const nearLimit = rows.some((r) => r.limit > 0 && r.used >= r.limit * 0.8)

  return (
    <Card className="gap-5 lg:col-span-3">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6">
        <div>
          <h2 className="text-sm font-medium">This month</h2>
          <p className="text-xs text-muted-foreground">
            Resets on {formatDate(overview.resetsAt)} · {overview.daysUntilReset} {overview.daysUntilReset === 1 ? "day" : "days"} left
          </p>
        </div>
        <Badge variant="outline" className="bg-card font-normal text-muted-foreground">
          {overview.isPaid ? "Unlimited" : "Free limits"}
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-3 px-5 sm:px-6">
        {rows.map((r) => (
          <UsageMeter key={r.key} label={r.label} icon={r.icon} used={r.used} limit={r.limit} atLimitHint={r.atLimitHint} />
        ))}
        {!overview.isPaid && nearLimit && overview.checkout.pro && (
          <p className="rounded-xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            You&apos;re close to this month&apos;s limit.{" "}
            <a href="/api/checkout?plan=pro" className="font-medium text-foreground underline underline-offset-4">
              Upgrade to Pro
            </a>{" "}
            for unlimited documents and email sending.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function UsageMeter({
  label,
  icon,
  used,
  limit,
  atLimitHint,
}: {
  label: string
  icon: typeof Invoice01Icon
  used: number
  limit: number
  /** What to do when the limit is hit; defaults to waiting for the monthly reset. */
  atLimitHint?: string
}) {
  const unlimited = limit === -1
  const proOnly = limit === 0
  const pct = unlimited || proOnly ? 0 : Math.min(100, (used / limit) * 100)
  const atLimit = !unlimited && !proOnly && used >= limit
  const warn = !atLimit && pct >= 80

  return (
    <div className="rounded-xl bg-muted/60 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <HugeiconsIcon icon={icon} size={16} className="text-muted-foreground" aria-hidden />
          {label}
        </span>
        {unlimited ? (
          <span className="text-sm tabular-nums text-muted-foreground">
            <span className="font-medium text-foreground">{used}</span> · unlimited
          </span>
        ) : proOnly ? (
          <Badge variant="outline" className="bg-card font-normal">
            Pro only
          </Badge>
        ) : (
          <span className={cn("text-sm tabular-nums", atLimit ? "font-medium text-destructive" : "text-muted-foreground")}>
            <span className={cn("font-medium", !atLimit && "text-foreground")}>{used}</span> / {limit}
          </span>
        )}
      </div>
      {!unlimited && !proOnly && (
        <div
          className="mt-2.5 h-2 overflow-hidden rounded-full bg-background"
          role="progressbar"
          aria-label={`${label}: ${used} of ${limit} used`}
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={limit}
        >
          <div
            className={cn("h-full rounded-full", atLimit ? "bg-destructive" : warn ? "bg-warning" : "bg-primary")}
            style={{ width: `${Math.max(pct, used > 0 ? 4 : 0)}%` }}
          />
        </div>
      )}
      {atLimit && (
        <p className="mt-2 text-xs text-destructive">
          Limit reached — {atLimitHint ?? `new ${label.toLowerCase()} are blocked until the reset.`}
        </p>
      )}
    </div>
  )
}

function PlanOption({
  id,
  overview,
  name,
  price,
  cadence,
  description,
  features,
  highlight,
}: {
  id: PlanId
  overview: PlanOverview
  name: string
  price: string
  cadence: string
  description: string
  features: string[]
  highlight?: boolean
}) {
  const current = overview.planId === id
  // Lifetime already covers Pro; Free is never something you "buy".
  const covered = id === "free" || (id === "pro" && overview.planId === "lifetime")

  let action: React.ReactNode
  if (current) {
    action = overview.isPaid && overview.canManageBilling ? (
      <Button variant="outline" className="w-full" asChild>
        <a href="/api/portal">Manage billing</a>
      </Button>
    ) : (
      <Button variant="secondary" className="w-full" disabled>
        Your current plan
      </Button>
    )
  } else if (covered) {
    action = (
      <Button variant="ghost" className="w-full text-muted-foreground" disabled>
        {id === "free" ? "Included" : "Included in Lifetime"}
      </Button>
    )
  } else if (overview.checkout[id as "pro" | "lifetime"]) {
    action = (
      <Button variant={highlight ? "brand" : "default"} className="w-full" asChild>
        <a href={`/api/checkout?plan=${id}`}>{id === "lifetime" ? "Get lifetime access" : `Upgrade to ${name}`}</a>
      </Button>
    )
  } else {
    action = (
      <Button variant="secondary" className="w-full" disabled>
        Not available yet
      </Button>
    )
  }

  return (
    <Card className={cn("relative gap-5 p-6", highlight && !current && "ring-2 ring-primary/60", current && "ring-2 ring-foreground/80")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {current ? (
          <Badge className="border-transparent bg-foreground text-background">Current</Badge>
        ) : highlight ? (
          <Badge className="border-transparent bg-primary/10 text-primary">Most popular</Badge>
        ) : null}
      </div>
      <p className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight">{price}</span>
        <span className="text-sm text-muted-foreground">{cadence}</span>
      </p>
      <ul className="flex flex-1 flex-col gap-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-success/15 text-success" aria-hidden>
              <HugeiconsIcon icon={Tick02Icon} size={10} strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      {action}
    </Card>
  )
}

const FAQ = [
  {
    q: "When do my limits reset?",
    a: "On the 1st of every month. Unused invoices and quotations don't carry over.",
  },
  {
    q: "What happens when I hit the Free limit?",
    a: "Your existing invoices stay fully usable — you can still view, edit and download them. You just can't create new ones until the reset or until you upgrade.",
  },
  {
    q: "Can I cancel Pro anytime?",
    a: "Yes. Open Manage billing and cancel; you keep Pro until the end of the period you've paid for, then move to Free.",
  },
  {
    q: "Is my data kept if I downgrade?",
    a: "Yes. Clients, invoices, quotations and settings are never deleted when your plan changes.",
  },
]

function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="flex flex-col gap-3">
      <h2 id="faq-heading" className="text-base font-semibold">
        Questions
      </h2>
      <Card className="gap-0 py-2">
        {FAQ.map((item, i) => (
          <details key={item.q} className={cn("group px-5 sm:px-6", i > 0 && "border-t")}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-transform group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="pb-4 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </Card>
    </section>
  )
}
