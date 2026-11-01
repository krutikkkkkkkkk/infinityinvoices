import React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { DM_Sans, Instrument_Sans } from "next/font/google"
import { cn } from "@infinity/ui/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const instrumentSansHeading = Instrument_Sans({ subsets: ["latin"], variable: "--font-heading" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Infinity Invoice - Simple, open source invoicing for freelancers",
  description:
    "Make a clean invoice in 30 seconds, email it to your client, get paid. Free for 5 invoices a month, or $29 once for lifetime Pro. Open source.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("font-sans", dmSans.variable, instrumentSansHeading.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
