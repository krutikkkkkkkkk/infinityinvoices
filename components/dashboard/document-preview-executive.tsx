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

export function DocumentPreviewExecutive({ document, profile }: DocumentPreviewProps) {
  const currencySymbol = CURRENCIES.find((c) => c.value === document.currency)?.symbol || ""

  return (
    <div className="bg-white text-black print:shadow-none shadow-lg" id="document-preview">
      <div className="flex max-w-[210mm] mx-auto border border-gray-200" style={{ minHeight: "297mm" }}>
        {/* Navy Sidebar */}
        <div className="w-48 bg-gradient-to-b from-[#1e3a5f] to-[#0f2744] text-white p-6 flex flex-col">
          <div className="mb-8">
            {profile?.logo_url ? (
              <div className="bg-white rounded-lg p-3 mb-4">
                <img
                  src={profile.logo_url || "/placeholder.svg"}
                  alt="Company Logo"
                  className="h-12 w-auto"
                />
              </div>
            ) : null}
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
              {profile?.company_name || "Your Company"}
            </h2>
            {profile?.company_address && (
              <p className="text-xs opacity-90 whitespace-pre-line leading-relaxed">
                {profile.company_address}
              </p>
            )}
            {profile?.email && (
              <p className="text-xs opacity-90 mt-2">{profile.email}</p>
            )}
            {profile?.phone && (
              <p className="text-xs opacity-90">{profile.phone}</p>
            )}
            {profile?.gst_id && (
              <p className="text-xs opacity-90 mt-2">
                <span className="opacity-70">GST:</span> {profile.gst_id}
              </p>
            )}
          </div>

          {/* Payment QR Code */}
          {profile?.upi_id && (
            <div className="mt-auto">
              <div className="bg-white p-2 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${document.grand_total}&cu=${document.currency}`}
                  alt="UPI QR Code"
                  className="w-full"
                />
              </div>
              <p className="text-[10px] text-center mt-2 opacity-70">Scan to Pay</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-[#d4af37]">
            <div>
              <h1 className="text-3xl font-bold text-[#1e3a5f] uppercase tracking-wide mb-1">
                {document.type}
              </h1>
              <p className="text-sm text-gray-500">
                Document #{document.number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Issue Date</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(document.issue_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              {document.due_date && (
                <>
                  <p className="text-xs text-gray-500 mt-2 mb-1">Due Date</p>
                  <p className="text-sm font-semibold text-[#d4af37]">
                    {new Date(document.due_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#d4af37]"></span>
              Bill To
            </h3>
            <p className="font-bold text-gray-900 mb-1">
              {document.client_name || "Client Name"}
            </p>
            {document.client_address && (
              <p className="text-sm text-gray-600 whitespace-pre-line mb-1">
                {document.client_address}
              </p>
            )}
            {document.client_email && (
              <p className="text-sm text-gray-600">{document.client_email}</p>
            )}
            {document.client_gst_id && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">GST:</span> {document.client_gst_id}
              </p>
            )}
          </div>

          {/* Line Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-[#1e3a5f] text-white">
                <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wide">
                  Item
                </th>
                <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wide">
                  Qty
                </th>
                <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wide">
                  Rate
                </th>
                {document.include_tax !== false && (
                  <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wide">
                    Tax
                  </th>
                )}
                <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wide">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {document.line_items?.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-200">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="text-right py-3 px-3 text-sm text-gray-700">
                    {Number(item.quantity)}
                  </td>
                  <td className="text-right py-3 px-3 text-sm text-gray-700">
                    {formatCurrency(Number(item.rate), document.currency)}
                  </td>
                  {document.include_tax !== false && (
                    <td className="text-right py-3 px-3 text-sm text-gray-700">
                      {Number(item.tax_percent)}%
                    </td>
                  )}
                  <td className="text-right py-3 px-3 text-sm font-semibold text-gray-900">
                    {formatCurrency(Number(item.line_total), document.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="space-y-2">
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
                <div className="pt-3 mt-3 border-t-2 border-[#d4af37] flex justify-between">
                  <span className="text-base font-bold text-[#1e3a5f]">Total:</span>
                  <span className="text-lg font-bold text-[#1e3a5f]">
                    {formatCurrency(Number(document.grand_total), document.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {(profile?.bank_name || profile?.upi_id || profile?.paypal_email) && (
            <div className="mb-6 p-5 border-2 border-[#1e3a5f] rounded-lg">
              <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-3">
                Payment Information
              </h3>
              <div className="space-y-3">
                {profile?.bank_name && (
                  <div className="text-xs">
                    <p className="font-bold text-gray-700 mb-1.5">Bank Transfer</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <p><span className="text-gray-500">Bank:</span> <span className="text-gray-800 font-medium">{profile.bank_name}</span></p>
                      {profile.bank_account_name && (
                        <p><span className="text-gray-500">Account Name:</span> <span className="text-gray-800 font-medium">{profile.bank_account_name}</span></p>
                      )}
                      {profile.bank_account_number && (
                        <p><span className="text-gray-500">Account #:</span> <span className="text-gray-800 font-mono">{profile.bank_account_number}</span></p>
                      )}
                      {profile.bank_routing_number && (
                        <p><span className="text-gray-500">Routing/IFSC:</span> <span className="text-gray-800 font-mono">{profile.bank_routing_number}</span></p>
                      )}
                      {profile.bank_swift_code && (
                        <p><span className="text-gray-500">SWIFT:</span> <span className="text-gray-800 font-mono">{profile.bank_swift_code}</span></p>
                      )}
                    </div>
                  </div>
                )}
                {profile?.upi_id && (
                  <div className="text-xs pt-2 border-t border-gray-200">
                    <p className="font-bold text-gray-700 mb-1">UPI Payment</p>
                    <p><span className="text-gray-500">UPI ID:</span> <span className="text-gray-800 font-mono">{profile.upi_id}</span></p>
                  </div>
                )}
                {profile?.paypal_email && (
                  <div className="text-xs pt-2 border-t border-gray-200">
                    <p className="font-bold text-gray-700 mb-1">PayPal</p>
                    <p><span className="text-gray-500">Email:</span> <span className="text-gray-800">{profile.paypal_email}</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {document.notes && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {document.notes}
              </p>
            </div>
          )}

          {/* Terms */}
          {document.terms && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Terms & Conditions
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {document.terms}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 text-center text-xs text-gray-400 border-t border-gray-200">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
