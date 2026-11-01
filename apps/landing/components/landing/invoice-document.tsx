import { StatusBadge, formatUSD } from "./invoice-bits"

const ITEMS = [
  { name: "Brand identity: logo, type and color system", detail: "Fixed fee", qty: 1, rate: 2400 },
  { name: "Website design, 5 pages", detail: "Fixed fee", qty: 1, rate: 1800 },
  { name: "Revisions after sign-off", detail: "Hourly", qty: 6, rate: 85 },
]
const SUBTOTAL = ITEMS.reduce((sum, item) => sum + item.qty * item.rate, 0)
const TAX_RATE = 0.0825
const TAX = Math.round(SUBTOTAL * TAX_RATE * 100) / 100
const TOTAL = SUBTOTAL + TAX

/** The hero visual: a finished invoice, drawn as the PDF a client would receive. */
export function InvoiceDocument() {
  return (
    <figure
      aria-label={`Example invoice from Mara Lind Studio to Northwind Coffee Co. for ${formatUSD(TOTAL)}`}
      className="relative mx-auto w-full max-w-3xl rounded-sm bg-white text-neutral-900 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_32px_64px_-32px_rgb(0_0_0/0.35)] ring-1 ring-black/5"
    >
      <div className="h-1.5 rounded-t-sm bg-primary" aria-hidden />
      <div className="px-6 py-8 text-left sm:px-12 sm:py-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-primary font-heading text-lg font-semibold text-primary-foreground">
              M
            </span>
            <div>
              <p className="font-heading text-lg font-semibold">Mara Lind Studio</p>
              <p className="text-xs text-neutral-500">hello@maralind.studio · Austin, TX</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Invoice</p>
            <p className="mt-1 text-sm text-neutral-500 tabular-nums">No. 2026-031</p>
          </div>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs text-neutral-500">Billed to</dt>
            <dd className="mt-1 font-medium">Northwind Coffee Co.</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Issued</dt>
            <dd className="mt-1 tabular-nums">Nov 3, 2026</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Due</dt>
            <dd className="mt-1 tabular-nums">Nov 17, 2026</dd>
          </div>
          <div className="hidden sm:block sm:text-right">
            <dt className="text-xs text-neutral-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status="sent" />
            </dd>
          </div>
        </dl>

        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-900 text-left text-xs text-neutral-500">
              <th scope="col" className="pb-2 font-medium">Description</th>
              <th scope="col" className="hidden pb-2 text-right font-medium sm:table-cell">Qty</th>
              <th scope="col" className="hidden pb-2 text-right font-medium sm:table-cell">Rate</th>
              <th scope="col" className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((item) => (
              <tr key={item.name} className="border-b border-neutral-200">
                <td className="py-3 pr-4">
                  <p>{item.name}</p>
                  <p className="text-xs text-neutral-500">{item.detail}</p>
                </td>
                <td className="hidden py-3 text-right tabular-nums sm:table-cell">{item.qty}</td>
                <td className="hidden py-3 text-right tabular-nums sm:table-cell">{formatUSD(item.rate)}</td>
                <td className="py-3 text-right tabular-nums">{formatUSD(item.qty * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex flex-col-reverse gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-xs text-neutral-500">
            <p className="font-medium text-neutral-900">Payment details</p>
            <p className="mt-1">PayPal: hello@maralind.studio</p>
            <p>Bank transfer: Acct ending 4417</p>
          </div>
          <dl className="min-w-56 space-y-1.5 text-sm tabular-nums">
            <div className="flex justify-between gap-8 text-neutral-500">
              <dt>Subtotal</dt>
              <dd>{formatUSD(SUBTOTAL)}</dd>
            </div>
            <div className="flex justify-between gap-8 text-neutral-500">
              <dt>Sales tax 8.25%</dt>
              <dd>{formatUSD(TAX)}</dd>
            </div>
            <div className="flex justify-between gap-8 border-t border-neutral-900 pt-2 text-base font-semibold">
              <dt>Total due</dt>
              <dd>{formatUSD(TOTAL)}</dd>
            </div>
          </dl>
        </div>

        <p className="mt-12 border-t border-neutral-200 pt-4 text-xs text-neutral-500">Thanks for the great project. Net 14.</p>
      </div>
    </figure>
  )
}
