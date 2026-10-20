import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CURRENCIES } from "@/lib/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { Invoice01Icon, Calendar01Icon, CheckmarkCircle02Icon, Clock01Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch document by share token (bypasses RLS for public access)
  const { data: document, error } = await supabase
    .from("documents")
    .select("*, payments(*)")
    .eq("share_token", token)
    .single()

  if (error || !document) {
    notFound()
  }

  // Fetch profile for company details
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", document.user_id)
    .single()

  const currency = CURRENCIES.find((c) => c.value === document.currency)
  const symbol = currency?.symbol || "₹"
  const totalPaid = document.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0
  const remaining = Number(document.grand_total) - totalPaid

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-700 gap-1">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
            Paid
          </Badge>
        )
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-700 gap-1">
            <HugeiconsIcon icon={Clock01Icon} size={12} />
            Pending
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-700 gap-1">
            <HugeiconsIcon icon={AlertCircleIcon} size={12} />
            Overdue
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <HugeiconsIcon icon={Invoice01Icon} size={24} />
            {document.type === "invoice" ? "Invoice" : "Quotation"}
          </h1>
          <p className="text-muted-foreground">
            From {profile?.company_name || "Company"}
          </p>
        </div>

        {/* Main Invoice Card */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Document Number</p>
                <p className="text-xl font-bold">{document.number}</p>
              </div>
              {getStatusBadge(document.status)}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Dates & Amounts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Issue Date</p>
                <p className="font-medium flex items-center gap-1">
                  <HugeiconsIcon icon={Calendar01Icon} size={12} />
                  {new Date(document.issue_date).toLocaleDateString()}
                </p>
              </div>
              {document.due_date && (
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <HugeiconsIcon icon={Calendar01Icon} size={12} />
                    {new Date(document.due_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="font-bold text-lg">
                  {symbol}{Number(document.grand_total).toLocaleString()}
                </p>
              </div>
              {totalPaid > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Amount Paid</p>
                  <p className="font-medium text-green-600">
                    {symbol}{totalPaid.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Balance Due */}
            {remaining > 0 && document.status !== "paid" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-sm text-amber-700">Balance Due</p>
                <p className="text-2xl font-bold text-amber-800">
                  {symbol}{remaining.toLocaleString()}
                </p>
              </div>
            )}

            {/* From/To */}
            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">FROM</p>
                <p className="font-medium">{profile?.company_name}</p>
                {profile?.company_address && (
                  <p className="text-sm text-muted-foreground">{profile.company_address}</p>
                )}
                {profile?.gst_id && (
                  <p className="text-sm text-muted-foreground">GSTIN: {profile.gst_id}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">BILL TO</p>
                <p className="font-medium">{document.client_name}</p>
                {document.client_address && (
                  <p className="text-sm text-muted-foreground">{document.client_address}</p>
                )}
                {document.client_gst_id && (
                  <p className="text-sm text-muted-foreground">GSTIN: {document.client_gst_id}</p>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="pt-4 border-t">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Item</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Rate</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {document.line_items?.map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">{symbol}{Number(item.rate).toLocaleString()}</td>
                      <td className="text-right py-3 font-medium">
                        {symbol}{(item.quantity * item.rate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{symbol}{Number(document.subtotal).toLocaleString()}</span>
                </div>
                {document.discount_value > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">
                      -{symbol}{Number(document.discount_amount || 0).toLocaleString()}
                    </span>
                  </div>
                )}
                {document.tax_total > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{symbol}{Number(document.tax_total).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{symbol}{Number(document.grand_total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            {(document.upi_id || document.bank_name || document.paypal_email) && remaining > 0 && (
              <div className="pt-4 border-t space-y-4">
                <p className="text-sm font-medium text-muted-foreground">PAYMENT OPTIONS</p>
                
                {document.upi_id && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-700 mb-2">Pay with UPI</p>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${encodeURIComponent(document.upi_id)}&pn=${encodeURIComponent(profile?.company_name || "")}&am=${remaining}&cu=${document.currency}`}
                      alt="UPI QR Code"
                      className="mx-auto rounded-lg"
                      width={150}
                      height={150}
                    />
                    <p className="mt-2 font-mono text-sm">{document.upi_id}</p>
                  </div>
                )}

                {document.bank_name && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Bank Transfer</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Bank:</span>
                      <span>{document.bank_name}</span>
                      {document.bank_account_name && (
                        <>
                          <span className="text-muted-foreground">Name:</span>
                          <span>{document.bank_account_name}</span>
                        </>
                      )}
                      {document.bank_account_number && (
                        <>
                          <span className="text-muted-foreground">Account:</span>
                          <span className="font-mono">{document.bank_account_number}</span>
                        </>
                      )}
                      {document.bank_routing_number && (
                        <>
                          <span className="text-muted-foreground">IFSC:</span>
                          <span className="font-mono">{document.bank_routing_number}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {document.paypal_email && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700 mb-1">PayPal</p>
                    <p className="font-mono text-sm">{document.paypal_email}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes & Terms */}
            {(document.notes || document.terms) && (
              <div className="pt-4 border-t space-y-3 text-sm">
                {document.notes && (
                  <div>
                    <p className="font-medium text-muted-foreground">Notes</p>
                    <p>{document.notes}</p>
                  </div>
                )}
                {document.terms && (
                  <div>
                    <p className="font-medium text-muted-foreground">Terms & Conditions</p>
                    <p>{document.terms}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          This invoice was generated by {profile?.company_name}
        </p>
      </div>
    </div>
  )
}
