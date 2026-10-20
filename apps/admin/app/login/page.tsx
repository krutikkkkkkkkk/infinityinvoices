import { LoginForm } from "./login-form"

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "This account doesn't have admin access.",
  auth: "Sign-in failed. Please try again.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2">
          <img src="/brand-logo.svg" alt="" className="size-8 rounded-lg" />
          <span className="text-lg font-semibold">Infinity Invoice Admin</span>
        </div>
        <LoginForm initialError={error ? ERROR_MESSAGES[error] ?? null : null} />
      </div>
    </div>
  )
}
