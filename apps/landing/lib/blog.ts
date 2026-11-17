import type { ReactNode } from "react"
import { post as gstInvoiceFormat } from "@/content/blog/gst-invoice-format-india"
import { post as howToWriteAnInvoice } from "@/content/blog/how-to-write-an-invoice"
import { post as internationalClients } from "@/content/blog/invoice-international-clients"
import { post as paymentTerms } from "@/content/blog/invoice-payment-terms"
import { post as overdueInvoice } from "@/content/blog/overdue-invoice-email-templates"
import { post as quotationVsInvoice } from "@/content/blog/quotation-vs-invoice-vs-estimate"

export type BlogSection = { id: string; title: string; body: ReactNode }

export type BlogPost = {
  /** URL segment: /blog/<slug>. Changing it breaks links, so pick the search phrase once. */
  slug: string
  /** The H1 and the page title. Keep it under about 60 characters so search results show all of it. */
  title: string
  /** Meta description and the excerpt on the blog index. */
  description: string
  category: string
  /** Search phrases the post is written for. */
  keywords: string[]
  /** ISO dates (YYYY-MM-DD). Set updatedAt when the content changes. */
  publishedAt: string
  updatedAt?: string
  intro: ReactNode
  /** Each section becomes an H2 and an entry in the table of contents. */
  sections: BlogSection[]
}

// To publish a post: add a file to content/blog that exports `post`, then list it here.
// The index, the post page and the sitemap all read from this list.
export const POSTS: BlogPost[] = [
  howToWriteAnInvoice,
  paymentTerms,
  overdueInvoice,
  quotationVsInvoice,
  gstInvoiceFormat,
  internationalClients,
].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.slug === slug)
}

// A page that sets its own openGraph block drops the image inherited from app/opengraph-image.tsx,
// so blog pages name it explicitly.
export const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Infinity Invoices" }

/** "17 November 2026" */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}
