"use client"

import { useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, Loading01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { downloadPdf } from "@/lib/pdf-download"

export function SharedDocumentDownload({ token, fileName }: { token: string; fileName: string }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    const result = await downloadPdf(`/invoice/${encodeURIComponent(token)}/pdf`, fileName, () =>
      toast.info("Opening the print dialog. Choose “Save as PDF” to download.")
    )
    if (result.status === "error") toast.error(result.message)
    setIsGenerating(false)
  }

  return (
    <Button onClick={handleDownload} disabled={isGenerating} className="shrink-0">
      {isGenerating ? (
        <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />
      ) : (
        <HugeiconsIcon icon={Download01Icon} size={16} className="mr-2" />
      )}
      {isGenerating ? "Generating..." : "Download PDF"}
    </Button>
  )
}
