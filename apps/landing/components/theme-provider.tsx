'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

// The theme script only has to run from the server HTML, before first paint. When React renders it
// on the client it never runs and React 19 logs "Encountered a script tag", so mark it as data there.
// next-themes already suppresses the resulting hydration mismatch on this tag.
const scriptProps = { type: typeof window === 'undefined' ? 'text/javascript' : 'application/json' }

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider scriptProps={scriptProps} {...props}>
      {children}
    </NextThemesProvider>
  )
}
