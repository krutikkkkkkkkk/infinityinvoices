import React from "react"
import type { Metadata } from "next"
import { DM_Sans, Instrument_Sans } from "next/font/google"
import { cn } from "@infinity/ui/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const instrumentSansHeading = Instrument_Sans({ subsets: ["latin"], variable: "--font-heading" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Infinity Invoice Admin",
  robots: { index: false, follow: false },
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
