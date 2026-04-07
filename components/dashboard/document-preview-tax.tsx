"use client"

import { CURRENCIES, type Document, type LineItem } from "@/lib/types"

interface DocumentPreviewTaxProps {
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

export function DocumentPreviewTax({ document, profile }: DocumentPreviewTaxProps) {
  const currencySymbol = CURRENCIES.find((c) => c.value === document.currency)?.symbol || ""

  return (
    <div className="bg-white text-black print:shadow-none shadow-lg" id="document-preview">
      <div className="p-8 max-w-[210mm] mx-auto border-4 border-red-600" style={{ minHeight: "297mm" }}>
        {/* Header with Tax Invoice Badge */}
        <div className="text-center mb-6 pb-4 border-b-2 border-red-600">
          <div className="text-xs font-bold text-red-600 tracking-widest mb-2">
            TAX INVOICE
          </div>
          {profile?.logo_url ? (
            <img
              src={profile.logo_url || "/placeholder.svg"}
              alt="Company Logo"
              className="h-12 w-auto mx-auto mb-2"
            />
          ) : null}
          <h2 className="text-2xl font-bold text-gray-800">
            {profile?.company_name || "Your Company"}
          </h2>
          {profile?.gst_id && (
            <p className="text-xs text-gray-600 mt-1">
              GSTIN: <span className="font-semibold">{profile.gst_id}</span>
            </p>
          )}
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase mb-2">Bill To</p>
            <p className="text-sm font-semibold text-gray-800">{document.client_name || "Client"}</p>
            {document.client_gst_id && (
              <p className="text-xs text-gray-600 mt-1">
                GSTIN: <span className="font-semibold">{document.client_gst_id}</span>
              </p>
            )}
            {document.client_address && (
              <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                {document.client_address}
              </p>
            )}
            {document.client_email && (
              <p className="text-xs text-gray-600 mt-1">{document.client_email}</p>
            )}
          </div>
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-600 uppercase">Invoice No.</p>
                <p className="text-sm font-semibold text-gray-800">{document.number}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-600 uppercase">Date</p>
                <p className="text-sm text-gray-800">
                  {new Date(document.issue_date).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
            {document.due_date && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-600 uppercase">Due Date</p>
                <p className="text-sm text-red-600 font-semibold">
                  {new Date(document.due_date).toLocaleDateString("en-IN")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-800">
              <th className="text-left py-2 px-3 text-xs font-bold text-gray-800">Description</th>
              <th className="text-right py-2 px-3 text-xs font-bold text-gray-800">Qty</th>
              <th className="text-right py-2 px-3 text-xs font-bold text-gray-800">Rate</th>
              <th className="text-right py-2 px-3 text-xs font-bold text-gray-800">GST %</th>
              <th className="text-right py-2 px-3 text-xs font-bold text-gray-800">Amount</th>
            </tr>
          </thead>
          <tbody>
            {document.line_items?.map((item: LineItem, i: number) => {
              const itemTotal = item.quantity * item.rate
              const tax = (itemTotal * item.tax_percent) / 100
              const lineTotal = itemTotal + tax
              return (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-3 px-3 text-sm text-gray-800">{item.description}</td>
                  <td className="text-right py-3 px-3 text-sm text-gray-600">{item.quantity}</td>
                  <td className="text-right py-3 px-3 text-sm text-gray-600">
                    {formatCurrency(item.rate, document.currency)}
                  </td>
                  <td className="text-right py-3 px-3 text-sm text-gray-600">{item.tax_percent}%</td>
                  <td className="text-right py-3 px-3 text-sm font-semibold text-gray-800">
                    {formatCurrency(lineTotal, document.currency)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-8 mb-6">
          <div />
          <div />
          <div className="border-t-2 border-gray-800 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">Subtotal:</span>
              <span className="text-sm text-gray-800">
                {formatCurrency(Number(document.subtotal), document.currency)}
              </span>
            </div>
            {document.include_tax !== false && Number(document.tax_total) > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800">Tax (GST):</span>
                <span className="text-sm text-red-600 font-bold">
                  {formatCurrency(Number(document.tax_total), document.currency)}
                </span>
              </div>
            )}
            {document.discount_value > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800">Discount:</span>
                <span className="text-sm text-gray-800">
                  {document.discount_type === "percentage"
                    ? `${document.discount_value}%`
                    : formatCurrency(document.discount_value, document.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-b-2 border-gray-800">
              <span className="text-sm font-bold text-gray-800">TOTAL:</span>
              <span className="text-lg font-bold text-gray-800">
                {formatCurrency(Number(document.grand_total), document.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200 text-xs">
          <div>
            <p className="font-bold text-gray-800 mb-2">Bank Details:</p>
            {profile?.bank_name && <p className="text-gray-600">{profile.bank_name}</p>}
            {profile?.bank_account_name && (
              <p className="text-gray-600">Acc. Name: {profile.bank_account_name}</p>
            )}
            {profile?.bank_account_number && (
              <p className="text-gray-600">Acc. No: {profile.bank_account_number}</p>
            )}
            {profile?.bank_swift_code && <p className="text-gray-600">SWIFT: {profile.bank_swift_code}</p>}
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-800 mb-2">Authorized Signatory</p>
            <p className="text-gray-600 mt-8">{profile?.company_name || "Company"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
