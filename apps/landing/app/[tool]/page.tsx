import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, Check, ChevronRight } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { prose } from "@/components/blog/blocks"
import { Faq } from "@/components/landing/faq"
import { FinalCta } from "@/components/landing/final-cta"
import { Eyebrow, Section, SectionHeading } from "@/components/landing/section"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { ToolLinks } from "@/components/landing/tool-links"
import { IconChip, Pill, button, buttonSize, cardHover, cardInset } from "@/components/landing/ui"
import { JsonLd } from "@/components/seo/json-ld"
import { getPost } from "@/lib/blog"
import { APP_URL, SITE_URL } from "@/lib/config"
import { SOFTWARE_ID, breadcrumbLd, faqLd, graph, pageMetadata, shareImage } from "@/lib/seo"
import { TOOLS, getTool } from "@/lib/tools"

type Props = { params: Promise<{ tool: string }> }

// Every page is listed in lib/tools.ts, so they are prerendered and any other path is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ tool: tool.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getTool((await params).tool)
  if (!tool) return {}
  const path = `/${tool.slug}`
  return pageMetadata({
    title: tool.title,
    description: tool.description,
    path,
    keywords: tool.keywords,
    image: shareImage(tool.h1, path),
  })
}

export default async function ToolPage({ params }: Props) {
  const tool = getTool((await params).tool)
  if (!tool) notFound()

  const path = `/${tool.slug}`
  const others = TOOLS.filter((other) => other.slug !== tool.slug)
  const guides = tool.guides.map(getPost).filter((post) => post !== undefined)
  const secondaryCta = tool.secondaryCta ?? { label: "See pricing", href: "/#pricing" }

  const structuredData = graph(
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}${path}`,
      url: `${SITE_URL}${path}`,
      name: tool.title,
      description: tool.description,
      dateModified: tool.updatedAt,
      inLanguage: "en",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": SOFTWARE_ID },
    },
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: tool.name, path },
    ]),
    faqLd(tool.faqs),
  )

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main className="space-y-4 pt-4">
        <Section>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li aria-current="page" className="text-foreground">
                {tool.name}
              </li>
            </ol>
          </nav>

          <div className="mt-8 max-w-3xl">
            <Eyebrow>{tool.eyebrow}</Eyebrow>
            <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{tool.h1}</h1>
            <p className="mt-5 max-w-2xl text-pretty text-muted-foreground sm:text-lg">{tool.lead}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={`${APP_URL}/auth/sign-up`} className={cn(button.brand, buttonSize.lg, "group")}>
                {tool.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </a>
              <a href={secondaryCta.href} className={cn(button.outline, buttonSize.lg)}>
                {secondaryCta.label}
              </a>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {tool.facts.map((fact) => (
                <li key={fact} className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" aria-hidden />
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="features">
          <SectionHeading eyebrow="What you get" title={tool.features.heading} description={tool.features.description} />
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {tool.features.items.map(({ icon, title, description, tag }) => (
              <li key={title} className={cn(cardInset, "flex flex-col gap-4 p-5 sm:p-6")}>
                <div className="flex items-center justify-between gap-3">
                  <IconChip icon={icon} className="bg-card" />
                  {tag && <Pill tone={tag === "Free" ? "good" : "brand"}>{tag}</Pill>}
                </div>
                <div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="how-to">
          <SectionHeading eyebrow="Step by step" title={tool.steps.heading} />
          <ol className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {tool.steps.items.map(({ title, description }, i) => (
              <li key={title} className={cn(cardInset, "flex flex-col gap-4 p-5 sm:p-6")}>
                <span className="text-xs font-medium text-muted-foreground tabular-nums">Step {i + 1}</span>
                <div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="guide">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{tool.guide.heading}</h2>
            <div className={cn(prose, "mt-6")}>{tool.guide.body}</div>
          </div>
        </Section>

        <Faq faqs={tool.faqs} title={`${tool.name}: questions, answered`} />

        <Section id="more">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">More free invoicing tools</h2>
          <ToolLinks tools={others} withHome className="mt-5" />

          {guides.length > 0 && (
            <>
              <h2 className="mt-12 font-heading text-2xl font-semibold tracking-tight">Guides worth reading next</h2>
              <ul className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2">
                {guides.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className={cn(
                        cardInset,
                        cardHover,
                        "group flex h-full flex-col p-5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:p-6",
                      )}
                    >
                      <Pill tone="brand" className="self-start">
                        {post.category}
                      </Pill>
                      <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight text-balance">{post.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-pretty text-muted-foreground">{post.description}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                        Read the guide
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>

        <FinalCta />
      </main>
      <SiteFooter />
      <JsonLd data={structuredData} />
    </div>
  )
}
