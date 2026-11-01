// Baseline security headers: no framing (clickjacking), no MIME sniffing, HTTPS only
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@infinity/ui', '@infinity/db'],
  images: {
    unoptimized: true,
  },
  // Headless Chromium for PDF export must be required at runtime, not bundled.
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium', 'playwright'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
