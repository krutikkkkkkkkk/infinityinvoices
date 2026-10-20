"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Alert02Icon,
  Building03Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete01Icon,
  FileValidationIcon,
  Invoice01Icon,
  Location01Icon,
  Mail01Icon,
  MoneyReceive01Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  SmartPhone01Icon,
  Tick02Icon,
  UserIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { StatusSelect } from "@/components/dashboard/status-select"
import { EditClientDialog, DeleteClientDialog } from "@/components/dashboard/client-dialogs"
import { IconChip, KpiTile, MetaPill, ReceivablesCard, RevenueCard } from "@/components/dashboard/overview"
import { currencySymbol, formatDate, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Client } from "@/lib/types"
import type { ClientCurrencyStats, ClientDocument } from "@/lib/dashboard/client"

function plural(n: number, word: string) {
  return n === 1 ? word : `${word}s`
}

/* ------------------------------------------------------------------ */
/* Header actions                                                      */
/* ------------------------------------------------------------------ */

export function ClientHeaderActions({ client }: { client: Client }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const copyEmail = async () => {
    if (!client.email) return
    await navigator.clipboard.writeText(client.email)
    toast.success("Email copied")
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setEditing(true)} className="hidden sm:inline-flex">
          <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
          Edit
        </Button>
        <Button asChild className="flex-1 sm:flex-none">
          <Link href={`/dashboard/documents/new?type=invoice&client=${client.id}`}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            New invoice
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More actions">
              <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/documents/new?type=quotation&client=${client.id}`}>
                <HugeiconsIcon icon={FileValidationIcon} size={16} />
                New quotation
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditing(true)} className="sm:hidden">
              <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
              Edit client
            </DropdownMenuItem>
            {client.email && (
              <DropdownMenuItem onClick={copyEmail}>
                <HugeiconsIcon icon={Copy01Icon} size={16} />
                Copy email
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
              <HugeiconsIcon icon={Delete01Icon} size={16} />
              Delete client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <EditClientDialog client={client} open={editing} onOpenChange={setEditing} />
      <DeleteClientDialog client={client} open={deleting} onOpenChange={setDeleting} redirectTo="/dashboard/clients" />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Overview: KPIs + chart + receivables, driven by one currency switch */
/* ------------------------------------------------------------------ */

export function ClientOverview({
  clientName,
  currencies,
  primaryCurrency,
  byCurrency,
  details,
  documents,
}: {
  clientName: string
  currencies: string[]
  primaryCurrency: string
  byCurrency: Record<string, ClientCurrencyStats>
  details: React.ReactNode
  documents: React.ReactNode
}) {
  const [currency, setCurrency] = useState(primaryCurrency)
  const stats = byCurrency[currency] ?? byCurrency[primaryCurrency]
  const rate = stats.billed > 0 ? Math.round((stats.paid / stats.billed) * 100) : null
  const search = encodeURIComponent(clientName)

  return (
    <div className="flex flex-col gap-4">
      {currencies.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">Billed in {currencies.length} currencies</span>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger
              size="sm"
              className="h-9 w-30 rounded-full border-0 bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-border dark:bg-card"
              aria-label="Currency"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {currencies.map((c) => (
                <SelectItem key={c} value={c} className="rounded-lg">
                  <span className="w-5 text-muted-foreground">{currencySymbol(c)}</span>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiTile
          icon={Invoice01Icon}
          label="Total billed"
          value={formatMoney(stats.billed, currency, 0)}
          footer={<MetaPill>{stats.billedCount} {plural(stats.billedCount, "invoice")}</MetaPill>}
        />
        <KpiTile
          icon={MoneyReceive01Icon}
          label="Received"
          value={formatMoney(stats.paid, currency, 0)}
          footer={
            rate === null ? (
              <MetaPill>Nothing billed yet</MetaPill>
            ) : (
              <MetaPill tone={rate >= 80 ? "good" : "neutral"} icon={rate >= 80 ? CheckmarkCircle02Icon : undefined}>
                {rate}% collected
              </MetaPill>
            )
          }
        />
        <KpiTile
          href={`/dashboard/invoices?status=sent&search=${search}`}
          icon={Wallet01Icon}
          label="Outstanding"
          value={formatMoney(stats.outstanding, currency, 0)}
          footer={<MetaPill>{stats.outstandingCount} unpaid</MetaPill>}
        />
        <KpiTile
          href={`/dashboard/invoices?status=overdue&search=${search}`}
          icon={Alert02Icon}
          label="Overdue"
          value={formatMoney(stats.overdue, currency, 0)}
          footer={
            stats.overdueCount > 0 ? (
              <MetaPill tone="critical" icon={Alert02Icon}>
                {stats.overdueCount} past due
              </MetaPill>
            ) : (
              <MetaPill tone="good" icon={CheckmarkCircle02Icon}>
                All on time
              </MetaPill>
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RevenueCard series={stats.series} currency={currency} className="lg:col-span-2" />
        {details}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">{documents}</div>
        <ReceivablesCard
          aging={stats.aging}
          currency={currency}
          subtitle={`What ${clientName} owes`}
          chaseHref={`/dashboard/invoices?status=overdue&search=${search}`}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Contact details                                                     */
/* ------------------------------------------------------------------ */

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        toast.success(`${label} copied`)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={14} />
    </Button>
  )
}

function DetailRow({
  icon,
  label,
  value,
  href,
  mono,
  copy,
}: {
  icon: typeof Mail01Icon
  label: string
  value: string | null
  href?: string
  mono?: boolean
  copy?: boolean
}) {
  return (
    <div className="group/row flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground" aria-hidden>
        <HugeiconsIcon icon={icon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {value ? (
          href ? (
            <a href={href} className={cn("block truncate text-sm font-medium hover:underline underline-offset-4", mono && "font-mono")}>
              {value}
            </a>
          ) : (
            <p className={cn("text-sm font-medium whitespace-pre-line break-words", mono && "font-mono")}>{value}</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">Not added</p>
        )}
      </div>
      {value && copy && <CopyButton value={value} label={label} />}
    </div>
  )
}

export function ClientDetailsCard({ client }: { client: Client }) {
  const [editing, setEditing] = useState(false)
  return (
    <Card className="gap-3">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <IconChip icon={UserIcon} />
          <div>
            <h3 className="text-sm font-medium">Contact details</h3>
            <p className="text-xs text-muted-foreground">Printed on new invoices</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
      <CardContent className="flex flex-col px-3 sm:px-4">
        <DetailRow icon={UserIcon} label="Contact person" value={client.contact_person} />
        <DetailRow icon={Mail01Icon} label="Email" value={client.email} href={client.email ? `mailto:${client.email}` : undefined} copy />
        <DetailRow icon={SmartPhone01Icon} label="Phone" value={client.phone} href={client.phone ? `tel:${client.phone.replace(/\s/g, "")}` : undefined} copy />
        <DetailRow icon={Location01Icon} label="Address" value={client.address} copy />
        <DetailRow icon={Building03Icon} label="GSTIN" value={client.gst_id} mono copy />
        <DetailRow icon={Building03Icon} label="PAN" value={client.pan_number} mono copy />
      </CardContent>
      <EditClientDialog client={client} open={editing} onOpenChange={setEditing} />
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

type DocTab = "all" | "invoice" | "quotation"

export function ClientDocuments({ clientId, documents }: { clientId: string; documents: ClientDocument[] }) {
  const [tab, setTab] = useState<DocTab>("all")
  const rows = tab === "all" ? documents : documents.filter((d) => d.type === tab)
  const counts = {
    all: documents.length,
    invoice: documents.filter((d) => d.type === "invoice").length,
    quotation: documents.filter((d) => d.type === "quotation").length,
  }
  const today = new Date(new Date().toDateString())

  return (
    <Card className="h-full gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <IconChip icon={Invoice01Icon} />
          <div>
            <h3 className="text-sm font-medium">Documents</h3>
            <p className="text-xs text-muted-foreground">Invoices and quotations for this client</p>
          </div>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as DocTab)}>
          <TabsList className="h-9">
            {(["all", "invoice", "quotation"] as const).map((t) => (
              <TabsTrigger key={t} value={t} className="gap-1.5 text-xs">
                {t === "all" ? "All" : t === "invoice" ? "Invoices" : "Quotations"}
                <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">{counts[t]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <CardContent className="px-5 sm:px-6">
        {rows.length === 0 ? (
          <Empty className="rounded-xl border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="rounded-full">
                <HugeiconsIcon icon={Invoice01Icon} />
              </EmptyMedia>
              <EmptyTitle className="text-base">
                {tab === "quotation" ? "No quotations yet" : tab === "invoice" ? "No invoices yet" : "No documents yet"}
              </EmptyTitle>
              <EmptyDescription>Create one and this client&apos;s details are filled in for you.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center">
              <Button asChild size="sm">
                <Link href={`/dashboard/documents/new?type=${tab === "quotation" ? "quotation" : "invoice"}&client=${clientId}`}>
                  New {tab === "quotation" ? "quotation" : "invoice"}
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <ul className="divide-y rounded-xl border md:hidden">
              {rows.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 p-3">
                  <Link href={`/dashboard/documents/${doc.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.number}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="capitalize">{doc.type}</span> · {formatDate(doc.issue_date)}
                    </p>
                  </Link>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-medium tabular-nums">
                      {formatMoney(Number(doc.grand_total) || 0, doc.currency || "INR")}
                    </span>
                    <StatusSelect documentId={doc.id} currentStatus={doc.status} documentNumber={doc.number} compact />
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden max-h-[520px] overflow-auto md:block">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((doc) => {
                    const late =
                      doc.due_date &&
                      (doc.status === "sent" || doc.status === "overdue") &&
                      new Date(doc.due_date) < today
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/documents/${doc.id}`} className="font-medium hover:underline underline-offset-4">
                              {doc.number}
                            </Link>
                            {doc.type === "quotation" && (
                              <Badge variant="outline" className="font-normal text-muted-foreground">
                                Quote
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusSelect documentId={doc.id} currentStatus={doc.status} documentNumber={doc.number} compact />
                        </TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">{formatDate(doc.issue_date)}</TableCell>
                        <TableCell className={cn("tabular-nums", late ? "text-destructive" : "text-muted-foreground")}>
                          {formatDate(doc.due_date)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatMoney(Number(doc.grand_total) || 0, doc.currency || "INR")}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
