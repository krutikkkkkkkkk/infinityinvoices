"use client"

import { Card } from "@/components/ui/card"
import { CURRENCIES } from "@/lib/types"
import type { Document, LineItem, Profile } from "@/lib/types"

interface DocumentPreviewDarkProps {
  document: Document & { line_items: LineItem[] }
  profile: Profile | null
}

export function DocumentPreviewDark({ document, profile }: DocumentPreviewDarkProps) {
  const lineItems = document.line_items || []
  const includeTax = document.include_tax !== false
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const taxAmount = includeTax
    ? lineItems.reduce(
        (sum, item) => sum + (item.quantity * item.rate * item.tax_percent) / 100,
        0
      )
    : 0
  const discount = document.discount_value || 0
  const total = subtotal + taxAmount - discount
  const currencySymbol = CURRENCIES[document.currency] || "₹"

  return (
    <Card className="w-full p-0 overflow-hidden print:shadow-none border-0">
      <div className="bg-gray-900 text-white p-8" style={{ backgroundColor: "#2a2a2a" }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-12 pb-8 border-b border-gray-700">
          <div className="flex items-center gap-4">
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="Logo" className="w-16 h-16" />
            ) : (
              <div className="w-16 h-16 bg-white flex items-center justify-center">
                <div className="w-12 h-12 grid grid-cols-2 gap-1">
                  <div className="bg-gray-900" />
                  <div className="bg-gray-900" />
                  <div className="bg-gray-900" />
                  <div className="bg-gray-900" />
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black tracking-wider mb-2">FACTURA</h1>
            <p className="text-sm text-gray-400">N° {document.number}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(document.issue_date).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Company and Client Info */}
        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-700">
          {/* Company */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Empresa</p>
            <p className="text-lg font-semibold mb-1">{profile?.company_name || "Company Name"}</p>
            {profile?.address && <p className="text-sm text-gray-300">{profile.address}</p>}
            {profile?.city && (
              <p className="text-sm text-gray-300">
                {profile.city}, {profile.postal_code || ""}
              </p>
            )}
            {profile?.phone && <p className="text-sm text-gray-300 mt-2">{profile.phone}</p>}
            {profile?.email && <p className="text-sm text-gray-300">{profile.email}</p>}
          </div>

          {/* Client */}
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Cliente</p>
            <p className="text-lg font-semibold mb-1">{document.client_name || "Client Name"}</p>
            {document.client_address && <p className="text-sm text-gray-300">{document.client_address}</p>}
            {document.client_email && <p className="text-sm text-gray-300">{document.client_email}</p>}
            {document.client_phone && <p className="text-sm text-gray-300">{document.client_phone}</p>}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-600">
                <th className="text-left py-3 px-0 text-xs font-bold uppercase tracking-widest">
                  Descripción / Producto
                </th>
                <th className="text-right py-3 px-0 text-xs font-bold uppercase tracking-widest w-20">
                  Cantidad
                </th>
                <th className="text-right py-3 px-0 text-xs font-bold uppercase tracking-widest w-24">
                  Base
                </th>
                {includeTax && (
                  <th className="text-right py-3 px-0 text-xs font-bold uppercase tracking-widest w-16">
                    IVA
                  </th>
                )}
                <th className="text-right py-3 px-0 text-xs font-bold uppercase tracking-widest w-24">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => {
                const itemSubtotal = item.quantity * item.rate
                const itemTax = includeTax ? (itemSubtotal * item.tax_percent) / 100 : 0
                const itemTotal = itemSubtotal + itemTax

                return (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="py-3 px-0 text-sm">{item.description || ""}</td>
                    <td className="text-right py-3 px-0 text-sm">{item.quantity}</td>
                    <td className="text-right py-3 px-0 text-sm">
                      {currencySymbol}
                      {itemSubtotal.toFixed(2)}
                    </td>
                    {includeTax && (
                      <td className="text-right py-3 px-0 text-sm">{item.tax_percent}%</td>
                    )}
                    <td className="text-right py-3 px-0 text-sm font-semibold">
                      {currencySymbol}
                      {itemTotal.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="ml-auto w-64 space-y-2 mb-8 pb-8 border-b border-gray-700">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Base Imponible</span>
            <span>
              {currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </div>
          {includeTax && taxAmount > 0 && (
            <div className="flex justify-between text-sm text-gray-400">
              <span>IVA</span>
              <span>
                {currencySymbol}
                {taxAmount.toFixed(2)}
              </span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-gray-400">
              <span>Rebención</span>
              <span>
                -{currencySymbol}
                {discount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-2xl font-bold pt-2 border-t border-gray-600">
            <span>Total</span>
            <span>
              {currencySymbol}
              {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-400 text-center pt-4 border-t border-gray-700">
          <p>
            El pago se recibirá en el plazo de tres meses desde la emisión de esta factura,
            de otrá manera se realizará mediante transferencia bancaria.
          </p>
        </div>
      </div>
    </Card>
  )
}
