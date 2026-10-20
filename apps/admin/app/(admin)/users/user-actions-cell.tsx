"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { upgradeUserToPro, downgradeUserToFree } from "./actions"

interface UserActionsCellProps {
  userId: string
  isPro: boolean
}

export function UserActionsCell({ userId, isPro }: UserActionsCellProps) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const run = (action: (id: string) => Promise<{ success: boolean; message: string }>) => {
    startTransition(async () => {
      const result = await action(userId)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleDowngrade = () => {
    if (!confirm("Are you sure you want to downgrade this user to Free?")) return
    run(downgradeUserToFree)
  }

  return isPro ? (
    <Button size="sm" variant="ghost" onClick={handleDowngrade} disabled={pending} className="text-destructive hover:text-destructive">
      {pending ? "Saving…" : "Downgrade"}
    </Button>
  ) : (
    <Button size="sm" variant="outline" onClick={() => run(upgradeUserToPro)} disabled={pending}>
      {pending ? "Saving…" : "Upgrade to Pro"}
    </Button>
  )
}
