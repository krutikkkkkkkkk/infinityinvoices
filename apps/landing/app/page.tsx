import type { Metadata } from "next"
import { Cost } from "@/components/landing/cost"
import { Faq, HOME_FAQS } from "@/components/landing/faq"
import { FinalCta } from "@/components/landing/final-cta"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Included } from "@/components/landing/included"
import { MobileCta } from "@/components/landing/mobile-cta"
import { OpenSource } from "@/components/landing/open-source"
import { Pricing } from "@/components/landing/pricing"
import { Problem } from "@/components/landing/problem"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Why } from "@/components/landing/why"
import { JsonLd } from "@/components/seo/json-ld"
import { APP_URL, GITHUB_URL, SITE_URL } from "@/lib/config"
import { LANDING_PLANS } from "@/lib/plans"
import { SITE_NAME, SOFTWARE_ID, faqLd, graph, organizationLd, pageMetadata, websiteLd } from "@/lib/seo"

const DESCRIPTION =
  "Free invoice maker for freelancers and small businesses. Create a professional invoice in 30 seconds, download the PDF and get paid. No credit card needed."

// The home page is the one that targets "free invoice maker" and "free invoice generator".
export const metadata: Metadata = pageMetadata({
  title: "Free Invoice Maker & Generator Online | Infinity Invoices",
  description: DESCRIPTION,
  path: "/",
  keywords: [
    "free invoice maker",
    "free invoice generator",
    "invoice maker",
    "invoice generator",
    "online invoice maker",
    "create invoice online free",
    "invoice maker for freelancers",
    "free invoicing software",
    "open source invoicing",
  ],
})

// Tells search engines who publishes the site, what the product is and what it costs,
// and repeats the FAQ in a form they can quote.
const STRUCTURED_DATA = graph(
  organizationLd,
  websiteLd,
  {
    "@type": "SoftwareApplication",
    "@id": SOFTWARE_ID,
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Invoicing software",
    operatingSystem: "Web",
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    description: DESCRIPTION,
    isAccessibleForFree: true,
    license: "https://opensource.org/license/mit",
    publisher: { "@id": organizationLd["@id"] },
    sameAs: [GITHUB_URL],
    featureList: [
      "Create and download PDF invoices",
      "Quotations that convert to invoices",
      "Six invoice templates",
      "Tax rate per line item for GST, VAT and sales tax",
      "15 currencies",
      "UPI QR codes, bank details and PayPal on the invoice",
      "Payment tracking and reminders",
      "Recurring invoices",
    ],
    offers: LANDING_PLANS.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      description: plan.description,
      price: plan.price.replace("$", ""),
      priceCurrency: "USD",
      url: `${APP_URL}${plan.path}`,
    })),
  },
  faqLd(HOME_FAQS),
)

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main className="space-y-4">
        <Hero />
        <Problem />
        <HowItWorks />
        <Included />
        <Why />
        <Cost />
        <Pricing />
        <OpenSource />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <MobileCta />
      <JsonLd data={STRUCTURED_DATA} />
    </div>
  )
}
