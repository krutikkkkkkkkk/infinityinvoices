"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  InvoiceIcon,
  FileExportIcon,
  Mail01Icon,
  Clock01Icon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Moon02Icon,
  Sun03Icon,
  UserMultipleIcon,
  FlashIcon,
} from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const faqs = [
  {
    q: "How do I get started?",
    a: "Sign up for free, add your business details, and create your first invoice in under 2 minutes. No credit card required.",
  },
  {
    q: "What's included in the free plan?",
    a: "The free plan includes 3 invoices per month, 3 quotations, PDF downloads, and the ability to share invoices via link.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes, you can upgrade to Pro or cancel anytime. Your data is always yours and can be exported.",
  },
  {
    q: "How does email sending work?",
    a: "Pro users can send invoices directly to clients via email. Clients receive a professional email with a link to view and pay.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, we use bank-level encryption and your data is stored securely on Supabase with row-level security.",
  },
]

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <HugeiconsIcon icon={InvoiceIcon} size={18} className="text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">InfinityInvoice</span>
          </Link>

          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="size-9"
              >
                <HugeiconsIcon
                  icon={theme === "dark" ? Sun03Icon : Moon02Icon}
                  size={18}
                />
              </Button>
            )}
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-chart-1/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              <HugeiconsIcon icon={SparklesIcon} size={12} className="mr-1" />
              Simple invoicing for modern businesses
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
              Create invoices in{" "}
              <span className="text-primary">seconds</span>, get paid{" "}
              <span className="text-chart-1">faster</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              The simplest way to create professional invoices, track payments, and manage your business finances. Free to start.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="h-12 px-8 text-base group">
                  Start for Free
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  View Demo
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required
            </p>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl transition-transform hover:scale-[1.02] duration-500">
              <Image
                src="/images/hero-art.jpg"
                alt="InfinityInvoice Dashboard"
                width={1200}
                height={600}
                className="w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features, beautifully simple
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
            {/* Large Card */}
            <Card className="md:col-span-2 md:row-span-2 group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="p-6 md:p-8 flex-1">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <HugeiconsIcon icon={InvoiceIcon} size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Professional Invoices</h3>
                  <p className="text-muted-foreground">
                    Create beautiful, customizable invoices with your branding. Add line items, taxes, discounts, and notes. Export to PDF or share via link.
                  </p>
                </div>
                <div className="relative h-48 md:h-64 overflow-hidden">
                  <Image
                    src="/images/feature-art.jpg"
                    alt="Invoice Preview"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                </div>
              </CardContent>
            </Card>

            {/* Small Cards */}
            <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-chart-1/50 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-chart-1/10 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <HugeiconsIcon icon={FileExportIcon} size={20} className="text-chart-1" />
                </div>
                <h3 className="font-semibold mb-1">PDF Export</h3>
                <p className="text-sm text-muted-foreground">
                  Download invoices as professional PDFs instantly
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <HugeiconsIcon icon={Mail01Icon} size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-1">
                  Email Delivery
                  <Badge variant="secondary" className="ml-2 text-xs">Pro</Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Send invoices directly to clients via email
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-destructive/50 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <HugeiconsIcon icon={Clock01Icon} size={20} className="text-destructive" />
                </div>
                <h3 className="font-semibold mb-1">Payment Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Track paid, pending, and overdue invoices
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-green-500/50 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <HugeiconsIcon icon={ShieldCheckIcon} size={20} className="text-green-500" />
                </div>
                <h3 className="font-semibold mb-1">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Bank-level encryption for your data
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <HugeiconsIcon icon={UserMultipleIcon} size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Client Management</h3>
                <p className="text-sm text-muted-foreground">
                  Store and manage all your client details
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-chart-1/50 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-chart-1/10 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <HugeiconsIcon icon={FlashIcon} size={20} className="text-chart-1" />
                </div>
                <h3 className="font-semibold mb-1">UPI QR Codes</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-generated QR codes for instant payments
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Free Plan */}
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="text-muted-foreground mt-1">Perfect for getting started</p>

                <div className="mt-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {["3 invoices per month", "3 quotations per month", "5 clients", "PDF downloads", "Share via link"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/auth/sign-up" className="mt-8 block">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative overflow-hidden border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                Popular
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold">Pro</h3>
                <p className="text-muted-foreground mt-1">For growing businesses</p>

                <div className="mt-6">
                  <span className="text-4xl font-bold">$5</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {["Unlimited invoices", "Unlimited quotations", "Unlimited clients", "Email invoices to clients", "Payment reminders", "Custom branding", "Priority support"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-chart-1 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/auth/sign-up" className="mt-8 block">
                  <Button className="w-full">Upgrade to Pro</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to simplify your invoicing?
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Join thousands of businesses using InfinityInvoice to get paid faster.
          </p>
          <Link href="/auth/sign-up" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base group">
              Start for Free
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-primary">
                <HugeiconsIcon icon={InvoiceIcon} size={14} className="text-primary-foreground" />
              </div>
              <span className="font-semibold">InfinityInvoice</span>
            </div>

            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} InfinityInvoice. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
