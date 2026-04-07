"use client"

import { CURRENCIES, type Document, type LineItem } from "@/lib/types"

interface DocumentPreviewProps {
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

export function DocumentPreviewBold({ document, profile }: DocumentPreviewProps) {
  return (
    <div className="bg-white text-black print:shadow-none shadow-lg" id="document-preview">
      <div className="max-w-[210mm] mx-auto border border-gray-200" style={{ minHeight: "297mm" }}>

        {/* Full-width header band */}
        <div className="bg-[#0d0d0d] px-10 py-8">
          <div className="flex justify-between items-start">
            <div>
              {profile?.logo_url ? (
                <div className="mb-3">
                  <img
                    src={profile.logo_url || "/placeholder.svg"}
                    alt="Company Logo"
                    className="h-14 w-auto"
                  />
                </div>
              ) : null}
              <h2 className="text-white font-bold text-xl tracking-tight">
                {profile?.company_name || "Your Company"}
              </h2>
              {profile?.company_address && (
                <p className="text-gray-400 text-xs mt-1 whitespace-pre-line leading-relaxed max-w-xs">
                  {profile.company_address}
                </p>
              )}
              {profile?.email && <p className="text-gray-400 text-xs">{profile.email}</p>}
              {profile?.phone && <p className="text-gray-400 text-xs">{profile.phone}</p>}
              {profile?.gst_id && <p className="text-gray-400 text-xs">GST: {profile.gst_id}</p>}
            </div>
            <div className="text-right">
              <h1
                className="text-white font-black uppercase"
                style={{ fontSize: "52px", lineHeight: 1, letterSpacing: "-1px" }}
              >
                {document.type}
              </h1>
              <div className="mt-3 space-y-1">
                <p className="text-gray-400 text-xs">
                  <span className="text-gray-500">No.</span>{" "}
                  <span className="text-white font-semibold">{document.number}</span>
                </p>
                <p className="text-gray-400 text-xs">
                  <span className="text-gray-500">Date:</span>{" "}
                  <span className="text-white font-semibold">
                    {new Date(document.issue_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </p>
                {document.due_date && (
                  <p className="text-xs">
                    <span className="text-gray-500">Due:</span>{" "}
                    <span className="text-amber-400 font-semibold">
                      {new Date(document.due_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Accent bar */}
        <div className="h-1 bg-amber-400 w-full" />

        {/* Body */}
        <div className="px-10 py-8">

          {/* Bill To */}
          <div className="flex justify-between items-start mb-10 gap-8">
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
              <p className="font-black text-gray-900 text-lg">
                {document.client_name || "Client Name"}
              </p>
              {document.client_address && (
                <p className="text-sm text-gray-600 whitespace-pre-line mt-1 leading-relaxed">
                  {document.client_address}
                </p>
              )}
              {document.client_email && (
                <p className="text-sm text-gray-600 mt-1">{document.client_email}</p>
              )}
              {document.client_gst_id && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">GST:</span> {document.client_gst_id}
                </p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-y-2 border-[#0d0d0d]">
                <th className="text-left py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Item
                </th>
                <th className="text-right py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Qty
                </th>
                <th className="text-right py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Rate
                </th>
                {document.include_tax !== false && (
                  <th className="text-right py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                    Tax
                  </th>
                )}
                <th className="text-right py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {document.line_items?.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-200 group">
                  <td className="py-4">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="text-right py-4 text-sm text-gray-700">
                    {Number(item.quantity)}
                  </td>
                  <td className="text-right py-4 text-sm text-gray-700">
                    {formatCurrency(Number(item.rate), document.currency)}
                  </td>
                  {document.include_tax !== false && (
                    <td className="text-right py-4 text-sm text-gray-700">
                      {Number(item.tax_percent)}%
                    </td>
                  )}
                  <td className="text-right py-4 text-sm font-bold text-gray-900">
                    {formatCurrency(Number(item.line_total), document.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="space-y-2 pb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(Number(document.subtotal), document.currency)}
                  </span>
                </div>
                {document.include_tax !== false && Number(document.tax_total) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(Number(document.tax_total), document.currency)}
                    </span>
                  </div>
                )}
                {document.discount_value && Number(document.discount_value) > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>
                      Discount
                      {document.discount_type === "percentage"
                        ? ` (${document.discount_value}%)`
                        : ""}
                      :
                    </span>
                    <span className="font-medium">
                      -
                      {formatCurrency(
                        document.discount_type === "percentage"
                          ? (Number(document.subtotal) * Number(document.discount_value)) / 100
                          : Number(document.discount_value),
                        document.currency
                      )}
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-[#0d0d0d] text-white flex justify-between px-4 py-3">
                <span className="font-black text-base uppercase tracking-wide">Total</span>
                <span className="font-black text-lg text-amber-400">
                  {formatCurrency(Number(document.grand_total), document.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {(profile?.bank_name || profile?.upi_id || profile?.paypal_email) && (
            <div className="mb-6 border-t-2 border-[#0d0d0d] pt-6">
              <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4">
                Payment Information
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  {profile?.bank_name && (
                    <div className="text-xs space-y-1.5">
                      <p className="font-bold text-gray-800">Bank Transfer</p>
                      <p className="text-gray-600"><span className="font-semibold text-gray-700">Bank:</span> {profile.bank_name}</p>
                      {profile.bank_account_name && (
                        <p className="text-gray-600"><span className="font-semibold text-gray-700">Account Name:</span> {profile.bank_account_name}</p>
                      )}
                      {profile.bank_account_number && (
                        <p className="text-gray-600"><span className="font-semibold text-gray-700">Account #:</span> <span className="font-mono">{profile.bank_account_number}</span></p>
                      )}
                      {profile.bank_routing_number && (
                        <p className="text-gray-600"><span className="font-semibold text-gray-700">IFSC/Routing:</span> <span className="font-mono">{profile.bank_routing_number}</span></p>
                      )}
                      {profile.bank_swift_code && (
                        <p className="text-gray-600"><span className="font-semibold text-gray-700">SWIFT:</span> <span className="font-mono">{profile.bank_swift_code}</span></p>
                      )}
                    </div>
                  )}
                  {profile?.paypal_email && (
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-gray-800">PayPal</p>
                      <p className="text-gray-600">{profile.paypal_email}</p>
                    </div>
                  )}
                </div>
                {profile?.upi_id && (
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-xs font-bold text-gray-800">UPI Payment</p>
                    <div className="border-2 border-[#0d0d0d] p-1">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${document.grand_total}&cu=${document.currency}`}
                        alt="UPI QR Code"
                        className="w-28 h-28"
                      />
                    </div>
                    <p className="text-xs text-gray-600 font-mono">{profile.upi_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {document.notes && (
            <div className="mb-4 border-l-4 border-amber-400 pl-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-1.5">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {document.notes}
              </p>
            </div>
          )}

          {/* Terms */}
          {document.terms && (
            <div className="mb-4 border-l-4 border-gray-300 pl-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-1.5">
                Terms & Conditions
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {document.terms}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
            <p>Thank you for your business!</p>
            <p className="font-mono text-gray-300">{document.number}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
