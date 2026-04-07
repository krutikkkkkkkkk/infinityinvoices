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
        style={{ 
          minHeight: "297mm",
          backgroundColor: "#f5f5f0",
          color: "#1a1a1a"
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <h1 className="text-5xl font-black tracking-tight" style={{ color: "#1a1a1a" }}>
            {document.type === "invoice" ? "Invoice" : "Quotation"}
          </h1>
          <div className="text-right text-sm" style={{ color: "#666" }}>
            <p>
              {new Date(document.issue_date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="font-medium" style={{ color: "#1a1a1a" }}>
              {document.type === "invoice" ? "Invoice" : "Quotation"} No. {document.number}
            </p>
          </div>
        </div>

        {/* Billed To Card */}
        <div 
          className="mb-10 p-5 rounded-lg"
          style={{ backgroundColor: "#e8e8e0" }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: "#3b82f6" }}>
            Billed to:
          </p>
          <p className="font-medium" style={{ color: "#1a1a1a" }}>
            {document.client_name || "Client Name"}
          </p>
          {document.client_phone && (
            <p className="text-sm" style={{ color: "#666" }}>{document.client_phone}</p>
          )}
          {document.client_address && (
            <p className="text-sm whitespace-pre-line" style={{ color: "#666" }}>
              {document.client_address}
            </p>
          )}
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr style={{ borderBottom: "2px solid #d4d4c8" }}>
              <th className="text-left py-3 text-sm font-medium" style={{ color: "#666" }}>
                Description
              </th>
              <th className="text-right py-3 text-sm font-medium" style={{ color: "#666" }}>
                Rate
              </th>
              <th className="text-right py-3 text-sm font-medium" style={{ color: "#666" }}>
                {document.type === "invoice" ? "Hours" : "Qty"}
              </th>
              <th className="text-right py-3 text-sm font-medium" style={{ color: "#666" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {document.line_items?.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: "1px solid #e8e8e0" }}>
                <td className="py-4" style={{ color: "#666" }}>
                  {item.name}
                  {item.description && (
                    <span className="block text-sm" style={{ color: "#999" }}>
                      {item.description}
                    </span>
                  )}
                </td>
                <td className="text-right py-4" style={{ color: "#666" }}>
                  {formatCurrency(Number(item.rate), document.currency)}/{document.type === "invoice" ? "hr" : "unit"}
                </td>
                <td className="text-right py-4" style={{ color: "#666" }}>
                  {Number(item.quantity)}
                </td>
                <td className="text-right py-4" style={{ color: "#1a1a1a" }}>
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
            {document.include_tax !== false && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "#666" }}>
                  Tax ({document.line_items?.length ? Math.round(Number(document.tax_total) / Number(document.subtotal) * 100) : 0}%)
                </span>
                <span style={{ color: "#1a1a1a" }}>
                  {formatCurrency(Number(document.tax_total), document.currency)}
                </span>
              </div>
            )}
            {document.discount_value && Number(document.discount_value) > 0 && (
              <div className="flex justify-between text-sm" style={{ color: "#dc2626" }}>
                <span>Discount</span>
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

        {/* Footer - Two Column Layout */}
        <div 
          className="mt-auto pt-8 grid grid-cols-2 gap-8"
          style={{ borderTop: "1px solid #d4d4c8" }}
        >
          {/* Payment Information */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: "#1a1a1a" }}>
              Payment Information
            </h3>
            <div className="text-sm space-y-1" style={{ color: "#666" }}>
              {profile?.company_name && (
                <p>{profile.company_name}</p>
              )}
              {profile?.bank_name && (
                <p>Bank: {profile.bank_name}</p>
              )}
              {profile?.bank_account_number && (
                <p>Account No: {profile.bank_account_number}</p>
              )}
              {profile?.bank_routing_number && (
                <p>IFSC/Routing: {profile.bank_routing_number}</p>
              )}
            </div>
          </div>

          {/* Sender Info */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: "#1a1a1a" }}>
              {profile?.company_name || "Your Company"}
            </h3>
            <div className="text-sm space-y-1" style={{ color: "#666" }}>
              {profile?.company_address && (
                <p className="whitespace-pre-line">{profile.company_address}</p>
              )}
              {profile?.phone && <p>{profile.phone}</p>}
              {profile?.email && <p>{profile.email}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
