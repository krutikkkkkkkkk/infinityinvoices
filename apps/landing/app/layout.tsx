import React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { DM_Sans, Instrument_Sans } from "next/font/google"
import { cn } from "@infinity/ui/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SITE_URL } from "@/lib/config"
import { SHARE_IMAGE, SITE_NAME } from "@/lib/seo"
import "./globals.css"

const instrumentSansHeading = Instrument_Sans({ subsets: ["latin"], variable: "--font-heading" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })

// Defaults for pages that don't set their own. Each indexable page sets its title, description and
// canonical URL with pageMetadata() from lib/seo.ts; there is deliberately no canonical here, because
// a page that inherited it would tell search engines it is a copy of the home page.
const TITLE = "Infinity Invoices - Free invoice maker for freelancers"
const DESCRIPTION =
  "Free invoice maker and generator for freelancers and small businesses. Create a professional invoice in 30 seconds, download the PDF and get paid."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  category: "business",
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Lets Google show the full snippet and the large share image in results.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Ownership tokens for Google Search Console and Bing Webmaster Tools. Unset variables render nothing.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE.url] },
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
        {/* Sections fade in from JavaScript (see InView). Without it, show them instead of leaving them invisible. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;translate:none!important}"}</style>
        </noscript>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
