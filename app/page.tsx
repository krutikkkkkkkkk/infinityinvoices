import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  InvoiceIcon, 
  CheckmarkCircle02Icon, 
  File01Icon,
  UserGroupIcon,
  Mail01Icon,
  AnalyticsUpIcon,
  SecurityCheckIcon,
  Zap01Icon,
  ArrowRight02Icon
} from "@hugeicons/core-free-icons"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-950">
              <HugeiconsIcon icon={InvoiceIcon} size={18} />
            </div>
            <span>Infinity Invoice</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button className="bg-white text-zinc-950 hover:bg-zinc-200" asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-16">
        <section className="container mx-auto px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Now with UPI QR code payments
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl text-balance bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Professional Invoices, Zero Complexity
            </h1>
            <p className="mt-6 text-lg text-zinc-400 text-pretty max-w-2xl mx-auto leading-relaxed">
              Create stunning invoices and quotations in minutes. Built for freelancers, agencies, and small businesses who value their time.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-zinc-950 hover:bg-zinc-200 h-12 px-8 text-base" asChild>
                <Link href="/auth/sign-up">
                  Start for Free
                  <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 h-12 px-8 text-base" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="container mx-auto px-6 pb-24">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {/* Large Feature - Invoices */}
            <div className="group relative md:col-span-2 lg:col-span-2 lg:row-span-2 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all hover:border-zinc-700 hover:bg-zinc-900">
              <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <HugeiconsIcon icon={InvoiceIcon} size={24} />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Beautiful Invoices</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Create professional invoices with auto-calculated totals, tax handling, and discount support. Export to PDF with one click.
                </p>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Invoice #INV-001</span>
                      <span className="text-emerald-500 font-medium">Paid</span>
                    </div>
                    <div className="h-px bg-zinc-800" />
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Website Design</span>
                      <span className="font-medium">$2,500.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Development</span>
                      <span className="font-medium">$4,000.00</span>
                    </div>
                    <div className="h-px bg-zinc-800" />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-emerald-500">$6,500.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quotations */}
            <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <HugeiconsIcon icon={File01Icon} size={20} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quotations</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Send professional quotes and convert them to invoices with one click.
              </p>
            </div>

            {/* Clients */}
            <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                <HugeiconsIcon icon={UserGroupIcon} size={20} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Client Management</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Store client details and auto-fill them in new documents.
              </p>
            </div>

            {/* Email */}
            <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <HugeiconsIcon icon={Mail01Icon} size={20} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Delivery</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Send invoices directly to clients via email with tracking.
              </p>
            </div>

            {/* Analytics */}
            <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <HugeiconsIcon icon={AnalyticsUpIcon} size={20} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Track revenue, pending payments, and business insights.
              </p>
            </div>

            {/* Wide Feature - UPI */}
            <div className="group relative md:col-span-2 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900">
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 text-emerald-500">
                  <HugeiconsIcon icon={Zap01Icon} size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">UPI QR Code Payments</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Generate UPI QR codes automatically for each invoice. Clients can scan and pay instantly using any UPI app.
                  </p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="group relative md:col-span-1 lg:col-span-2 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900">
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
                  <HugeiconsIcon icon={SecurityCheckIcon} size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Your data is encrypted and stored securely. We never share your information with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-zinc-400">Start free, upgrade when you need more.</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {/* Free Plan */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-zinc-500">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {["5 invoices per month", "5 quotations per month", "5 emails per month", "Unlimited clients", "PDF export"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-400">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800" asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-3xl border border-emerald-500/50 bg-zinc-900/50 p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-medium text-zinc-950">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$2</span>
                  <span className="text-zinc-500">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {["Unlimited invoices", "Unlimited quotations", "Unlimited emails", "Unlimited clients", "Priority support", "Custom branding"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-400">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400" asChild>
                <Link href="/auth/sign-up">Upgrade to Pro</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 pb-24">
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-900/50 p-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-balance">Ready to streamline your invoicing?</h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Join thousands of freelancers and businesses who trust Infinity Invoice for their billing needs.
            </p>
            <Button size="lg" className="bg-white text-zinc-950 hover:bg-zinc-200 h-12 px-8" asChild>
              <Link href="/auth/sign-up">
                Create Your First Invoice
                <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-950">
                <HugeiconsIcon icon={InvoiceIcon} size={18} />
              </div>
              <span className="font-semibold">Infinity Invoice</span>
            </div>
            <p className="text-sm text-zinc-500">
              Built with Next.js and Supabase
            </p>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/auth/login" className="hover:text-zinc-300 transition-colors">Login</Link>
              <Link href="/auth/sign-up" className="hover:text-zinc-300 transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
