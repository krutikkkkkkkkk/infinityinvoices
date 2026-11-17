import { ImageResponse } from "next/og"

// The share card shown when a page is posted to social media or a chat app. Each route's
// opengraph-image.tsx calls ogImage() with that page's own title, so no two pages share a card.

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"
// Has to fit on one line of the left column at 24px.
export const OG_FOOTER = "Free for 5 a month · $29 once for life · Open source"

// --primary from packages/ui/src/styles/theme.css (oklch 0.457 0.24 277), as hex for Satori.
const PRIMARY = "#432dd7"

const ROWS = [
  ["Brand identity", "$2,400.00"],
  ["Website design, 5 pages", "$1,800.00"],
  ["Revisions after sign-off", "$510.00"],
]

/** Long titles step down in size so they stay inside the left column. */
function titleSize(title: string) {
  if (title.length > 58) return 44
  if (title.length > 38) return 52
  return 62
}

export function ogImage({ eyebrow, title, footer = OG_FOOTER }: { eyebrow: string; title: string; footer?: string }) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f4f4f5", padding: 56, gap: 48, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700, color: "#18181b" }}>
            <div style={{ display: "flex", width: 44, height: 44, borderRadius: 12, background: PRIMARY }} />
            Infinity Invoices
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 22 }}>
            <div
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: 999,
                background: "#e4e1fb",
                color: PRIMARY,
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {eyebrow}
            </div>
            <div style={{ display: "flex", fontSize: titleSize(title), fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, color: "#18181b" }}>
              {title}
            </div>
            <div style={{ display: "flex", fontSize: 24, color: "#52525b" }}>{footer}</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 400,
            background: "#ffffff",
            borderRadius: 8,
            padding: 36,
            boxShadow: "0 30px 60px -30px rgba(0,0,0,0.35)",
            borderTop: `10px solid ${PRIMARY}`,
            color: "#1f2937",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 20, fontWeight: 700 }}>Mara Lind Studio</div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 800, letterSpacing: 1 }}>INVOICE</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 14, color: "#6b7280" }}>
            Billed to
            <div style={{ display: "flex", fontSize: 18, fontWeight: 600, color: "#1f2937", marginTop: 4 }}>Northwind Coffee Co.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 28, borderTop: "2px solid #111827" }}>
            {ROWS.map(([name, amount]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #eef0f3", fontSize: 16 }}>
                <span>{name}</span>
                <span>{amount}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", fontSize: 22, fontWeight: 700 }}>
            <span>Total due</span>
            <span>$5,098.58</span>
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
