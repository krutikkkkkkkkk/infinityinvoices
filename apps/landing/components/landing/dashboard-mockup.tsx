import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  FileText,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  Users,
  Wallet,
} from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { DashboardVisual } from "./bento-visuals"
import { StatusBadge, formatINR, type Status } from "./invoice-bits"
import { Pill } from "./ui"

// A static picture of the real dashboard (apps/web/components/dashboard/overview.tsx), scaled down.

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FileText, label: "Invoices" },
  { icon: FileText, label: "Quotations" },
  { icon: Users, label: "Clients" },
  { icon: Package, label: "Products" },
  { icon: Settings, label: "Settings" },
]

const KPIS = [
  { icon: Wallet, label: "Outstanding", value: 124500, footer: <Pill>6 unpaid invoices</Pill> },
  { icon: AlertCircle, label: "Overdue", value: 18500, footer: <Pill tone="critical">1 past due</Pill> },
  { icon: ArrowUpRight, label: "Collected", value: 342000, footer: <Pill tone="good">+12.4% vs last month</Pill> },
  { icon: Percent, label: "Collection rate", value: null, footer: <Pill>of ₹4.1L invoiced</Pill> },
]

const RECENT: { id: string; client: string; amount: number; status: Status }[] = [
  { id: "INV-0014", client: "Acme Retail", amount: 88500, status: "sent" },
  { id: "INV-0013", client: "Globex", amount: 18500, status: "paid" },
  { id: "QT-0007", client: "Initech", amount: 42000, status: "draft" },
  { id: "INV-0011", client: "Northwind", amount: 12400, status: "overdue" },
]

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="The Infinity Invoice dashboard showing outstanding, overdue and collected totals, a revenue chart and recent documents"
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-[0_32px_64px_-32px_rgb(0_0_0/0.35)]",
        className,
      )}
    >
      <div className="flex h-9 items-center gap-3 border-b border-border/60 px-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <span className="rounded-md bg-muted px-3 py-0.5 text-[10px] text-muted-foreground">app.infinityinvoices.com/dashboard</span>
      </div>

      <div className="grid sm:grid-cols-[160px_1fr]">
        <aside className="hidden border-r border-border/60 bg-background/60 p-3 sm:block">
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold">
            <img src="/logo.svg" alt="" className="size-5" />
            Infinity Invoice
          </div>
          <ul className="mt-3 space-y-0.5">
            {NAV.map(({ icon: Icon, label, active }) => (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px]",
                  active ? "bg-card font-medium shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-border/60" : "text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-3 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Overview</p>
            <div className="flex gap-1.5">
              <span className="rounded-full bg-card px-2.5 py-1 text-[10px] ring-1 ring-border">Last 30 days</span>
              <span className="rounded-full bg-card px-2.5 py-1 text-[10px] ring-1 ring-border">₹ INR</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {KPIS.map(({ icon: Icon, label, value, footer }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-muted ring-1 ring-border/60" aria-hidden>
                    <Icon className="size-3" />
                  </span>
                  <span className="truncate text-[11px] font-medium">{label}</span>
                </div>
                <p className="mt-2.5 text-lg font-semibold tracking-tight tabular-nums">{value === null ? "84%" : formatINR(value)}</p>
                <div className="mt-2 [&_span]:text-[10px]">{footer}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-card p-3 lg:col-span-2">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-muted ring-1 ring-border/60" aria-hidden>
                  <BarChart3 className="size-3" />
                </span>
                <div>
                  <p className="text-[11px] font-medium">Revenue</p>
                  <p className="text-[10px] text-muted-foreground">Invoiced vs paid, last 6 months</p>
                </div>
              </div>
              <div className="mt-3 h-36 [&_span]:text-[10px]">
                <DashboardVisual />
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-3">
              <p className="text-[11px] font-medium">Recent documents</p>
              <ul className="mt-2 divide-y divide-border/60">
                {RECENT.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-2 py-1.5 text-[10px]">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.id}</p>
                      <p className="truncate text-muted-foreground">{row.client} · {formatINR(row.amount)}</p>
                    </div>
                    <StatusBadge status={row.status} className="px-1.5 py-0 text-[9px]" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
