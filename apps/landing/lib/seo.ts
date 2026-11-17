import type { Metadata } from "next"
import { GITHUB_URL, SITE_URL, SUPPORT_EMAIL } from "./config"

export const SITE_NAME = "Infinity Invoices"

/**
 * The share card for a page. Cards are drawn by the opengraph-image.tsx next to each route (see lib/og.tsx)
 * and served at <route>/opengraph-image. A page that sets its own openGraph block does not pick its card
 * up automatically, so every page names it explicitly.
 *
 * Pass `path` only for a route that has its own opengraph-image.tsx; without it the site-wide card is used.
 */
export function shareImage(alt: string, path = "") {
  return { url: `${path}/opengraph-image`, width: 1200, height: 630, alt }
}

export const SHARE_IMAGE = shareImage("Infinity Invoices, a free invoice maker for freelancers")

/**
 * Title, description, canonical URL and social cards for a public page.
 * `path` is the page's own path ("/" or "/quotation-maker"): it becomes the canonical URL,
 * so every indexable page must pass its own. `image` defaults to the site-wide share card.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  image = SHARE_IMAGE,
}: {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: ReturnType<typeof shareImage>
}): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, siteName: SITE_NAME, locale: "en_US", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  }
}

// Structured data (schema.org JSON-LD). Entities carry an @id so pages can point at them
// instead of repeating them.
const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
export const SOFTWARE_ID = `${SITE_URL}/#software`

export const organizationLd = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/android-chrome-512x512.png`,
  email: SUPPORT_EMAIL,
  sameAs: [GITHUB_URL],
}

export const websiteLd = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en",
  publisher: { "@id": ORGANIZATION_ID },
}

/** The trail shown in search results in place of the raw URL. Paths are relative to the site root. */
export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(({ name, path }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_URL}${path === "/" ? "" : path}`,
    })),
  }
}

/** Questions and answers exactly as they appear on the page. */
export function faqLd(faqs: readonly { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  }
}

/** Wraps entities in one schema.org graph for a single script tag. */
export function graph(...entities: object[]) {
  return { "@context": "https://schema.org", "@graph": entities }
}
