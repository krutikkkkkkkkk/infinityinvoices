import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"
import { PLANS } from "@/lib/plans"

export const metadata = {
  title: "Pricing - Infinity Invoice",
  description: "Simple, transparent pricing for your invoicing needs",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free with 5 invoices and 5 quotations a month. Upgrade to Pro when you need more.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
            className={`rounded-lg border transition-all ${
              plan.id === "pro"
                ? "border-border bg-card shadow-lg md:scale-105"
                : "border-border bg-card"
            }`}
            >
              <div className="p-8">
                {/* Plan Header */}
                <div className="mb-6">
                  {plan.id === "pro" && (
                    <div className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-2 shadow-md">
                      Most Popular
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                  <p className={`text-sm ${plan.id === "pro" ? "text-foreground/70" : "text-muted-foreground"}`}>{plan.description}</p>
                </div>

                {/* Pricing */}
                {plan.priceInCents > 0 && (
                  <div className="mb-6 pb-6 border-b border-border">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">${(plan.priceInCents / 100).toFixed(0)}</span>
                      <span className="text-muted-foreground">/{plan.priceBillingCycle || "month"}</span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <div className="mb-8">
                  <Button
                    asChild
                    className="w-full"
                    variant={plan.id === "pro" ? "default" : "outline"}
                  >
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits Info */}
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-xs text-muted-foreground font-semibold mb-3">Limits:</p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>
                      • Invoices: {plan.limits.invoicesPerMonth === -1 ? "Unlimited" : plan.limits.invoicesPerMonth}
                    </li>
                    <li>
                      • Quotations: {plan.limits.quotationsPerMonth === -1 ? "Unlimited" : plan.limits.quotationsPerMonth}
                    </li>
                    <li>
                      • Clients: {plan.limits.clients === -1 ? "Unlimited" : plan.limits.clients}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">What happens when I reach the Free limit?</h3>
              <p className="text-muted-foreground text-sm">
                You can keep viewing, editing, downloading and sharing your existing documents. New invoices
                and quotations unlock again at the start of next month, or right away when you upgrade to Pro.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Will I lose my data if I don&apos;t upgrade?</h3>
              <p className="text-muted-foreground text-sm">
                No. Everything you&apos;ve created stays in your account on the Free plan. Your data and
                invoices are always yours.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-muted-foreground text-sm">
                Yes. You can upgrade or downgrade your plan at any time from your account settings.
                Changes take effect immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
