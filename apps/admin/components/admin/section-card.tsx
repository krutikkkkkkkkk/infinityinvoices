import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** Card with a title row, for wrapping tables and lists. */
export function SectionCard({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="h-28 text-center text-sm text-muted-foreground">
        {children}
      </td>
    </tr>
  )
}

/** Consistent horizontal padding for table cells inside a SectionCard. */
export const TABLE_EDGE = "[&_th:first-child]:pl-4 [&_td:first-child]:pl-4 sm:[&_th:first-child]:pl-5 sm:[&_td:first-child]:pl-5 [&_th:last-child]:pr-4 [&_td:last-child]:pr-4 sm:[&_th:last-child]:pr-5 sm:[&_td:last-child]:pr-5"
