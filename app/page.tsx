import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Invoice01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  const features = [
    "Create professional invoices and quotations",
    "Auto-calculate totals with tax and discounts",
    "Generate UPI QR codes for easy payments",
    "Export to PDF with print-friendly styling",
    "Convert quotations to invoices instantly",
    "Manage clients and track documents",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <HugeiconsIcon icon={Invoice01Icon} size={20} />
            <span>Infinity Invoice</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
            Professional Invoices Made Simple
          </h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Create, manage, and send beautiful invoices and quotations in minutes.
            Built for freelancers and small businesses.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-center text-2xl font-semibold mb-8">
            Everything you need
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border p-4"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="text-primary mt-0.5 shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Next.js and Supabase</p>
        </div>
      </footer>
    </div>
  )
}
