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

export function DocumentPreview({ document, profile }: DocumentPreviewProps) {
  const currencySymbol = CURRENCIES.find((c) => c.value === document.currency)?.symbol || ""

  return (
    <div className="bg-white text-black print:shadow-none shadow-lg" id="document-preview">
      <div className="p-8 max-w-[210mm] mx-auto border border-gray-200" style={{ minHeight: "297mm" }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {profile?.logo_url ? (
              <img
                src={profile.logo_url || "/placeholder.svg"}
                alt="Company Logo"
                className="h-16 w-auto mb-2"
              />
            ) : null}
            <h2 className="text-xl font-bold text-gray-800">
              {profile?.company_name || "Your Company"}
            </h2>
            {profile?.company_address && (
              <p className="text-sm text-gray-600 whitespace-pre-line max-w-xs">
                {profile.company_address}
              </p>
            )}
            {profile?.email && (
              <p className="text-sm text-gray-600">{profile.email}</p>
            )}
            {profile?.phone && (
              <p className="text-sm text-gray-600">{profile.phone}</p>
            )}
            {profile?.gst_id && (
              <p className="text-sm text-gray-600">GST: {profile.gst_id}</p>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-800 uppercase mb-2">
              {document.type}
            </h1>
            <p className="text-sm text-gray-600">
              <span className="font-medium">#</span> {document.number}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span>{" "}
              {new Date(document.issue_date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {document.due_date && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Due:</span>{" "}
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
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
            Bill To
          </h3>
          <p className="font-semibold text-gray-800">
            {document.client_name || "Client Name"}
          </p>
          {document.client_address && (
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {document.client_address}
            </p>
          )}
          {document.client_email && (
            <p className="text-sm text-gray-600">{document.client_email}</p>
          )}
          {document.client_gst_id && (
            <p className="text-sm text-gray-600">GST: {document.client_gst_id}</p>
          )}
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                Item
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                Qty
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                Rate
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                Tax
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {document.line_items?.map((item, index) => (
              <tr key={item.id || index} className="border-b border-gray-100">
                <td className="py-3 px-2">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500">{item.description}</p>
                  )}
                </td>
                <td className="text-right py-3 px-2 text-gray-600">
                  {Number(item.quantity)}
                </td>
                <td className="text-right py-3 px-2 text-gray-600">
                  {formatCurrency(Number(item.rate), document.currency)}
                </td>
                <td className="text-right py-3 px-2 text-gray-600">
                  {Number(item.tax_percent)}%
                </td>
                <td className="text-right py-3 px-2 font-medium text-gray-800">
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
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800">
                {formatCurrency(Number(document.subtotal), document.currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-800">
                {formatCurrency(Number(document.tax_total), document.currency)}
              </span>
            </div>
            {document.discount_value && Number(document.discount_value) > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>
                  Discount
                  {document.discount_type === "percentage"
                    ? ` (${document.discount_value}%)`
                    : ""}
                  :
                </span>
                <span>
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
            <div className="flex justify-between pt-2 border-t border-gray-200 text-lg font-bold">
              <span className="text-gray-800">Total:</span>
              <span className="text-gray-900">
                {formatCurrency(Number(document.grand_total), document.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {(profile?.bank_name || profile?.upi_id || profile?.paypal_email) && (
          <div className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              Payment Information
            </h3>
            <div className="space-y-4">
              {/* Bank Transfer Details */}
              {profile?.bank_name && (
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-700 mb-2">Bank Transfer</p>
                  <p><span className="text-gray-500">Bank:</span> <span className="text-gray-800">{profile.bank_name}</span></p>
                  {profile.bank_account_name && (
                    <p><span className="text-gray-500">Account Name:</span> <span className="text-gray-800">{profile.bank_account_name}</span></p>
                  )}
                  {profile.bank_account_number && (
                    <p><span className="text-gray-500">Account Number:</span> <span className="text-gray-800 font-mono">{profile.bank_account_number}</span></p>
                  )}
                  {profile.bank_routing_number && (
                    <p><span className="text-gray-500">Routing/IFSC:</span> <span className="text-gray-800 font-mono">{profile.bank_routing_number}</span></p>
                  )}
                  {profile.bank_swift_code && (
                    <p><span className="text-gray-500">SWIFT/BIC:</span> <span className="text-gray-800 font-mono">{profile.bank_swift_code}</span></p>
                  )}
                </div>
              )}
              
              {/* UPI Details with QR Code */}
              {profile?.upi_id && (
                <div className="pt-2 border-t border-gray-100 first:border-t-0 first:pt-0">
                  <p className="font-medium text-gray-700 mb-2">UPI Payment</p>
                  <div className="flex items-start gap-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${document.grand_total}&cu=${document.currency}`}
                      alt="UPI QR Code"
                      className="w-28 h-28"
                    />
                    <div className="text-sm">
                      <p className="text-gray-500">UPI ID:</p>
                      <p className="text-gray-800 font-mono">{profile.upi_id}</p>
                      <p className="text-xs text-gray-400 mt-2">Scan QR code to pay</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* PayPal Details */}
              {profile?.paypal_email && (
                <div className="pt-2 border-t border-gray-100 first:border-t-0 first:pt-0">
                  <p className="font-medium text-gray-700 mb-2">PayPal</p>
                  <div className="text-sm">
                    <p className="text-gray-500">PayPal Email:</p>
                    <p className="text-gray-800">{profile.paypal_email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {document.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Notes</h3>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {document.notes}
            </p>
          </div>
        )}

        {/* Terms */}
        {document.terms && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              Terms & Conditions
            </h3>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {document.terms}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8 text-center text-xs text-gray-400 border-t border-gray-100">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}
