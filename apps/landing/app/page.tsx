import { Faq } from "@/components/landing/faq"
import { Cost } from "@/components/landing/cost"
import { FinalCta } from "@/components/landing/final-cta"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { MobileCta } from "@/components/landing/mobile-cta"
import { OpenSource } from "@/components/landing/open-source"
import { Pricing } from "@/components/landing/pricing"
import { Problem } from "@/components/landing/problem"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Why } from "@/components/landing/why"
import { LANDING_PLANS } from "@/lib/plans"
import { SITE_URL } from "@/lib/config"

// Lets search engines show the product with its prices.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Infinity Invoice",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: "Simple, open source invoicing for freelancers.",
  offers: LANDING_PLANS.map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    price: plan.price.replace("$", ""),
    priceCurrency: "USD",
  })),
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main className="space-y-4">
        <Hero />
        <Problem />
        <HowItWorks />
        <Why />
        <Cost />
        <Pricing />
        <OpenSource />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <MobileCta />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
    </div>
  )
}
