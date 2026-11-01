import { ImageResponse } from "next/og"

export const alt = "Infinity Invoice: invoicing for people who send four invoices a month, not forty."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// --primary from packages/ui/src/styles/theme.css (oklch 0.457 0.24 277), as hex for Satori.
const PRIMARY = "#432dd7"

const ROWS = [
  ["Brand identity", "$2,400.00"],
  ["Website design, 5 pages", "$1,800.00"],
  ["Revisions after sign-off", "$510.00"],
]

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f4f4f5", padding: 56, gap: 48, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700, color: "#18181b" }}>
            <div style={{ display: "flex", width: 44, height: 44, borderRadius: 12, background: PRIMARY }} />
            Infinity Invoice
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#18181b" }}>
              Invoicing for people who send four invoices a month, not forty.
            </div>
            <div style={{ fontSize: 26, color: "#52525b" }}>Free for 5 a month · $29 once for life · Open source</div>
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
    size,
  )
}
