import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { FinalCta } from "@/components/landing/final-cta"
import { Eyebrow, Section } from "@/components/landing/section"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Pill, cardHover, cardInset } from "@/components/landing/ui"
import { POSTS, SHARE_IMAGE, formatPostDate } from "@/lib/blog"
import { SITE_URL } from "@/lib/config"

const TITLE = "Blog - Invoicing guides for freelancers | Infinity Invoices"
const DESCRIPTION =
  "Practical guides on writing invoices, payment terms, chasing overdue invoices, quotations, GST and billing international clients. Written for freelancers."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", url: "/blog", siteName: "Infinity Invoices", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

// Tells search engines this page is a list of articles and where each one lives.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Infinity Invoices Blog",
  url: `${SITE_URL}/blog`,
  description: DESCRIPTION,
  blogPost: POSTS.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
  })),
}

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main className="space-y-4 pt-4">
        <Section>
          <div className="max-w-2xl">
            <Eyebrow>Blog</Eyebrow>
            <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Invoicing guides for freelancers
            </h1>
            <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
              How to write an invoice, set payment terms, and get paid on time. Short, practical, and written for people
              who would rather be doing the work.
            </p>
          </div>

          <ul className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-2">
            {POSTS.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className={cn(
                    cardInset,
                    cardHover,
                    "group flex h-full flex-col p-5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:p-6",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                    <Pill tone="brand">{post.category}</Pill>
                    <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                  </div>
                  <h2 className="mt-4 font-heading text-xl font-semibold tracking-tight text-balance">{post.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-pretty text-muted-foreground">{post.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                    Read the guide
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
        <FinalCta />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c") }}
      />
    </div>
  )
}
