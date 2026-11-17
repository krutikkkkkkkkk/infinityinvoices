import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/config"

// Served at /robots.txt. Everything on the marketing site is public; this mainly points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
