import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { prose } from "@/components/blog/blocks"
import { FinalCta } from "@/components/landing/final-cta"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Pill, card, cardHover } from "@/components/landing/ui"
import { POSTS, formatPostDate, getPost } from "@/lib/blog"
import { SITE_URL } from "@/lib/config"
import { shareImage } from "@/lib/seo"

type Props = { params: Promise<{ slug: string }> }

// Every post is known at build time, so the pages are prerendered and any other slug is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}

  const url = `/blog/${post.slug}`
  const image = shareImage(post.title, url)
  return {
    title: `${post.title} - Infinity Invoices`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: "Infinity Invoices",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [image.url] },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const url = `${SITE_URL}/blog/${post.slug}`
  const related = POSTS.filter((other) => other.slug !== post.slug).slice(0, 2)

  // Article details for search results, plus the Home > Blog > Post trail.
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      keywords: post.keywords.join(", "),
      articleSection: post.category,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
      mainEntityOfPage: url,
      image: `${url}/opengraph-image`,
      author: { "@type": "Organization", name: "Infinity Invoices", url: SITE_URL },
      publisher: { "@type": "Organization", name: "Infinity Invoices", url: SITE_URL, logo: `${SITE_URL}/logo.svg` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ]

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            All guides
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <Pill tone="brand">{post.category}</Pill>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <span>
                Updated <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
              </span>
            )}
          </div>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{post.title}</h1>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-8 lg:max-w-none lg:grid-cols-[14rem_1fr] lg:gap-12">
          <nav aria-label="On this page" className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <p className="px-2 text-xs font-medium text-muted-foreground">On this page</p>
            <ol className="mt-2 space-y-1 text-sm">
              {post.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* min-w-0 lets wide tables and samples scroll inside the card instead of stretching the grid. */}
          <article className={cn(card, "min-w-0 px-5 py-8 sm:px-10 sm:py-10")}>
            <div className={cn(prose, "text-lg")}>{post.intro}</div>
            {post.sections.map((section) => (
              <section key={section.id} id={section.id} className="mt-10 scroll-mt-20">
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">{section.title}</h2>
                <div className={cn(prose, "mt-4")}>{section.body}</div>
              </section>
            ))}
          </article>
        </div>

        <section aria-labelledby="keep-reading" className="mt-14">
          <h2 id="keep-reading" className="font-heading text-2xl font-semibold tracking-tight">
            Keep reading
          </h2>
          <ul className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2">
            {related.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/blog/${other.slug}`}
                  className={cn(
                    card,
                    cardHover,
                    "group flex h-full flex-col p-5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:p-6",
                  )}
                >
                  <Pill tone="brand" className="self-start">
                    {other.category}
                  </Pill>
                  <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight text-balance">{other.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-pretty text-muted-foreground">{other.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                    Read the guide
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <FinalCta />
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </div>
  )
}
