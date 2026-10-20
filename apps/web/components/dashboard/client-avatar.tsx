import { cn } from "@/lib/utils"

// A small fixed set of soft tints; the client name picks one so it stays stable across pages.
const TINTS = [
  "bg-[oklch(0.93_0.05_277)] text-[oklch(0.4_0.15_277)] dark:bg-[oklch(0.32_0.08_277)] dark:text-[oklch(0.88_0.06_277)]",
  "bg-[oklch(0.93_0.05_160)] text-[oklch(0.4_0.1_160)] dark:bg-[oklch(0.32_0.06_160)] dark:text-[oklch(0.88_0.06_160)]",
  "bg-[oklch(0.94_0.05_70)] text-[oklch(0.45_0.11_60)] dark:bg-[oklch(0.33_0.06_60)] dark:text-[oklch(0.9_0.06_70)]",
  "bg-[oklch(0.93_0.05_20)] text-[oklch(0.45_0.14_20)] dark:bg-[oklch(0.32_0.07_20)] dark:text-[oklch(0.88_0.06_20)]",
  "bg-[oklch(0.93_0.05_230)] text-[oklch(0.42_0.12_230)] dark:bg-[oklch(0.32_0.06_230)] dark:text-[oklch(0.88_0.06_230)]",
  "bg-[oklch(0.93_0.05_320)] text-[oklch(0.42_0.14_320)] dark:bg-[oklch(0.32_0.07_320)] dark:text-[oklch(0.88_0.06_320)]",
]

export function initials(name: string) {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean)
  return ((words[0]?.[0] ?? "?") + (words.length > 1 ? words[1][0] : words[0]?.[1] ?? "")).toUpperCase()
}

export function ClientAvatar({ name, className }: { name: string; className?: string }) {
  const hash = Array.from(name).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full font-semibold tracking-tight",
        TINTS[hash % TINTS.length],
        className
      )}
    >
      {initials(name)}
    </span>
  )
}
