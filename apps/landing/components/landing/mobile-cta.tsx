"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { APP_URL } from "@/lib/config"
import { button } from "./ui"

/** Phone-only sign-up bar, shown between the hero and the final call to action. */
export function MobileCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const targets = ["top", "get-started"].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    const showing = new Map<Element, boolean>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) showing.set(entry.target, entry.isIntersecting)
      setVisible(![...showing.values()].some(Boolean))
    })
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full border border-border/60 bg-card/95 py-1.5 pr-1.5 pl-4 shadow-[0_8px_24px_-8px_rgb(0_0_0/0.25)] backdrop-blur transition-[opacity,translate] duration-300 md:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <p className="text-xs text-muted-foreground">Free for 5 invoices a month</p>
      <a href={`${APP_URL}/auth/sign-up`} tabIndex={visible ? 0 : -1} className={cn(button.brand, "h-9 px-4 text-[13px]")}>
        Start free
        <ArrowRight className="size-3.5" aria-hidden />
      </a>
    </div>
  )
}
