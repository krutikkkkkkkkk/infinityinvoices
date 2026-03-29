import { createClient } from "@/lib/supabase/server"
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
import { FileText, Receipt, FileQuestion } from "lucide-react"

export default async function AdminDocumentsPage() {
  const supabase = await createClient()

  // Fetch all documents with user info
  const { data: documents } = await supabase
    .from("documents")
    .select(`
      *,
      profiles:user_id(email, full_name, company_name)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  // Calculate stats
  const totalDocuments = documents?.length || 0
  const invoices = documents?.filter(d => d.type === "invoice") || []
  const quotations = documents?.filter(d => d.type === "quotation") || []
  const totalValue = documents?.reduce((sum, d) => sum + (d.grand_total || 0), 0) || 0

  const stats = [
    {
      title: "Total Documents",
      value: totalDocuments,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Invoices",
      value: invoices.length,
      icon: Receipt,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Quotations",
      value: quotations.length,
      icon: FileQuestion,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Total Value",
      value: `₹${totalValue.toLocaleString("en-IN")}`,
      icon: Receipt,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Documents</h1>
        <p className="text-gray-400 mt-1">View all invoices and quotations across users</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Documents (Last 100)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">Document</TableHead>
                <TableHead className="text-gray-400">User</TableHead>
                <TableHead className="text-gray-400">Client</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents?.map((doc: any) => {
                const profile = doc.profiles
                
                return (
                  <TableRow key={doc.id} className="border-gray-800">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {doc.type === "invoice" ? (
                          <Receipt className="h-4 w-4 text-green-500" />
                        ) : (
                          <FileQuestion className="h-4 w-4 text-purple-500" />
                        )}
                        <div>
                          <p className="font-medium text-white">{doc.number || "Draft"}</p>
                          <p className="text-xs text-gray-500 capitalize">{doc.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white">{profile?.full_name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{profile?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {doc.client_name || "-"}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      ₹{(doc.grand_total || 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={
                          doc.status === "paid" ? "bg-green-500/20 text-green-500" :
                          doc.status === "sent" ? "bg-blue-500/20 text-blue-500" :
                          doc.status === "overdue" ? "bg-red-500/20 text-red-500" :
                          "bg-gray-800 text-gray-400"
                        }
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
