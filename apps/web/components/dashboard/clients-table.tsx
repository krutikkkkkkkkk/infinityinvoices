"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon, PencilEdit01Icon, Delete01Icon, ViewIcon, Add01Icon } from "@hugeicons/core-free-icons"
import { Client } from "@/lib/types"
import { setClientAutoReminder } from "@/app/dashboard/clients/actions"
import { EditClientDialog, DeleteClientDialog } from "@/components/dashboard/client-dialogs"
import { ClientAvatar } from "@/components/dashboard/client-avatar"
import { useSubscription } from "@/hooks/use-subscription"

interface ClientsTableProps {
  clients: Client[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { isPro } = useSubscription()

  const toggleReminder = (client: Client, checked: boolean) => {
    startTransition(async () => {
      const { error } = await setClientAutoReminder(client.id, checked)
      if (error) toast.error("Couldn't update reminders", { description: error })
      router.refresh()
    })
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>GSTIN</TableHead>
            <TableHead>PAN</TableHead>
            <TableHead>Auto reminders</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="group">
              <TableCell>
                <Link href={`/dashboard/clients/${client.id}`} className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <ClientAvatar name={client.name} className="size-9 text-xs" />
                  <div className="min-w-0">
                    <div className="font-medium group-hover:underline underline-offset-4">{client.name}</div>
                    {client.company_name && client.company_name !== client.name && (
                      <div className="truncate text-sm text-muted-foreground">{client.company_name}</div>
                    )}
                    {client.contact_person && (
                      <div className="text-xs text-muted-foreground">Contact: {client.contact_person}</div>
                    )}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {client.email && <div className="text-sm">{client.email}</div>}
                  {client.phone && <div className="text-sm text-muted-foreground">{client.phone}</div>}
                  {!client.email && !client.phone && <span className="text-muted-foreground">—</span>}
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{client.gst_id || "—"}</TableCell>
              <TableCell className="font-mono text-sm">{client.pan_number || "—"}</TableCell>
              <TableCell>
                <Switch
                  checked={client.auto_reminder}
                  onCheckedChange={(checked) => toggleReminder(client, checked)}
                  // Pro-only; a downgraded user can still switch an existing one off
                  disabled={isPending || (!isPro && !client.auto_reminder)}
                  aria-label={`Auto reminders for ${client.name}`}
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${client.name}`}>
                      <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/clients/${client.id}`}>
                        <HugeiconsIcon icon={ViewIcon} size={16} />
                        View client
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/documents/new?type=invoice&client=${client.id}`}>
                        <HugeiconsIcon icon={Add01Icon} size={16} />
                        New invoice
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingClient(client)}>
                      <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setDeletingClient(client)}>
                      <HugeiconsIcon icon={Delete01Icon} size={16} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditClientDialog
        client={editingClient}
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
      />
      <DeleteClientDialog
        client={deletingClient}
        open={!!deletingClient}
        onOpenChange={(open) => !open && setDeletingClient(null)}
      />
    </>
  )
}
