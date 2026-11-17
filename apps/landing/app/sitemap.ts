import type { MetadataRoute } from "next"
import { POSTS } from "@/lib/blog"
import { SITE_URL } from "@/lib/config"

// Served at /sitemap.xml. Blog posts are added automatically from lib/blog.ts;
// add any other new public page to the list below.
export default function sitemap(): MetadataRoute.Sitemap {
  const postDates = POSTS.map((post) => post.updatedAt ?? post.publishedAt).sort()
  const latestPost = postDates.at(-1)

  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
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
