import { TableCell } from "@/components/ui/table"
import { TableBody } from "@/components/ui/table"
import { TableHead } from "@/components/ui/table"
import { TableRow } from "@/components/ui/table"
import { TableHeader } from "@/components/ui/table"
import { Table } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon } from "@hugeicons/core-free-icons"
import { Client } from "@/lib/types"
import { AddClientDialog } from "@/components/dashboard/add-client-dialog"
import { ClientsTable } from "@/components/dashboard/clients-table"

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client information
          </p>
        </div>
        <AddClientDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {clients && clients.length > 0 ? (
            <ClientsTable clients={clients as Client[]} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HugeiconsIcon icon={UserGroupIcon} size={48} className="text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No clients yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Add your first client to quickly fill in their details on invoices
              </p>
              <AddClientDialog />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
