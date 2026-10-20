"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { configureLateFee, createRecurringSchedule } from "@/app/dashboard/invoicing/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export function InvoiceAutomationPanel({ documentId, lateFeeType, lateFeeValue, schedule }: {
  documentId: string
  lateFeeType: "fixed" | "percentage" | null
  lateFeeValue: number | null
  schedule: { frequency: string; next_run_at: string; active: boolean } | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feeEnabled, setFeeEnabled] = useState(Boolean(lateFeeType))
  const [feeType, setFeeType] = useState<"fixed" | "percentage">(lateFeeType || "percentage")
  const [feeValue, setFeeValue] = useState(String(lateFeeValue || ""))
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "quarterly" | "yearly">("monthly")
  const [nextRunAt, setNextRunAt] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10))

  function run(action: () => Promise<void>, message: string) {
    startTransition(async () => {
      try { await action(); toast.success(message); router.refresh() }
      catch (error) { toast.error(error instanceof Error ? error.message : "Something went wrong") }
    })
  }

  return <Card>
    <CardHeader><CardTitle className="text-base">Invoice automation</CardTitle><CardDescription>Generate draft invoices on schedule and apply one-time overdue fees.</CardDescription></CardHeader>
    <CardContent className="grid gap-6 md:grid-cols-2">
      <section className="flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-4"><div><h3 className="font-medium">One-time late fee</h3><p className="text-xs text-muted-foreground">Applied once when this invoice becomes overdue.</p></div><Switch checked={feeEnabled} onCheckedChange={setFeeEnabled} /></div>
        {feeEnabled && <div className="grid grid-cols-2 gap-3"><div className="flex flex-col gap-2"><Label>Type</Label><Select value={feeType} onValueChange={(value: "fixed" | "percentage") => setFeeType(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed amount</SelectItem></SelectContent></Select></div><div className="flex flex-col gap-2"><Label htmlFor="fee-value">Value</Label><Input id="fee-value" type="number" min="0" step="0.01" value={feeValue} onChange={(event) => setFeeValue(event.target.value)} /></div></div>}
        <Button variant="outline" disabled={pending} onClick={() => run(() => configureLateFee({ documentId, feeType: feeEnabled ? feeType : null, feeValue: Number(feeValue) }), "Late fee saved")}>Save late fee</Button>
      </section>
      <section className="flex flex-col gap-4 rounded-lg border p-4">
        <div><h3 className="font-medium">Recurring drafts</h3><p className="text-xs text-muted-foreground">{schedule ? `Next ${schedule.frequency} draft: ${new Date(schedule.next_run_at).toLocaleDateString()}` : "Create future drafts from this invoice."}</p></div>
        {!schedule && <><div className="grid grid-cols-2 gap-3"><div className="flex flex-col gap-2"><Label>Frequency</Label><Select value={frequency} onValueChange={(value: typeof frequency) => setFrequency(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div><div className="flex flex-col gap-2"><Label htmlFor="next-run">First draft</Label><Input id="next-run" type="date" value={nextRunAt} onChange={(event) => setNextRunAt(event.target.value)} /></div></div><Button variant="outline" disabled={pending} onClick={() => run(() => createRecurringSchedule({ documentId, frequency, nextRunAt }), "Recurring schedule created")}>Create schedule</Button></>}
      </section>
    </CardContent>
  </Card>
}
