import type { ComponentType, ReactNode } from "react"
import { cn } from "@infinity/ui/lib/utils"

// Mirrors the dashboard primitives in apps/web (components/ui/button.tsx, card.tsx and
// components/dashboard/overview.tsx) so the landing page reads as the same product.

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.97]"

export const button = {
  // Shape and behaviour only, for one-off colourways (e.g. on the dark hero).
  base: BUTTON_BASE,
  // Ink pill: the primary action on any surface.
  default: cn(BUTTON_BASE, "bg-foreground text-background shadow-[0_1px_2px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.08)] hover:bg-foreground/85"),
  // Brand pill for the few places that should carry the accent color.
  brand: cn(BUTTON_BASE, "bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-primary/90"),
  // White pill: for actions sitting on the grey canvas.
  outline: cn(BUTTON_BASE, "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-border hover:bg-muted dark:hover:bg-accent"),
  ghost: cn(BUTTON_BASE, "hover:bg-muted hover:text-foreground"),
}

export const buttonSize = {
  default: "h-10 px-5",
  lg: "h-11 px-6 text-[15px]",
  icon: "size-9",
}

export const card =
  "rounded-2xl border border-border/60 bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.03)] dark:border-border"

/** Grey inset card for use inside a white section container. */
export const cardInset = "rounded-2xl border border-border/60 bg-background text-foreground"

export const cardHover =
  "transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.18)]"

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(card, className)}>{children}</div>
}

export function IconChip({ icon: Icon, className }: { icon: ComponentType<{ className?: string }>; className?: string }) {
  return (
    <span
      className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground ring-1 ring-border/60", className)}
      aria-hidden
    >
      <Icon className="size-4" />
    </span>
  )
}

const PILL_TONES = {
  neutral: "bg-muted text-muted-foreground",
  brand: "bg-primary/10 text-primary",
  good: "bg-success/10 text-success",
  critical: "bg-destructive/10 text-destructive",
} as const

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode
  tone?: keyof typeof PILL_TONES
  className?: string
}) {
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", PILL_TONES[tone], className)}>
      {children}
    </span>
  )
}

/** Header row used at the top of every card: icon chip, title, optional description. */
export function CardHeading({
  icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <IconChip icon={icon} className="bg-card" />
      <div className="min-w-0 flex-1 space-y-0.5 pt-0.5">
        <h3 className="text-sm leading-none font-medium">{title}</h3>
        {description && <p className="text-xs text-pretty text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
