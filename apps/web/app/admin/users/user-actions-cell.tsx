"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { upgradeUserToPro, downgradeUserToFree } from "./actions"
import { Crown, Zap } from "lucide-react"

interface UserActionsCellProps {
  userId: string
  isPro: boolean
}

export function UserActionsCell({ userId, isPro }: UserActionsCellProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    const result = await upgradeUserToPro(userId)
    if (result.success) {
      window.location.reload()
    }
    setLoading(false)
  }

  const handleDowngrade = async () => {
    setLoading(false)
    if (!confirm("Are you sure you want to downgrade this user to Free?")) {
      return
    }
    setLoading(true)
    const result = await downgradeUserToFree(userId)
    if (result.success) {
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      {isPro ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleDowngrade}
          disabled={loading}
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <Zap className="h-3 w-3 mr-1" />
          Downgrade
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={handleUpgrade}
          disabled={loading}
          className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 hover:bg-yellow-500/30"
        >
          <Crown className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  )
}
