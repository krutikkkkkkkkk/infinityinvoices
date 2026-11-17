import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og"

export const alt = "Infinity Invoices: a free invoice maker for freelancers."
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

// The card for the home page, and for any page without a more specific one (privacy, terms).
export default function OpengraphImage() {
  return ogImage({ eyebrow: "Free online invoice generator", title: "Free invoice maker for freelancers." })
}
