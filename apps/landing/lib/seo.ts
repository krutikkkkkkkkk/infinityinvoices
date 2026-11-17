import type { Metadata } from "next"
import { GITHUB_URL, SITE_URL, SUPPORT_EMAIL } from "./config"

export const SITE_NAME = "Infinity Invoices"

// A page that sets its own openGraph block drops the image inherited from app/opengraph-image.tsx,
// so every page names it explicitly.
export const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Infinity Invoices, a free invoice maker" }

/**
 * Title, description, canonical URL and social cards for a public page.
 * `path` is the page's own path ("/" or "/quotation-maker"): it becomes the canonical URL,
 * so every indexable page must pass its own.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string
  description: string
  path: string
  keywords?: string[]
}): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, siteName: SITE_NAME, locale: "en_US", title, description, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
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
