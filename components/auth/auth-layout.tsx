import Link from "next/link"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-between p-6 md:p-10">
      <div className="w-full" />
      
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/brand-logo.svg" alt="Infinity Invoice" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold">InfinityInvoice</span>
          </Link>
        </div>

        {/* Content */}
        {children}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          Simplify your invoicing workflow — {" "}
          <Link href="https://infinitylinkage.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            Developed by infinitylinkage
          </Link>
        </p>
      </div>
    </div>
  )
}
