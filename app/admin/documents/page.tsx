import { requireAdmin } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileQuestion, FileText, Receipt } from "lucide-react"

type AdminDocument = {
  id: string
  user_id: string
  type: "invoice" | "quotation"
  number: string
  client_name: string | null
  grand_total: number | string | null
  currency: string
  status: string
  created_at: string
}

type ProfileSummary = {
  id: string
  email: string | null
  company_name: string | null
}

function formatAmount(value: number | string | null, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export default async function AdminDocumentsPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const [documentsResult, totalResult, invoiceResult, quotationResult] = await Promise.all([
    supabase
      .from("documents")
      .select("id, user_id, type, number, client_name, grand_total, currency, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("type", "invoice"),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("type", "quotation"),
  ])

  const queryError = [documentsResult, totalResult, invoiceResult, quotationResult].find(
    (result) => result.error,
  )?.error

  if (queryError) {
    throw new Error(`Unable to load admin documents: ${queryError.message}`)
  }

  const documents = (documentsResult.data ?? []) as AdminDocument[]
  const userIds = [...new Set(documents.map((document) => document.user_id))]
  let profiles: ProfileSummary[] = []

  if (userIds.length > 0) {
    const profilesResult = await supabase
      .from("profiles")
      .select("id, email, company_name")
      .in("id", userIds)

    if (profilesResult.error) {
      throw new Error(`Unable to load document owners: ${profilesResult.error.message}`)
    }

    profiles = (profilesResult.data ?? []) as ProfileSummary[]
  }

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]))
  const totalsByCurrency = documents.reduce<Record<string, number>>((totals, document) => {
    const currency = document.currency || "INR"
    totals[currency] = (totals[currency] ?? 0) + (Number(document.grand_total) || 0)
    return totals
  }, {})
  const recentValue = Object.entries(totalsByCurrency)
    .map(([currency, value]) => formatAmount(value, currency))
    .join(" · ") || formatAmount(0, "INR")

  const stats = [
    { title: "Total Documents", value: totalResult.count ?? 0, icon: FileText },
    { title: "Invoices", value: invoiceResult.count ?? 0, icon: Receipt },
    { title: "Quotations", value: quotationResult.count ?? 0, icon: FileQuestion },
    { title: "Recent Value", value: recentValue, icon: Receipt },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all invoices and quotations across users
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-start justify-between gap-4 p-6">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-2 truncate text-2xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <stat.icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? (
                documents.map((document) => {
                  const profile = profilesById.get(document.user_id)

                  return (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {document.type === "invoice" ? (
                            <Receipt className="h-4 w-4 text-primary" aria-hidden="true" />
                          ) : (
                            <FileQuestion className="h-4 w-4 text-primary" aria-hidden="true" />
                          )}
                          <div>
                            <p className="font-medium">{document.number || "Draft"}</p>
                            <p className="text-xs capitalize text-muted-foreground">{document.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{profile?.company_name || "No company"}</p>
                        <p className="text-xs text-muted-foreground">{profile?.email || "No email"}</p>
                      </TableCell>
                      <TableCell>{document.client_name || "—"}</TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(document.grand_total, document.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={document.status === "paid" ? "default" : "secondary"}>
                          {document.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(document.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
