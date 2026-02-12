import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Invoice01Icon,
  CheckmarkCircle02Icon,
  Rocket01Icon,
  Shield01Icon,
  FlashIcon,
  FileExportIcon,
  Mail01Icon,
  UserMultipleIcon,
  ArrowRight01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import Image from "next/image"
import { PLANS } from "@/lib/plans"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  const freePlan = PLANS.find((p) => p.id === "free")!
  const proPlan = PLANS.find((p) => p.id === "pro")!

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Wise style sticky nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon icon={Invoice01Icon} size={18} />
            </div>
            <span>Infinity Invoice</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero - Wise style split layout */}
        <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Copy */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
                <HugeiconsIcon icon={Rocket01Icon} size={14} />
                <span>Free to get started</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.1]">
                Professional invoices,{" "}
                <span className="text-primary">done in seconds</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
                Join thousands of freelancers and small businesses creating, sending, 
                and managing invoices with ease. Beautiful templates, instant PDF export, 
                and UPI QR codes built in.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Create invoices & quotations in under a minute",
                  "Auto-calculate totals with tax and discounts",
                  "Generate UPI QR codes for instant payments",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/auth/sign-up">
                    Create free account
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right - Invoice preview card (Wise calculator style) */}
            <div className="relative">
              <div className="rounded-2xl border bg-card p-1 shadow-xl">
                <Image
                  src="/images/invoice-preview.jpg"
                  alt="Invoice preview showing a professional invoice template"
                  width={600}
                  height={400}
                  className="rounded-xl w-full"
                  priority
                />
              </div>
              {/* Floating badges */}
              <div className="absolute -left-4 top-1/4 rounded-xl border bg-card px-4 py-3 shadow-lg hidden lg:block">
                <p className="text-xs text-muted-foreground">PDF Ready</p>
                <p className="text-sm font-semibold mt-0.5">Export in 1 click</p>
              </div>
              <div className="absolute -right-4 bottom-1/4 rounded-xl border bg-card px-4 py-3 shadow-lg hidden lg:block">
                <p className="text-xs text-muted-foreground">UPI Payments</p>
                <p className="text-sm font-semibold mt-0.5">QR code included</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof bar */}
        <section className="border-y bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-center">
              <div>
                <p className="text-2xl font-bold">5,000+</p>
                <p className="text-sm text-muted-foreground mt-1">Invoices created</p>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <p className="text-2xl font-bold">1,200+</p>
                <p className="text-sm text-muted-foreground mt-1">Active users</p>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <p className="text-2xl font-bold">4.8/5</p>
                <p className="text-sm text-muted-foreground mt-1">User rating</p>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <p className="text-2xl font-bold">30 sec</p>
                <p className="text-sm text-muted-foreground mt-1">Avg. invoice time</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works - Wise step style */}
        <section id="how-it-works" className="container mx-auto px-4 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              How to create an invoice
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Three simple steps to get paid faster
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Fill in the details",
                description: "Enter your business info, client details, and line items. Auto-calculations handle the math.",
                icon: Invoice01Icon,
              },
              {
                step: "02",
                title: "Choose payment method",
                description: "Add UPI, PayPal, or bank details. A QR code is generated automatically for UPI payments.",
                icon: FlashIcon,
              },
              {
                step: "03",
                title: "Send or download",
                description: "Export as PDF, share via link, or email directly to your client. Track status in your dashboard.",
                icon: FileExportIcon,
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                  <HugeiconsIcon icon={item.icon} size={22} />
                </div>
                <p className="text-xs font-mono text-muted-foreground mb-2">{item.step}</p>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features - Wise card grid style */}
        <section id="features" className="bg-muted/30 border-y">
          <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-28">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Everything you need to get paid
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                Built for Indian freelancers and small businesses
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Invoice01Icon,
                  title: "Invoices & Quotations",
                  description: "Create both document types with shared templates. Convert quotations to invoices in one click.",
                },
                {
                  icon: FlashIcon,
                  title: "UPI QR Codes",
                  description: "Auto-generated QR codes on every invoice. Clients scan and pay instantly via any UPI app.",
                },
                {
                  icon: FileExportIcon,
                  title: "PDF Export",
                  description: "Download print-ready PDFs with your branding. Perfectly formatted for A4 paper.",
                },
                {
                  icon: UserMultipleIcon,
                  title: "Client Management",
                  description: "Store client details once, auto-fill on every new invoice. Track all documents per client.",
                },
                {
                  icon: Mail01Icon,
                  title: "Email Invoices",
                  description: "Send invoices directly to clients via email. Track delivery and status from your dashboard.",
                  pro: true,
                },
                {
                  icon: Shield01Icon,
                  title: "Secure & Private",
                  description: "Your data is encrypted and stored securely. We never share your information with third parties.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <HugeiconsIcon icon={feature.icon} size={20} />
                    </div>
                    {feature.pro && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Pro
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard preview - Wise illustration style */}
        <section className="container mx-auto px-4 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border bg-card p-1 shadow-xl">
                <Image
                  src="/images/dashboard-preview.jpg"
                  alt="Dashboard preview showing invoice management interface"
                  width={600}
                  height={400}
                  className="rounded-xl w-full"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 max-w-lg">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Track everything from one dashboard
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed text-pretty">
                See all your invoices, quotations, and clients in one place. 
                Filter by status, search by name, and stay on top of your business.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Filter invoices by status, date, and client",
                  "Track paid, pending, and overdue documents",
                  "Monitor monthly usage and limits",
                  "Manage client details and history",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing - Wise comparison style */}
        <section id="pricing" className="bg-muted/30 border-y">
          <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-28">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                Start free, upgrade when you need more
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-xl border bg-card p-8">
                <h3 className="text-lg font-semibold">{freePlan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{freePlan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Button variant="outline" className="w-full mt-6" asChild>
                  <Link href="/auth/sign-up">Get started</Link>
                </Button>
                <ul className="mt-8 space-y-3">
                  {freePlan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-muted-foreground shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="rounded-xl border-2 border-primary bg-card p-8 relative">
                <div className="absolute -top-3 left-8">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{proPlan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{proPlan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${proPlan.priceInCents / 100}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Button className="w-full mt-6" asChild>
                  <Link href="/auth/sign-up">Start free trial</Link>
                </Button>
                <ul className="mt-8 space-y-3">
                  {proPlan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Security - Wise trust section */}
        <section className="container mx-auto px-4 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              Your data is safe with us
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Built on Supabase with enterprise-grade security
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            {[
              {
                icon: Shield01Icon,
                title: "End-to-end encryption",
                description: "All data is encrypted in transit and at rest. Your invoices are secure.",
              },
              {
                icon: StarIcon,
                title: "99.9% uptime",
                description: "Built on reliable infrastructure. Your invoices are always accessible.",
              },
              {
                icon: Rocket01Icon,
                title: "Regular backups",
                description: "Automatic daily backups ensure your data is never lost.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                  <HugeiconsIcon icon={item.icon} size={22} />
                </div>
                <h3 className="font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA - Wise bottom CTA style */}
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-28">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Ready to get paid faster?
              </h2>
              <p className="mt-4 text-lg opacity-90 text-pretty">
                Create your first invoice in under 30 seconds. No credit card required.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-8 text-base"
                  asChild
                >
                  <Link href="/auth/sign-up">
                    Create free account
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Clean minimal */}
      <footer className="border-t">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5 font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={Invoice01Icon} size={14} />
              </div>
              <span>Infinity Invoice</span>
            </div>
            <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Log in</Link>
              <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">Sign up</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              Built with Next.js and Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
