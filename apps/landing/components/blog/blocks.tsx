import type { ReactNode } from "react"
import { cn } from "@infinity/ui/lib/utils"
import { cardInset } from "@/components/landing/ui"

/** Typography for post bodies: paragraphs, lists, links and sub-headings written as plain tags. */
export const prose =
  "space-y-4 leading-relaxed text-pretty text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h3]:pt-2 [&_h3]:font-medium [&_h3]:text-foreground [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"

/**
 * Copyable sample text, such as an email template. Line breaks are kept.
 * With `columns`, spacing is kept too and the text is set in monospace, for samples laid out like a document.
 */
export function Example({ label, columns = false, children }: { label?: string; columns?: boolean; children: ReactNode }) {
  return (
    <figure className={cn(cardInset, "overflow-hidden")}>
      {label && (
        <figcaption className="border-b border-border/60 px-4 py-2.5 text-xs font-medium text-muted-foreground">{label}</figcaption>
      )}
      <div
        className={cn(
          "px-4 py-4 leading-relaxed text-foreground",
          // The theme's mono font is not loaded on this site, so name a system stack.
          columns
            ? "overflow-x-auto text-xs whitespace-pre [font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace]"
            : "text-sm whitespace-pre-line",
        )}
      >
        {children}
      </div>
    </figure>
  )
}

/** A short aside: a caveat, a tip, or a pointer to the product. */
export function Note({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5 text-sm">
      {title && <p className="font-medium text-foreground">{title}</p>}
      <div className={cn(title && "mt-1")}>{children}</div>
    </aside>
  )
}

/** A simple comparison table that scrolls sideways on narrow screens. */
export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className={cn(cardInset, "overflow-x-auto")}>
      <table className="w-full min-w-lg text-left text-sm">
        <thead>
          <tr className="border-b border-border/60">
            {head.map((cell) => (
              <th key={cell} scope="col" className="px-4 py-2.5 font-medium text-foreground">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={cn("px-4 py-2.5 align-top", j === 0 && "font-medium whitespace-nowrap text-foreground")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
