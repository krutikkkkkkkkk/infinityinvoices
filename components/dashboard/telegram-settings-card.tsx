"use client"

import { useState, useTransition } from "react"
import { ExternalLink, Loader2, MessageCircle, ShieldCheck, Unlink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { generateTelegramLink, disconnectTelegram } from "@/app/dashboard/settings/telegram-actions"

interface TelegramSettingsCardProps {
  account: {
    telegram_username: string | null
    first_name: string | null
    linked_at: string
  } | null
}

export function TelegramSettingsCard({ account }: TelegramSettingsCardProps) {
  const [isPending, startTransition] = useTransition()
  const [link, setLink] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const connect = () => startTransition(async () => {
    try {
      const result = await generateTelegramLink()
      setLink(result.url)
      setMessage("This secure link expires in 15 minutes and can only be used once.")
      window.open(result.url, "_blank", "noopener,noreferrer")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create a Telegram link")
    }
  })

  const disconnect = () => startTransition(async () => {
    try {
      await disconnectTelegram()
      setLink(null)
      setMessage("Telegram disconnected. Refreshing settings…")
      window.location.reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not disconnect Telegram")
    }
  })

  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageCircle className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <CardTitle>Telegram controls</CardTitle>
            <CardDescription className="mt-1 text-pretty">
              Manage invoices, quotations, clients, products, payments, reminders, recurring work, and reports from a private bot chat.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {account ? (
          <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                Connected securely
              </div>
              <p className="mt-1 break-words text-sm text-muted-foreground">
                {account.telegram_username ? `@${account.telegram_username}` : account.first_name || "Telegram account"}
                {" · Linked "}{new Date(account.linked_at).toLocaleDateString()}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={disconnect} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Unlink className="size-4" aria-hidden="true" />}
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3"><p className="font-medium">Your data only</p><p className="mt-1 text-sm text-muted-foreground">The bot is scoped to your signed-in account.</p></div>
              <div className="rounded-lg border p-3"><p className="font-medium">Payment confirmation</p><p className="mt-1 text-sm text-muted-foreground">Every payment requires Confirm or Cancel.</p></div>
              <div className="rounded-lg border p-3"><p className="font-medium">Audit history</p><p className="mt-1 text-sm text-muted-foreground">Bot actions are recorded for accountability.</p></div>
            </div>
            <Button type="button" onClick={connect} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <MessageCircle className="size-4" aria-hidden="true" />}
              Connect Telegram
            </Button>
          </div>
        )}

        {link && !account && (
          <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 break-all text-sm font-medium text-primary underline-offset-4 hover:underline">
            Open the secure Telegram link <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
          </a>
        )}
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        <p className="text-xs leading-relaxed text-muted-foreground">
          Telegram will never ask for your Infinity Invoices password. Disconnect access here at any time.
        </p>
      </CardContent>
    </Card>
  )
}
