import { Faq } from "@/components/landing/faq"
import { FinalCta } from "@/components/landing/final-cta"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { OpenSource } from "@/components/landing/open-source"
import { Pricing } from "@/components/landing/pricing"
import { Problem } from "@/components/landing/problem"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Why } from "@/components/landing/why"

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main className="space-y-4">
        <Hero />
        <Problem />
        <HowItWorks />
        <Why />
        <Pricing />
        <OpenSource />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
