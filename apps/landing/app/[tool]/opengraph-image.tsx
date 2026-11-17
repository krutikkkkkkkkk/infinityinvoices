import { notFound } from "next/navigation"
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og"
import { getTool } from "@/lib/tools"

export const alt = "Infinity Invoices: free invoicing tools for freelancers."
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

// One card per page in lib/tools.ts, carrying that page's own headline.
export default async function OpengraphImage({ params }: { params: Promise<{ tool: string }> }) {
  const tool = getTool((await params).tool)
  if (!tool) notFound()
  return ogImage({ eyebrow: tool.eyebrow, title: tool.h1 })
}
