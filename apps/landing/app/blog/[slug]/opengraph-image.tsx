import { notFound } from "next/navigation"
import { getPost } from "@/lib/blog"
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og"

export const alt = "An invoicing guide from the Infinity Invoices blog."
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

// One card per post, carrying the post's own title and category.
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug)
  if (!post) notFound()
  return ogImage({ eyebrow: `Guide · ${post.category}`, title: post.title })
}
