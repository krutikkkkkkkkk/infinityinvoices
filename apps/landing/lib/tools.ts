import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { tool as gstInvoiceGenerator } from "@/content/tools/gst-invoice-generator"
import { tool as invoiceTemplates } from "@/content/tools/invoice-templates"
import { tool as openSourceInvoiceGenerator } from "@/content/tools/open-source-invoice-generator"
import { tool as quotationMaker } from "@/content/tools/quotation-maker"

/**
 * A landing page written for one search phrase, served at /<slug>.
 * The home page already targets "free invoice maker" and "free invoice generator", so each page here
 * must answer a different search. Two pages chasing the same phrase compete with each other.
 */
export type ToolPage = {
  /** URL segment. Changing it breaks links, so pick the search phrase once. */
  slug: string
  /** Short name used in links, breadcrumbs and the footer. */
  name: string
  /** One line shown under the name wherever the page is linked from. */
  summary: string
  /** Page title. Keep it under about 60 characters so search results show all of it. */
  title: string
  /** Meta description, about 150 characters. */
  description: string
  keywords: string[]
  /** ISO date (YYYY-MM-DD). Set it whenever the content changes; the sitemap reports it. */
  updatedAt: string
  icon: LucideIcon
  eyebrow: string
  h1: string
  lead: string
  cta: string
  /** Second button in the hero. Defaults to the pricing section. */
  secondaryCta?: { label: string; href: string }
  facts: string[]
  features: {
    heading: string
    description?: string
    items: { icon: LucideIcon; title: string; description: string; tag?: string }[]
  }
  steps: { heading: string; items: { title: string; description: string }[] }
  /** Longer explanatory copy, written as plain tags like a blog post body. */
  guide: { heading: string; body: ReactNode }
  /** Plain text: also published as FAQ structured data. */
  faqs: { q: string; a: string }[]
  /** Slugs of blog posts to link to. */
  guides: string[]
}

// To add a page: add a file to content/tools that exports `tool`, then list it here.
// The page, the footer, the home page links and the sitemap all read from this list.
export const TOOLS: ToolPage[] = [invoiceTemplates, quotationMaker, gstInvoiceGenerator, openSourceInvoiceGenerator]

export function getTool(slug: string): ToolPage | undefined {
  return TOOLS.find((tool) => tool.slug === slug)
}
