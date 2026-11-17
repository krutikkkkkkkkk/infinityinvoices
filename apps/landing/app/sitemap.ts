import type { MetadataRoute } from "next"
import { POSTS } from "@/lib/blog"
import { SITE_URL } from "@/lib/config"
import { TOOLS } from "@/lib/tools"

// Set when the home page's content changes, so search engines know to fetch it again.
const HOME_UPDATED = "2026-11-17"

// Served at /sitemap.xml. Blog posts come from lib/blog.ts and the keyword pages from lib/tools.ts;
// add any other new public page to the list below.
export default function sitemap(): MetadataRoute.Sitemap {
  const postDates = POSTS.map((post) => post.updatedAt ?? post.publishedAt).sort()
  const latestPost = postDates.at(-1)

  return [
    { url: SITE_URL, lastModified: HOME_UPDATED, changeFrequency: "weekly", priority: 1 },
    ...TOOLS.map((tool) => ({
      url: `${SITE_URL}/${tool.slug}`,
      lastModified: tool.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${SITE_URL}/blog`, lastModified: latestPost, changeFrequency: "weekly", priority: 0.8 },
    ...POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ]
}
