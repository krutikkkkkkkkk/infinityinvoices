import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, FileText } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import type { ToolPage } from "@/lib/tools"
import { IconChip, cardHover, cardInset } from "./ui"

type ToolLink = { href: string; icon: LucideIcon; name: string; summary: string }

const HOME: ToolLink = {
  href: "/",
  icon: FileText,
  name: "Free invoice maker",
  summary: "Make an invoice in 30 seconds and download the PDF.",
}

/**
 * Link cards to the pages in lib/tools.ts. The link text is each page's own search phrase.
 * `withHome` adds the home page first, for use on the tool pages themselves.
 */
export function ToolLinks({ tools, withHome = false, className }: { tools: ToolPage[]; withHome?: boolean; className?: string }) {
  const links: ToolLink[] = [
    ...(withHome ? [HOME] : []),
    ...tools.map((tool) => ({ href: `/${tool.slug}`, icon: tool.icon, name: tool.name, summary: tool.summary })),
  ]

  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4", className)}>
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={cn(
              cardInset,
              cardHover,
              "group flex h-full flex-col gap-4 p-5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            )}
          >
            <IconChip icon={link.icon} className="bg-card" />
            <span className="flex-1">
              <span className="block font-medium">{link.name}</span>
              <span className="mt-1 block text-sm text-pretty text-muted-foreground">{link.summary}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              Open
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
