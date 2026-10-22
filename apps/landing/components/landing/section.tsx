import type { ReactNode } from "react"
import { cn } from "@infinity/ui/lib/utils"
import { InView } from "./motion"

/** A white rounded container on the grey canvas. Every section of the page sits in one. */
export function Section({ id, children, className, inner }: { id?: string; children: ReactNode; className?: string; inner?: string }) {
  return (
    <section id={id} className={cn("scroll-mt-20 px-3 sm:px-4", className)}>
      <div className={cn("mx-auto max-w-6xl rounded-3xl border border-border/60 bg-card px-5 py-14 sm:px-10 sm:py-20", inner)}>
        {children}
      </div>
    </section>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground", className)}>
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      {children}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string
  title: string
  description?: string
  /** "split" puts the description in a right-hand column, as the reference layout does. */
  align?: "center" | "split"
}) {
  if (align === "split") {
    return (
      <InView reveal className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-12">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
        </div>
        {description && <p className="max-w-md text-pretty text-muted-foreground lg:justify-self-end">{description}</p>}
      </InView>
    )
  }
  return (
    <InView reveal className="mx-auto max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-pretty text-muted-foreground sm:text-lg">{description}</p>}
    </InView>
  )
}
