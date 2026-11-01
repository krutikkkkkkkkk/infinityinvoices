"use client"

import React from "react"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { authClient } from "@/lib/auth/client"
import { authErrorMessage } from "@/lib/auth/error-message"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  // "checking" until we've read the reset token from the link
  const [linkState, setLinkState] = useState<"checking" | "valid" | "invalid">("checking")
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // The emailed link carries ?token=; an expired or used one arrives as ?error=INVALID_TOKEN
    const params = new URLSearchParams(window.location.search)
    const linkToken = params.get("token")
    setToken(linkToken)
    setLinkState(linkToken && !params.get("error") ? "valid" : "invalid")
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    startTransition(async () => {
      try {
        const { error } = await authClient.resetPassword({ newPassword: password, token: token! })
        if (error) throw error
        setSuccess(true)
        // Resetting doesn't sign the user in
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } catch (error: unknown) {
        setError(authErrorMessage(error))
      }
    })
  }

  if (linkState === "checking") {
    return (
      <AuthLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <HugeiconsIcon icon={Loading01Icon} size={16} className="animate-spin" />
              Verifying your reset link...
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  if (linkState === "invalid") {
    return (
      <AuthLayout>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset link expired</CardTitle>
            <CardDescription>
              This password reset link is invalid or has already been used. Request a new one to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">Request a new link</Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  if (success) {
    return (
      <AuthLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={48} color="#16a34a" className="mx-auto" />
              <h2 className="text-xl font-semibold">Password Updated!</h2>
              <p className="text-muted-foreground">
                Your password has been successfully changed. Redirecting to login...
              </p>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />}
              Update Password
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
            </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
