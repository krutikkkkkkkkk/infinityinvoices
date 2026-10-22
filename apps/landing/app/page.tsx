import { About } from "@/components/landing/about"
import { BentoGrid } from "@/components/landing/bento-grid"
import { Faq } from "@/components/landing/faq"
import { FinalCta } from "@/components/landing/final-cta"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Pricing } from "@/components/landing/pricing"
import { Security } from "@/components/landing/security"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Spotlight } from "@/components/landing/spotlight"
import { UseCases } from "@/components/landing/use-cases"
import { Why } from "@/components/landing/why"

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main className="space-y-4">
        <Hero />
        <About />
        <Why />
        <HowItWorks />
        <BentoGrid />
        <UseCases />
        <Spotlight />
        <Security />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
