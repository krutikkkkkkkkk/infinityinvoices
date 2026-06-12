"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { Building2, Mail, Phone, MapPin, Receipt, ImageIcon, Landmark, Smartphone, CreditCard } from "lucide-react"
import type { Profile } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProfileField {
  key: keyof Profile
  label: string
  icon: React.ComponentType<any>
  group: "business" | "payment"
}

// gst_id is intentionally excluded — it's optional
const BUSINESS_FIELDS: ProfileField[] = [
  { key: "company_name",    label: "Company Name",   icon: Building2,  group: "business" },
  { key: "email",           label: "Business Email", icon: Mail,       group: "business" },
  { key: "phone",           label: "Phone Number",   icon: Phone,      group: "business" },
  { key: "company_address", label: "Address",        icon: MapPin,     group: "business" },
  { key: "logo_url",        label: "Company Logo",   icon: ImageIcon,  group: "business" },
]

// Optional informational field shown but not scored
const OPTIONAL_FIELDS: ProfileField[] = [
  { key: "gst_id", label: "GST / Tax ID (optional)", icon: Receipt, group: "business" },
]

const PAYMENT_FIELDS: ProfileField[] = [
  { key: "bank_name",    label: "Bank Details", icon: Landmark,   group: "payment" },
  { key: "upi_id",       label: "UPI ID",       icon: Smartphone, group: "payment" },
  { key: "paypal_email", label: "PayPal Email", icon: CreditCard, group: "payment" },
]

// Payment counts as 1 point if at least one method is filled.
// Business fields each count as 1 point. Total = BUSINESS_FIELDS.length + 1.
function calcCompletion(profile: Profile | null) {
  const total = BUSINESS_FIELDS.length + 1 // +1 for "at least one payment method"
  if (!profile) return { percent: 0, filled: 0, total, missingBusiness: BUSINESS_FIELDS, hasPayment: false }

  const filledBusiness = BUSINESS_FIELDS.filter((f) => !!profile[f.key])
  const hasPayment = PAYMENT_FIELDS.some((f) => !!profile[f.key])
  const filledCount = filledBusiness.length + (hasPayment ? 1 : 0)

  return {
    percent: Math.round((filledCount / total) * 100),
    filled: filledCount,
    total,
    missingBusiness: BUSINESS_FIELDS.filter((f) => !profile[f.key]),
    hasPayment,
  }
}

interface ProfileCompletionCardProps {
  profile: Profile | null
  compact?: boolean
}

export function ProfileCompletionCard({ profile, compact = false }: ProfileCompletionCardProps) {
  const { percent, filled, total, missingBusiness, hasPayment } = calcCompletion(profile)

  if (percent === 100) return null

  const isFieldDone = (key: keyof Profile) => !!profile?.[key]

  const progressColor =
    percent < 35 ? "bg-foreground/45" :
    percent < 70 ? "bg-foreground/65" :
    "bg-foreground"

  const missingLabels = [
    ...missingBusiness.map((f) => f.label),
    ...(!hasPayment ? ["Payment Method"] : []),
  ]

  if (compact) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium">Profile {percent}% complete</p>
              <span className="text-xs text-muted-foreground">{filled}/{total} steps</span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", progressColor)}
                style={{ width: `${percent}%` }}
              />
            </div>
            {missingLabels.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Missing: {missingLabels.slice(0, 3).join(", ")}
                {missingLabels.length > 3 && ` +${missingLabels.length - 3} more`}
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
                "text-foreground"
              )}
            >
              {percent}%
            </span>
            <span className="text-xs text-muted-foreground">{filled} of {total} steps</span>
          </div>
        </div>
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
            {BUSINESS_FIELDS.map((field) => {
              const done = isFieldDone(field.key)
              const Icon = field.icon
              return (
                <div
                  key={field.key}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    done ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  <Icon size={14} className={cn("shrink-0", done ? "text-foreground" : "text-muted-foreground/60")} />
                  <span className="flex-1 truncate">{field.label}</span>
                  {done
                    ? <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} className="text-foreground shrink-0" />
                    : <HugeiconsIcon icon={Cancel01Icon} size={13} className="text-muted-foreground/40 shrink-0" />
                  }
                </div>
              )
            })}
            {/* Optional GST field — shown but not scored */}
            {OPTIONAL_FIELDS.map((field) => {
              const done = isFieldDone(field.key)
              const Icon = field.icon
              return (
                <div
                  key={field.key}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors border border-dashed",
                    done ? "border-border bg-muted text-foreground" : "border-muted-foreground/20 bg-muted/30 text-muted-foreground"
                  )}
                >
                  <Icon size={14} className={cn("shrink-0", done ? "text-foreground" : "text-muted-foreground/40")} />
                  <span className="flex-1 truncate">{field.label}</span>
                  {done
                    ? <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} className="text-foreground shrink-0" />
                    : <span className="text-[10px] text-muted-foreground/50 shrink-0">optional</span>
                  }
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment Methods — at least one required */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Methods
            </p>
            <span className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              hasPayment
                ? "bg-muted text-foreground"
                : "bg-muted/70 text-muted-foreground"
            )}>
              {hasPayment ? "Satisfied" : "At least 1 required"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {PAYMENT_FIELDS.map((field) => {
              const done = isFieldDone(field.key)
              const Icon = field.icon
              return (
                <div
                  key={field.key}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    done ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  <Icon size={14} className={cn("shrink-0", done ? "text-foreground" : "text-muted-foreground/60")} />
                  <span className="flex-1 truncate">{field.label}</span>
                  {done
                    ? <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} className="text-foreground shrink-0" />
                    : <HugeiconsIcon icon={Cancel01Icon} size={13} className="text-muted-foreground/40 shrink-0" />
                  }
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
  const { percent, missingBusiness, hasPayment } = calcCompletion(profile)

  const missingLabels = [
    ...missingBusiness.map((f) => f.label),
    ...(!hasPayment ? ["Payment Method"] : []),
  ]

  if (percent === 100 || dismissed) return null

  const progressColor =
    "border-border bg-card"

  const textColor =
    "text-foreground"

  const barColor =
    percent < 35 ? "bg-foreground/45" :
    percent < 70 ? "bg-foreground/65" :
    "bg-foreground"

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
        {missingLabels.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            Add: {missingLabels.slice(0, 4).join(", ")}
            {missingLabels.length > 4 && ` and ${missingLabels.length - 4} more`}
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
