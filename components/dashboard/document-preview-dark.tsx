"use client"

import { CURRENCIES, type Document, type LineItem } from "@/lib/types"

interface DocumentPreviewDarkProps {
  document: Document & { line_items: LineItem[] }
  profile?: {
    company_name: string | null
    company_address: string | null
    gst_id: string | null
    email: string | null
    phone: string | null
    logo_url: string | null
    upi_id: string | null
    paypal_email: string | null
    bank_name: string | null
    bank_account_name: string | null
    bank_account_number: string | null
    bank_routing_number: string | null
    bank_swift_code: string | null
  } | null
}

function formatCurrency(amount: number, currency: string) {
  const currencyData = CURRENCIES.find((c) => c.value === currency)
  return `${currencyData?.symbol || ""}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function DocumentPreviewDark({ document, profile }: DocumentPreviewDarkProps) {
  return (
    <div className="print:shadow-none shadow-lg" id="document-preview" style={{ backgroundColor: "#1c1c1e" }}>
      <div
        className="p-8 max-w-[210mm] mx-auto"
        style={{ minHeight: "297mm", backgroundColor: "#1c1c1e", color: "#f5f5f5" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Company Logo"
                className="h-16 w-auto mb-2 brightness-0 invert"
              />
            ) : null}
            <h2 className="text-xl font-bold" style={{ color: "#ffffff" }}>
              {profile?.company_name || "Your Company"}
            </h2>
            {profile?.company_address && (
              <p className="text-sm whitespace-pre-line max-w-xs" style={{ color: "#9ca3af" }}>
                {profile.company_address}
              </p>
            )}
            {profile?.email && (
              <p className="text-sm" style={{ color: "#9ca3af" }}>{profile.email}</p>
            )}
            {profile?.phone && (
              <p className="text-sm" style={{ color: "#9ca3af" }}>{profile.phone}</p>
            )}
            {profile?.gst_id && (
              <p className="text-sm" style={{ color: "#9ca3af" }}>GST: {profile.gst_id}</p>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black tracking-widest uppercase mb-2" style={{ color: "#ffffff" }}>
              {document.type}
            </h1>
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              <span className="font-medium" style={{ color: "#d1d5db" }}>#</span> {document.number}
            </p>
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              <span className="font-medium" style={{ color: "#d1d5db" }}>Date:</span>{" "}
              {new Date(document.issue_date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {document.due_date && (
              <p className="text-sm" style={{ color: "#9ca3af" }}>
                <span className="font-medium" style={{ color: "#d1d5db" }}>Due:</span>{" "}
                {new Date(document.due_date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: "#2c2c2e" }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#6b7280" }}>
            Bill To
          </h3>
          <p className="font-semibold" style={{ color: "#ffffff" }}>
            {document.client_name || "Client Name"}
          </p>
          {document.client_address && (
            <p className="text-sm whitespace-pre-line" style={{ color: "#9ca3af" }}>
              {document.client_address}
            </p>
          )}
          {document.client_email && (
            <p className="text-sm" style={{ color: "#9ca3af" }}>{document.client_email}</p>
          )}
          {document.client_gst_id && (
            <p className="text-sm" style={{ color: "#9ca3af" }}>GST: {document.client_gst_id}</p>
          )}
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr style={{ borderBottom: "2px solid #3f3f46" }}>
              <th className="text-left py-3 px-2 text-sm font-semibold" style={{ color: "#6b7280" }}>
                Item
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: "#6b7280" }}>
                Qty
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: "#6b7280" }}>
                Rate
              </th>
              {document.include_tax !== false && (
                <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: "#6b7280" }}>
                  Tax
                </th>
              )}
              <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: "#6b7280" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {document.line_items?.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: "1px solid #27272a" }}>
                <td className="py-3 px-2">
                  <p className="font-medium" style={{ color: "#f5f5f5" }}>{item.name}</p>
                  {item.description && (
                    <p className="text-sm" style={{ color: "#6b7280" }}>{item.description}</p>
                  )}
                </td>
                <td className="text-right py-3 px-2" style={{ color: "#9ca3af" }}>
                  {Number(item.quantity)}
                </td>
                <td className="text-right py-3 px-2" style={{ color: "#9ca3af" }}>
                  {formatCurrency(Number(item.rate), document.currency)}
                </td>
                {document.include_tax !== false && (
                  <td className="text-right py-3 px-2" style={{ color: "#9ca3af" }}>
                    {Number(item.tax_percent)}%
                  </td>
                )}
                <td className="text-right py-3 px-2 font-medium" style={{ color: "#ffffff" }}>
                  {formatCurrency(Number(item.line_total), document.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: "#6b7280" }}>Subtotal:</span>
              <span style={{ color: "#d1d5db" }}>
                {formatCurrency(Number(document.subtotal), document.currency)}
              </span>
            </div>
            {document.include_tax !== false && Number(document.tax_total) > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "#6b7280" }}>Tax:</span>
                <span style={{ color: "#d1d5db" }}>
                  {formatCurrency(Number(document.tax_total), document.currency)}
                </span>
              </div>
            )}
            {document.discount_value && Number(document.discount_value) > 0 && (
              <div className="flex justify-between text-sm" style={{ color: "#f87171" }}>
                <span>
                  Discount
                  {document.discount_type === "percentage" ? ` (${document.discount_value}%)` : ""}:
                </span>
                <span>
                  -{formatCurrency(
                    document.discount_type === "percentage"
                      ? (Number(document.subtotal) * Number(document.discount_value)) / 100
                      : Number(document.discount_value),
                    document.currency
                  )}
                </span>
              </div>
            )}
            <div
              className="flex justify-between pt-2 text-lg font-bold"
              style={{ borderTop: "2px solid #3f3f46" }}
            >
              <span style={{ color: "#ffffff" }}>Total:</span>
              <span style={{ color: "#ffffff" }}>
                {formatCurrency(Number(document.grand_total), document.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {(profile?.bank_name || profile?.upi_id || profile?.paypal_email) && (
          <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: "#2c2c2e", border: "1px solid #3f3f46" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#d1d5db" }}>
              Payment Information
            </h3>
            <div className="space-y-4">
              {/* Bank Transfer */}
              {profile?.bank_name && (
                <div className="space-y-1 text-sm">
                  <p className="font-medium mb-2" style={{ color: "#d1d5db" }}>Bank Transfer</p>
                  <p><span style={{ color: "#6b7280" }}>Bank:</span> <span style={{ color: "#9ca3af" }}>{profile.bank_name}</span></p>
                  {profile.bank_account_name && (
                    <p><span style={{ color: "#6b7280" }}>Account Name:</span> <span style={{ color: "#9ca3af" }}>{profile.bank_account_name}</span></p>
                  )}
                  {profile.bank_account_number && (
                    <p><span style={{ color: "#6b7280" }}>Account Number:</span> <span style={{ color: "#9ca3af" }} className="font-mono">{profile.bank_account_number}</span></p>
                  )}
                  {profile.bank_routing_number && (
                    <p><span style={{ color: "#6b7280" }}>Routing/IFSC:</span> <span style={{ color: "#9ca3af" }} className="font-mono">{profile.bank_routing_number}</span></p>
                  )}
                  {profile.bank_swift_code && (
                    <p><span style={{ color: "#6b7280" }}>SWIFT/BIC:</span> <span style={{ color: "#9ca3af" }} className="font-mono">{profile.bank_swift_code}</span></p>
                  )}
                </div>
              )}

              {/* UPI with QR Code */}
              {profile?.upi_id && (
                <div
                  className="pt-3"
                  style={{ borderTop: profile?.bank_name ? "1px solid #3f3f46" : "none" }}
                >
                  <p className="text-sm font-medium mb-2" style={{ color: "#d1d5db" }}>UPI Payment</p>
                  <div className="flex items-start gap-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${document.grand_total}&cu=${document.currency}`}
                      alt="UPI QR Code"
                      className="w-28 h-28 bg-white p-1 rounded"
                    />
                    <div className="text-sm">
                      <p style={{ color: "#6b7280" }}>UPI ID:</p>
                      <p className="font-mono" style={{ color: "#9ca3af" }}>{profile.upi_id}</p>
                      <p className="text-xs mt-2" style={{ color: "#6b7280" }}>Scan QR code to pay</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal */}
              {profile?.paypal_email && (
                <div
                  className="pt-3 text-sm"
                  style={{ borderTop: (profile?.bank_name || profile?.upi_id) ? "1px solid #3f3f46" : "none" }}
                >
                  <p className="font-medium mb-2" style={{ color: "#d1d5db" }}>PayPal</p>
                  <p style={{ color: "#6b7280" }}>PayPal Email:</p>
                  <p style={{ color: "#9ca3af" }}>{profile.paypal_email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {document.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "#6b7280" }}>Notes</h3>
            <p className="text-sm whitespace-pre-line" style={{ color: "#9ca3af" }}>
              {document.notes}
            </p>
          </div>
        )}

        {/* Terms */}
        {document.terms && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "#6b7280" }}>
              Terms & Conditions
            </h3>
            <p className="text-sm whitespace-pre-line" style={{ color: "#9ca3af" }}>
              {document.terms}
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-auto pt-8 text-center text-xs"
          style={{ borderTop: "1px solid #27272a", color: "#4b5563" }}
        >
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}
