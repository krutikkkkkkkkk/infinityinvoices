"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type OAuthProvider = "google" | "github"

export function LoginForm({ initialError }: { initialError: string | null }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(initialError)
  const [pending, setPending] = useState<"email" | OAuthProvider | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending("email")
    setError(null)

    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setPending(null)
      return
    }

    router.replace("/")
    router.refresh()
  }

  const handleOAuth = async (provider: OAuthProvider) => {
    setPending(provider)
    setError(null)

    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setPending(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Sign in with an admin account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending !== null}>
            {pending === "email" ? "Logging in..." : "Login"}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" disabled={pending !== null} onClick={() => handleOAuth("google")}>
              {pending === "google" ? "..." : "Google"}
            </Button>
            <Button type="button" variant="outline" disabled={pending !== null} onClick={() => handleOAuth("github")}>
              {pending === "github" ? "..." : "GitHub"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
