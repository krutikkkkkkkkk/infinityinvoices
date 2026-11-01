"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Link01Icon, LinkSquare02Icon, Loading01Icon, Unlink01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { disableShareLink, enableShareLink } from "@/app/dashboard/documents/actions"
import type { Document } from "@/lib/types"
import type { TemplateColors, TemplateType } from "@/lib/generate-document-html"
import { getShareLinkUrl } from "@/lib/site-url"

interface ShareLinkDialogProps {
  document: Pick<Document, "id" | "type" | "number" | "share_enabled" | "share_token">
  template: TemplateType
  colors?: Partial<TemplateColors> | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the upgrade message when the server says the plan doesn't include sharing. */
  onProRequired: (message: string) => void
}

export function ShareLinkDialog({ document, template, colors, open, onOpenChange, onProRequired }: ShareLinkDialogProps) {
  const [token, setToken] = useState<string | null>(document.share_enabled && document.share_token ? document.share_token : null)
  const [isPending, startTransition] = useTransition()
  const label = document.type === "invoice" ? "invoice" : "quotation"
  const url = token ? getShareLinkUrl(token) : ""

  // Also used when the link is already on, to update the template and colours it shows
  const share = () => {
    startTransition(async () => {
      try {
        const result = await enableShareLink(document.id, { template, colors })
        if (result.error?.startsWith("PRO_REQUIRED:")) {
          onOpenChange(false)
          onProRequired(result.error.replace("PRO_REQUIRED:", ""))
        } else if (result.error) {
          toast.error(result.error)
        } else if (result.token) {
          if (token) toast.success("The link now uses your current template and colours.")
          setToken(result.token)
        }
      } catch {
        toast.error("Could not create the link. Please try again.")
      }
    })
  }

  const unshare = () => {
    startTransition(async () => {
      try {
        await disableShareLink(document.id)
        setToken(null)
        toast.success("Link turned off. The old URL no longer works.")
      } catch {
        toast.error("Could not turn off the link. Please try again.")
      }
    })
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied")
    } catch {
      toast.error("Could not copy. Select the link and copy it manually.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {document.number} via link</DialogTitle>
          <DialogDescription>
            Anyone with the link can view this {label} and download it as a PDF, without signing in. It
            shows your current template and colours.
          </DialogDescription>
        </DialogHeader>

        {token ? (
          <div className="space-y-3 py-2">
            <div className="flex gap-2">
              <Input readOnly value={url} aria-label="Share link" onFocus={(e) => e.currentTarget.select()} />
              <Button type="button" variant="outline" onClick={copy}>
                <HugeiconsIcon icon={Copy01Icon} size={16} className="mr-2" />
                Copy
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <HugeiconsIcon icon={LinkSquare02Icon} size={16} className="mr-2" />
                  Open
                </a>
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={share} disabled={isPending}>
                Use current template
              </Button>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {token ? (
            <Button
              type="button"
              variant="outline"
              onClick={unshare}
              disabled={isPending}
              className="text-destructive hover:text-destructive"
            >
              {isPending ? (
                <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
              ) : (
                <HugeiconsIcon icon={Unlink01Icon} size={16} className="mr-2" />
              )}
              Turn off link
            </Button>
          ) : (
            <Button type="button" onClick={share} disabled={isPending}>
              {isPending ? (
                <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
              ) : (
                <HugeiconsIcon icon={Link01Icon} size={16} className="mr-2" />
              )}
              Create link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
