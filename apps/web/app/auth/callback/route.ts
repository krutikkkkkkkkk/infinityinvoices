import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const RESET_PASSWORD_PATH = '/auth/reset-password'

// Only allow same-site paths: "//evil.com", "/\evil.com" or "@evil.com" would redirect off-site
function safeNext(value: string | null): string {
  if (value && /^\/(?![/\\])/.test(value)) return value
  return '/dashboard'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))
  const isPasswordReset = next.startsWith(RESET_PASSWORD_PATH)

  // Supabase reports link problems (expired / already used) as query params instead of a code
  const providerError =
    searchParams.get('error_description') ?? searchParams.get('error')

  let errorMessage = providerError ?? 'Could not authenticate'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    errorMessage = error.message
  }

  const fallback = isPasswordReset ? '/auth/forgot-password' : '/auth/login'
  const url = new URL(fallback, origin)
  url.searchParams.set(
    'error',
    isPasswordReset
      ? 'This password reset link is invalid or has expired. Please request a new one.'
      : errorMessage,
  )
  return NextResponse.redirect(url)
}
