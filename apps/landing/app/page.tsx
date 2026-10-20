import Link from "next/link"
import { Calculator, FileText, Globe, Mail, QrCode, Share2 } from "lucide-react"
import { APP_URL } from "@/lib/config"

const features = [
  {
    icon: FileText,
    title: "Invoices & quotations",
    description: "Build professional invoices and quotations from ready-made templates with your own branding.",
  },
  {
    icon: Calculator,
    title: "Auto-calculations",
    description: "Taxes, discounts and totals are calculated for you as you add line items.",
  },
  {
    icon: QrCode,
    title: "UPI QR codes",
    description: "Add a UPI QR code to every invoice so clients can pay in seconds.",
  },
  {
    icon: Globe,
    title: "Multi-currency",
    description: "Bill clients in their own currency with a default currency for your business.",
  },
  {
    icon: Mail,
    title: "Email & reminders",
    description: "Send invoices straight to clients' inboxes and follow up with reminders.",
  },
  {
    icon: Share2,
    title: "PDF & share links",
    description: "Download pixel-perfect PDFs or share an invoice with a single link.",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
          <img src="/logo.svg" alt="" className="h-7 w-7" />
          Infinity Invoice
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <a href={`${APP_URL}/auth/login`} className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground">
            Log in
          </a>
          <a
            href={`${APP_URL}/auth/sign-up`}
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get started
          </a>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-6xl">
            Invoices and quotations, done in minutes
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Create professional invoices with auto-calculations, UPI QR codes and PDF export. Send them, track them,
            and get paid faster.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`${APP_URL}/auth/sign-up`}
              className="w-full rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              Start for free
            </a>
            <a
              href={`${APP_URL}/pricing`}
              className="w-full rounded-md border border-border px-6 py-3 font-medium hover:bg-accent sm:w-auto"
            >
              See pricing
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="mt-4 font-heading text-lg font-medium">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Infinity Invoice</p>
          <a href={`${APP_URL}/pricing`} className="hover:text-foreground">
            Pricing
          </a>
        </div>
      </footer>
    </div>
  )
}
