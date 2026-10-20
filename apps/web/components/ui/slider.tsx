"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Slider({
  className,
  ...props
}: React.ComponentProps<"input"> & { defaultValue?: number[]; value?: number[] }) {
  return (
    <input
      type="range"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

export { Slider }
