"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card className="items-center gap-3 px-6 py-12 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "This page couldn't be loaded."}
      </p>
      <Button size="sm" onClick={reset}>
        Try again
      </Button>
    </Card>
  )
}
