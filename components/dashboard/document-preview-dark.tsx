"use client"

import { CURRENCIES } from "@/lib/types"
import type { Document, LineItem, Profile } from "@/lib/types"

interface DocumentPreviewDarkProps {
  document: Document & { line_items: LineItem[] }
  profile: Profile | null
}

function formatCurrency(amount: number, currency: string) {
  const currencyData = CURRENCIES.find((c) => c.value === currency)
  return `${currencyData?.symbol || ""}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function DocumentPreviewDark({ document, profile }: DocumentPreviewDarkProps) {
  const currencySymbol = CURRENCIES.find((c) => c.value === document.currency)?.symbol || ""

  return (
    <div className="text-white print:shadow-none shadow-lg" id="document-preview-dark" style={{ backgroundColor: "#2a2a2a" }}>
      <div className="p-8 max-w-[210mm] mx-auto" style={{ minHeight: "297mm", backgroundColor: "#2a2a2a" }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-600">
          <div className="flex items-center gap-4">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url || "/placeholder.svg"}
                alt="Company Logo"
                className="h-16 w-auto"
              />
            ) : (
              <div className="w-16 h-16 bg-white flex items-center justify-center rounded">
                <div className="w-10 h-10 grid grid-cols-2 gap-1">
                  <div style={{ backgroundColor: "#2a2a2a" }} />
                  <div style={{ backgroundColor: "#2a2a2a" }} />
                  <div style={{ backgroundColor: "#2a2a2a" }} />
                  <div style={{ backgroundColor: "#2a2a2a" }} />
                </div>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">
                {profile?.company_name || "Your Company"}
              </h2>
              {profile?.company_address && (
                <p className="text-sm text-gray-400 whitespace-pre-line max-w-xs">
                  {profile.company_address}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black tracking-wider text-white uppercase mb-2">
              {document.type}
            </h1>
            <p className="text-sm text-gray-400">
              <span className="font-medium">#</span> {document.number}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              <span className="font-medium">Date:</span>{" "}
              {new Date(document.issue_date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {document.due_date && (
              <p className="text-sm text-gray-400">
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

        {/* Company and Client Info */}
        <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-gray-700">
          {/* From */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              From
            </h3>
            <p className="font-semibold text-white">
              {profile?.company_name || "Your Company"}
            </p>
            {profile?.company_address && (
              <p className="text-sm text-gray-400 whitespace-pre-line">
                {profile.company_address}
              </p>
            )}
            {profile?.email && <p className="text-sm text-gray-400">{profile.email}</p>}
            {profile?.phone && <p className="text-sm text-gray-400">{profile.phone}</p>}
            {profile?.gst_id && <p className="text-sm text-gray-400">GST: {profile.gst_id}</p>}
          </div>

          {/* Bill To */}
          <div className="text-right">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Bill To
            </h3>
            <p className="font-semibold text-white">
              {document.client_name || "Client Name"}
            </p>
            {document.client_address && (
              <p className="text-sm text-gray-400 whitespace-pre-line">
                {document.client_address}
              </p>
            )}
            {document.client_email && (
              <p className="text-sm text-gray-400">{document.client_email}</p>
            )}
            {document.client_gst_id && (
              <p className="text-sm text-gray-400">GST: {document.client_gst_id}</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-600">
              <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Item
              </th>
              <th className="text-right py-3 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Qty
              </th>
              <th className="text-right py-3 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Rate
              </th>
              {document.include_tax !== false && (
                <th className="text-right py-3 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tax
                </th>
              )}
              <th className="text-right py-3 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {document.line_items?.map((item, index) => (
              <tr key={item.id || index} className="border-b border-gray-700">
                <td className="py-3 px-2">
                  <p className="font-medium text-white">{item.name}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500">{item.description}</p>
                  )}
                </td>
                <td className="text-right py-3 px-2 text-gray-300">
                  {Number(item.quantity)}
                </td>
                <td className="text-right py-3 px-2 text-gray-300">
                  {formatCurrency(Number(item.rate), document.currency)}
                </td>
                {document.include_tax !== false && (
                  <td className="text-right py-3 px-2 text-gray-300">
                    {Number(item.tax_percent)}%
                  </td>
                )}
                <td className="text-right py-3 px-2 font-medium text-white">
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
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-gray-300">
                {formatCurrency(Number(document.subtotal), document.currency)}
              </span>
            </div>
            {document.include_tax !== false && Number(document.tax_total) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tax:</span>
                <span className="text-gray-300">
                  {formatCurrency(Number(document.tax_total), document.currency)}
                </span>
              </div>
            )}
            {document.discount_value && Number(document.discount_value) > 0 && (
              <div className="flex justify-between text-sm text-red-400">
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
            <div className="flex justify-between pt-2 border-t-2 border-gray-600 text-xl font-bold">
              <span className="text-white">Total:</span>
              <span className="text-white">
                {formatCurrency(Number(document.grand_total), document.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {(profile?.bank_name || profile?.upi_id || profile?.paypal_email) && (
          <div className="mb-8 p-4 border border-gray-700 rounded-lg" style={{ backgroundColor: "#333" }}>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Payment Information
            </h3>
            <div className="space-y-4">
              {/* Bank Transfer Details */}
              {profile?.bank_name && (
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-300 mb-2">Bank Transfer</p>
                  <p><span className="text-gray-500">Bank:</span> <span className="text-gray-200">{profile.bank_name}</span></p>
                  {profile.bank_account_name && (
                    <p><span className="text-gray-500">Account Name:</span> <span className="text-gray-200">{profile.bank_account_name}</span></p>
                  )}
                  {profile.bank_account_number && (
                    <p><span className="text-gray-500">Account Number:</span> <span className="text-gray-200 font-mono">{profile.bank_account_number}</span></p>
                  )}
                  {profile.bank_routing_number && (
                    <p><span className="text-gray-500">Routing/IFSC:</span> <span className="text-gray-200 font-mono">{profile.bank_routing_number}</span></p>
                  )}
                  {profile.bank_swift_code && (
                    <p><span className="text-gray-500">SWIFT/BIC:</span> <span className="text-gray-200 font-mono">{profile.bank_swift_code}</span></p>
                  )}
                </div>
              )}
              
              {/* UPI Details with QR Code */}
              {profile?.upi_id && (
                <div className="pt-2 border-t border-gray-600 first:border-t-0 first:pt-0">
                  <p className="font-medium text-gray-300 mb-2">UPI Payment</p>
                  <div className="flex items-start gap-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${encodeURIComponent(profile.upi_id)}&pn=${encodeURIComponent(profile.company_name || "")}&am=${document.grand_total}&cu=${document.currency}`}
                      alt="UPI QR Code"
                      className="w-28 h-28 bg-white p-1 rounded"
                    />
                    <div className="text-sm">
                      <p className="text-gray-500">UPI ID:</p>
                      <p className="text-gray-200 font-mono">{profile.upi_id}</p>
                      <p className="text-xs text-gray-500 mt-2">Scan QR code to pay</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* PayPal Details */}
              {profile?.paypal_email && (
                <div className="pt-2 border-t border-gray-600 first:border-t-0 first:pt-0">
                  <p className="font-medium text-gray-300 mb-2">PayPal</p>
                  <div className="text-sm">
                    <p className="text-gray-500">PayPal Email:</p>
                    <p className="text-gray-200">{profile.paypal_email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {document.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Notes</h3>
            <p className="text-sm text-gray-300 whitespace-pre-line">
              {document.notes}
            </p>
          </div>
        )}

        {/* Terms */}
        {document.terms && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-1">
              Terms & Conditions
            </h3>
            <p className="text-sm text-gray-300 whitespace-pre-line">
              {document.terms}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8 text-center text-xs text-gray-500 border-t border-gray-700">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}
