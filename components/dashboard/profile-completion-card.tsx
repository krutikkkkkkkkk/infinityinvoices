"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick01Icon,
  Cancel01Icon,
  Building04Icon,
  MailAtSign01Icon,
  Call02Icon,
  Location01Icon,
  Tag01Icon,
  Image01Icon,
  Bank01Icon,
  MobileNavigator01Icon,
  PaypalIcon,
} from "@hugeicons/core-free-icons"
import type { Profile } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProfileField {
  key: keyof Profile
  label: string
  icon: React.ComponentType<any>
  group: "business" | "payment"
}

const PROFILE_FIELDS: ProfileField[] = [
  { key: "company_name",      label: "Company Name",    icon: Building04Icon,       group: "business" },
  { key: "email",             label: "Business Email",  icon: MailAtSign01Icon,     group: "business" },
  { key: "phone",             label: "Phone Number",    icon: Call02Icon,           group: "business" },
  { key: "company_address",   label: "Address",         icon: Location01Icon,       group: "business" },
  { key: "gst_id",            label: "GST / Tax ID",    icon: Tag01Icon,            group: "business" },
  { key: "logo_url",          label: "Company Logo",    icon: Image01Icon,          group: "business" },
  { key: "bank_name",         label: "Bank Details",    icon: Bank01Icon,           group: "payment" },
  { key: "upi_id",            label: "UPI ID",          icon: MobileNavigator01Icon,group: "payment" },
  { key: "paypal_email",      label: "PayPal Email",    icon: PaypalIcon,           group: "payment" },
]

function calcCompletion(profile: Profile | null) {
  if (!profile) return { percent: 0, filled: 0, total: PROFILE_FIELDS.length, missing: PROFILE_FIELDS }
  const filled = PROFILE_FIELDS.filter((f) => !!profile[f.key])
  return {
    percent: Math.round((filled.length / PROFILE_FIELDS.length) * 100),
    filled: filled.length,
    total: PROFILE_FIELDS.length,
    missing: PROFILE_FIELDS.filter((f) => !profile[f.key]),
  }
}

interface ProfileCompletionCardProps {
  profile: Profile | null
  compact?: boolean
}

export function ProfileCompletionCard({ profile, compact = false }: ProfileCompletionCardProps) {
  const { percent, filled, total, missing } = calcCompletion(profile)

  if (percent === 100) return null

  const businessFields = PROFILE_FIELDS.filter((f) => f.group === "business")
  const paymentFields  = PROFILE_FIELDS.filter((f) => f.group === "payment")

  const isComplete = (key: keyof Profile) => !!profile?.[key]

  const progressColor =
    percent < 35 ? "bg-destructive" :
    percent < 70 ? "bg-amber-500" :
    "bg-emerald-500"

  if (compact) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium">Profile {percent}% complete</p>
              <span className="text-xs text-muted-foreground">{filled}/{total} fields</span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", progressColor)}
                style={{ width: `${percent}%` }}
              />
            </div>
            {missing.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Missing: {missing.slice(0, 3).map((f) => f.label).join(", ")}
                {missing.length > 3 && ` +${missing.length - 3} more`}
              </p>
            )}
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/settings">Complete Profile</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Profile Completion</CardTitle>
            <CardDescription className="mt-0.5">
              Complete your profile so invoices look professional
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={cn(
                "text-2xl font-black tabular-nums",
                percent < 35 ? "text-destructive" :
                percent < 70 ? "text-amber-500" :
                "text-emerald-500"
              )}
            >
              {percent}%
            </span>
            <span className="text-xs text-muted-foreground">{filled} of {total} fields</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden mt-3">
          <div
            className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-700", progressColor)}
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Business Info */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Business Info
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {businessFields.map((field) => {
              const done = isComplete(field.key)
              return (
                <div
                  key={field.key}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    done
                      ? "bg-emerald-500/8 text-foreground"
                      : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  <HugeiconsIcon
                    icon={field.icon}
                    size={14}
                    className={done ? "text-emerald-500 shrink-0" : "text-muted-foreground/60 shrink-0"}
                  />
                  <span className="flex-1 truncate">{field.label}</span>
                  {done ? (
                    <HugeiconsIcon icon={Tick01Icon} size={13} className="text-emerald-500 shrink-0" />
                  ) : (
                    <HugeiconsIcon icon={Cancel01Icon} size={13} className="text-muted-foreground/40 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Payment Methods
            <span className="ml-1.5 font-normal normal-case tracking-normal">(at least one recommended)</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {paymentFields.map((field) => {
              const done = isComplete(field.key)
              return (
                <div
                  key={field.key}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    done
                      ? "bg-emerald-500/8 text-foreground"
                      : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  <HugeiconsIcon
                    icon={field.icon}
                    size={14}
                    className={done ? "text-emerald-500 shrink-0" : "text-muted-foreground/60 shrink-0"}
                  />
                  <span className="flex-1 truncate">{field.label}</span>
                  {done ? (
                    <HugeiconsIcon icon={Tick01Icon} size={13} className="text-emerald-500 shrink-0" />
                  ) : (
                    <HugeiconsIcon icon={Cancel01Icon} size={13} className="text-muted-foreground/40 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-1">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/settings">Complete Your Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Dismissible banner — shown at top of dashboard when profile is incomplete
export function ProfileCompletionBanner({ profile }: { profile: Profile | null }) {
  const [dismissed, setDismissed] = useState(false)
  const { percent, missing } = calcCompletion(profile)

  if (percent === 100 || dismissed) return null

  const progressColor =
    percent < 35 ? "border-destructive/40 bg-destructive/5" :
    percent < 70 ? "border-amber-500/40 bg-amber-500/5" :
    "border-emerald-500/40 bg-emerald-500/5"

  const textColor =
    percent < 35 ? "text-destructive" :
    percent < 70 ? "text-amber-600 dark:text-amber-400" :
    "text-emerald-600 dark:text-emerald-400"

  const barColor =
    percent < 35 ? "bg-destructive" :
    percent < 70 ? "bg-amber-500" :
    "bg-emerald-500"

  return (
    <div className={cn("rounded-lg border px-4 py-3 flex items-center gap-4", progressColor)}>
      {/* Progress pill */}
      <div className="shrink-0 flex flex-col items-center gap-1 w-10">
        <span className={cn("text-lg font-black leading-none tabular-nums", textColor)}>
          {percent}%
        </span>
        <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={cn("h-full rounded-full", barColor)} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">
          Your profile is {percent}% complete
        </p>
        {missing.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            Add: {missing.slice(0, 4).map((f) => f.label).join(", ")}
            {missing.length > 4 && ` and ${missing.length - 4} more`}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" asChild>
          <Link href="/dashboard/settings">Complete now</Link>
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          aria-label="Dismiss"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} />
        </button>
      </div>
    </div>
  )
}
