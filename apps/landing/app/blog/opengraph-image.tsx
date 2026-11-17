import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og"

export const alt = "Invoicing guides for freelancers, from Infinity Invoices."
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function OpengraphImage() {
  return ogImage({ eyebrow: "Blog", title: "Invoicing guides for freelancers" })
}
