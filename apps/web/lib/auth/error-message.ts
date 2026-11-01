/**
 * Message to show for a failed Neon Auth call. The client throws an AuthHttpError whose `.error`
 * is the raw Better Auth body ({ code, message }); Better Auth's `{ error }` result has `.message`.
 */
export function authErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const raw = (error as { error?: unknown }).error
    if (raw && typeof raw === "object" && typeof (raw as { message?: unknown }).message === "string") {
      const message = (raw as { message: string }).message
      if (message) return message
    }
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message) return message
  }
  return "An error occurred"
}
