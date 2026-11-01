"use client"

import React from "react"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon, CheckmarkCircle02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { authClient } from "@/lib/auth/client"
import { authErrorMessage } from "@/lib/auth/error-message"
import { getSiteUrl } from "@/lib/site-url"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // The reset page sends the user back here with ?error= when a link is expired or already used
  useEffect(() => {
    const message = new URLSearchParams(window.location.search).get("error")
    if (message) setError(message)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        // The emailed link lands on the reset form with ?token= (or ?error=INVALID_TOKEN).
        const { error } = await authClient.requestPasswordReset({
          email,
          redirectTo: `${getSiteUrl()}/auth/reset-password`,
        })
        if (error) throw error
        setSuccess(true)
      } catch (error: unknown) {
        setError(authErrorMessage(error))
      }
    })
  }

  if (success) {
    return (
      <AuthLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={48} color="#16a34a" className="mx-auto" />
              <h2 className="text-xl font-semibold">Check your email</h2>
              <p className="text-muted-foreground">
                We have sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Did not receive the email? Check your spam folder or try again.
              </p>
              <Button variant="outline" asChild className="mt-4 bg-transparent">
                <Link href="/auth/login">
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-2" />
                  Back to login
                </Link>
              </Button>
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
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we will send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 animate-spin" />}
              Send Reset Link
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
