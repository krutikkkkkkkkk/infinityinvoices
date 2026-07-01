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
            Get started with 3 free invoices per month. Upgrade to Pro for unlimited invoices.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border transition-all ${
                plan.id === "pro"
                  ? "border-purple-500 bg-purple-50/50 shadow-lg md:scale-105"
                  : "border-border bg-card"
              }`}
            >
              <div className="p-8">
                {/* Plan Header */}
                <div className="mb-6">
                  {plan.id === "pro" && (
                    <div className="inline-block px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold mb-2">
                      Most Popular
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-6 pb-6 border-b border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {plan.priceInCents === 0 ? "Free" : `$${(plan.priceInCents / 100).toFixed(0)}`}
                    </span>
                    {plan.priceInCents > 0 && (
                      <span className="text-muted-foreground">
                        /{plan.priceBillingCycle || "month"}
                      </span>
                    )}
                  </div>
                  {plan.priceInCents === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      3 invoices per month, then upgrade for unlimited
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                  <Button
                    asChild
                    className="w-full"
                    variant={plan.id === "pro" ? "default" : "outline"}
                  >
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    No credit card required
                  </p>
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
              <h3 className="font-semibold mb-2">Why is everything free right now?</h3>
              <p className="text-muted-foreground text-sm">
                We're still building and want to get feedback from real users. Everything is free to use
                while we develop the platform. We may introduce pricing in the future, but all current
                users will have lifetime access to their features.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Will I lose access if I don't upgrade?</h3>
              <p className="text-muted-foreground text-sm">
                No. All current users will maintain their access to the features they're using, even
                if we introduce paid plans in the future. Your data and invoices are always yours.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do I need a credit card to sign up?</h3>
              <p className="text-muted-foreground text-sm">
                No. You can sign up completely free with just an email and password. No credit card
                required at any time.
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
