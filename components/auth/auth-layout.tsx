import Link from "next/link"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-between p-4 sm:p-6 md:p-10 gap-4 sm:gap-6">
      {/* Header Navigation */}
      <div className="w-full flex items-center justify-between">
        <div></div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link 
            href="/auth/login" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
        </nav>
      </div>
      
      <div className="w-full max-w-sm px-0">
        {/* Logo */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
            <img src="/brand-logo.svg" alt="Infinity Invoice" className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg" />
            <span className="text-base sm:text-xl font-bold">InfinityInvoice</span>
          </Link>
        </div>

        {/* Content */}
        <div className="px-2 sm:px-0">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs sm:text-xs text-muted-foreground px-2">
        <p className="break-words">
          Simplify your invoicing workflow — {" "}
          <Link href="https://infinitylinkage.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors whitespace-nowrap">
            Developed by infinitylinkage
          </Link>
        </p>
      </div>
    </div>
  )
}
