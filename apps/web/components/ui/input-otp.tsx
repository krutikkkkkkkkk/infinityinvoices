"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function InputOTP({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return <input className={cn("", className)} {...props} />
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center", className)} {...props} />
}

function InputOTPSlot({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border rounded p-2", className)} {...props} />
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return <div {...props}>-</div>
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
