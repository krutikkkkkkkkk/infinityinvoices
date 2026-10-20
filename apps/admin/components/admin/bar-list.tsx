import { cn } from "@/lib/utils"

/** Horizontal bars with a label and formatted value, scaled to the largest item. */
export function BarList({
  items,
  className,
}: {
  items: { label: string; value: number; display: string }[]
  className?: string
}) {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex flex-col gap-1.5">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium tabular-nums">{item.display}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
