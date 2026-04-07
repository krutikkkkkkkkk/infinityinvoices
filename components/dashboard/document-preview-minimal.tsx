"use client"

import { CURRENCIES, type Document, type LineItem } from "@/lib/types"

interface DocumentPreviewMinimalProps {
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

export function DocumentPreviewMinimal({ document, profile }: DocumentPreviewMinimalProps) {
  return (
    <div className="print:shadow-none shadow-lg" id="document-preview">
      <div
        className="p-8 max-w-[210mm] mx-auto"
        style={{ minHeight: "297mm", backgroundColor: "#f5f5f0", color: "#1a1a1a" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            {profile?.logo_url && (
              <img src={profile.logo_url} alt="Company Logo" className="h-12 w-auto mb-3" />
            )}
            <h1 className="text-5xl font-black tracking-tight" style={{ color: "#1a1a1a" }}>
              {document.type === "invoice" ? "Invoice" : "Quotation"}
            </h1>
          </div>
          <div className="text-right text-sm" style={{ color: "#666" }}>
            <p>
              {new Date(document.issue_date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="font-semibold mt-1" style={{ color: "#1a1a1a" }}>
              {document.type === "invoice" ? "Invoice" : "Quotation"} No. {document.number}
            </p>
            {document.due_date && (
              <p className="mt-1">
                <span className="font-medium" style={{ color: "#1a1a1a" }}>Due:</span>{" "}
                {new Date(document.due_date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* From / Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          {/* From */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999" }}>
              From
            </p>
            <p className="font-semibold" style={{ color: "#1a1a1a" }}>
              {profile?.company_name || "Your Company"}
            </p>
            {profile?.company_address && (
              <p className="text-sm whitespace-pre-line" style={{ color: "#666" }}>
                {profile.company_address}
              </p>
            )}
            {profile?.email && <p className="text-sm" style={{ color: "#666" }}>{profile.email}</p>}
            {profile?.phone && <p className="text-sm" style={{ color: "#666" }}>{profile.phone}</p>}
            {profile?.gst_id && <p className="text-sm" style={{ color: "#666" }}>GST: {profile.gst_id}</p>}
          </div>

          {/* Billed To */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: "#e8e8e0" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999" }}>
              Billed To
            </p>
            <p className="font-semibold" style={{ color: "#1a1a1a" }}>
              {document.client_name || "Client Name"}
            </p>
            {document.client_address && (
              <p className="text-sm whitespace-pre-line" style={{ color: "#666" }}>
                {document.client_address}
              </p>
            )}
            {document.client_email && (
              <p className="text-sm" style={{ color: "#666" }}>{document.client_email}</p>
            )}
            {document.client_gst_id && (
              <p className="text-sm" style={{ color: "#666" }}>GST: {document.client_gst_id}</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr style={{ borderBottom: "2px solid #d4d4c8" }}>
              <th className="text-left py-3 text-sm font-semibold" style={{ color: "#666" }}>
                Item
              </th>
              <th className="text-right py-3 text-sm font-semibold" style={{ color: "#666" }}>
                Qty
              </th>
              <th className="text-right py-3 text-sm font-semibold" style={{ color: "#666" }}>
                Rate
              </th>
              {document.include_tax !== false && (
                <th className="text-right py-3 text-sm font-semibold" style={{ color: "#666" }}>
                  Tax
                </th>
              )}
              <th className="text-right py-3 text-sm font-semibold" style={{ color: "#666" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {document.line_items?.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: "1px solid #e8e8e0" }}>
                <td className="py-4">
                  <p className="font-medium" style={{ color: "#1a1a1a" }}>{item.name}</p>
                  {item.description && (
                    <p className="text-sm" style={{ color: "#999" }}>{item.description}</p>
                  )}
                </td>
                <td className="text-right py-4" style={{ color: "#666" }}>
                  {Number(item.quantity)}
                </td>
                <td className="text-right py-4" style={{ color: "#666" }}>
                  {formatCurrency(Number(item.rate), document.currency)}
                </td>
                {document.include_tax !== false && (
                  <td className="text-right py-4" style={{ color: "#666" }}>
                    {Number(item.tax_percent)}%
                  </td>
                )}
                <td className="text-right py-4 font-medium" style={{ color: "#1a1a1a" }}>
                  {formatCurrency(Number(item.line_total), document.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: "#666" }}>Subtotal</span>
              <span style={{ color: "#1a1a1a" }}>
                {formatCurrency(Number(document.subtotal), document.currency)}
              </span>
            </div>
            {document.include_tax !== false && Number(document.tax_total) > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "#666" }}>Tax</span>
                <span style={{ color: "#1a1a1a" }}>
                  {formatCurrency(Number(document.tax_total), document.currency)}
                </span>
              </div>
            )}
            {document.discount_value && Number(document.discount_value) > 0 && (
              <div className="flex justify-between text-sm" style={{ color: "#dc2626" }}>
                <span>
                  Discount
                  {document.discount_type === "percentage" ? ` (${document.discount_value}%)` : ""}
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
              className="flex justify-between pt-3 mt-2 text-lg font-bold"
              style={{ borderTop: "2px solid #1a1a1a" }}
            >
              <span style={{ color: "#1a1a1a" }}>Total</span>
              <span style={{ color: "#1a1a1a" }}>
                {formatCurrency(Number(document.grand_total), document.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {(profile?.bank_name || profile?.upi_id || profile?.paypal_email) && (
          <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: "#e8e8e0" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#1a1a1a" }}>
              Payment Information
            </h3>
            <div className="space-y-4">
              {/* Bank Transfer */}
              {profile?.bank_name && (
                <div className="space-y-1 text-sm">
                  <p className="font-medium mb-1" style={{ color: "#1a1a1a" }}>Bank Transfer</p>
                  <p><span style={{ color: "#999" }}>Bank:</span> <span style={{ color: "#444" }}>{profile.bank_name}</span></p>
                  {profile.bank_account_name && (
                    <p><span style={{ color: "#999" }}>Account Name:</span> <span style={{ color: "#444" }}>{profile.bank_account_name}</span></p>
                  )}
                  {profile.bank_account_number && (
                    <p><span style={{ color: "#999" }}>Account No:</span> <span style={{ color: "#444" }} className="font-mono">{profile.bank_account_number}</span></p>
                  )}
                  {profile.bank_routing_number && (
                    <p><span style={{ color: "#999" }}>IFSC/Routing:</span> <span style={{ color: "#444" }} className="font-mono">{profile.bank_routing_number}</span></p>
                  )}
                  {profile.bank_swift_code && (
                    <p><span style={{ color: "#999" }}>SWIFT/BIC:</span> <span style={{ color: "#444" }} className="font-mono">{profile.bank_swift_code}</span></p>
                  )}
                </div>
              )}

              {/* UPI with QR Code */}
              {profile?.upi_id && (
                <div
                  className="pt-3 space-y-2"
                  style={{ borderTop: profile?.bank_name ? "1px solid #d4d4c8" : "none" }}
                >
                  <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>UPI Payment</p>
                  <div className="flex items-start gap-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${document.grand_total}&cu=${document.currency}`}
                      alt="UPI QR Code"
                      className="w-28 h-28 bg-white p-1 rounded"
                    />
                    <div className="text-sm">
                      <p style={{ color: "#999" }}>UPI ID:</p>
                      <p className="font-mono" style={{ color: "#444" }}>{profile.upi_id}</p>
                      <p className="text-xs mt-2" style={{ color: "#999" }}>Scan QR code to pay</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal */}
              {profile?.paypal_email && (
                <div
                  className="pt-3 text-sm"
                  style={{ borderTop: (profile?.bank_name || profile?.upi_id) ? "1px solid #d4d4c8" : "none" }}
                >
                  <p className="font-medium mb-1" style={{ color: "#1a1a1a" }}>PayPal</p>
                  <p style={{ color: "#999" }}>PayPal Email:</p>
                  <p style={{ color: "#444" }}>{profile.paypal_email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {document.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "#666" }}>Notes</h3>
            <p className="text-sm whitespace-pre-line" style={{ color: "#444" }}>
              {document.notes}
            </p>
          </div>
        )}

        {/* Terms */}
        {document.terms && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "#666" }}>Terms & Conditions</h3>
            <p className="text-sm whitespace-pre-line" style={{ color: "#444" }}>
              {document.terms}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8 text-center text-xs border-t" style={{ color: "#999", borderColor: "#d4d4c8" }}>
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}
