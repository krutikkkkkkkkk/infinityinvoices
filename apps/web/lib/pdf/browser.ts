import "server-only"
import { existsSync } from "node:fs"
import type { Browser } from "puppeteer-core"

/**
 * Resolves a Chromium executable for server-side PDF rendering.
 *
 * Resolution order:
 *  1. `PUPPETEER_EXECUTABLE_PATH` / `CHROME_EXECUTABLE_PATH` (explicit override)
 *  2. `@sparticuz/chromium` when running on Linux serverless (Vercel / Lambda)
 *  3. A locally installed Chrome / Edge / Chromium (dev machines)
 *  4. Playwright's bundled Chromium, if it has been installed
 *  5. `@sparticuz/chromium` on any other Linux host
 */

export interface BrowserTarget {
  executablePath: string
  args: string[]
  headless: true | "shell"
  source: "env" | "sparticuz" | "local" | "playwright"
}

const BASE_ARGS = [
  "--disable-gpu",
  "--hide-scrollbars",
  "--font-render-hinting=none",
  "--disable-dev-shm-usage",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "--disable-background-networking",
]

function localCandidates(): string[] {
  const env = process.env
  switch (process.platform) {
    case "win32":
      return [
        env.PROGRAMFILES && `${env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
        env["PROGRAMFILES(X86)"] && `${env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
        env.LOCALAPPDATA && `${env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        env.PROGRAMFILES && `${env.PROGRAMFILES}\\Microsoft\\Edge\\Application\\msedge.exe`,
        env["PROGRAMFILES(X86)"] && `${env["PROGRAMFILES(X86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`,
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      ].filter((p): p is string => Boolean(p))
    case "darwin":
      return [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
      ]
    default:
      return [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/snap/bin/chromium",
        "/usr/bin/microsoft-edge",
      ]
  }
}

function isServerlessLinux(): boolean {
  return (
    process.platform === "linux" &&
    Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV)
  )
}

async function sparticuzTarget(): Promise<BrowserTarget> {
  const chromium = (await import("@sparticuz/chromium")).default
  return {
    executablePath: await chromium.executablePath(),
    args: [...chromium.args, ...BASE_ARGS],
    headless: "shell",
    source: "sparticuz",
  }
}

async function playwrightTarget(): Promise<BrowserTarget | null> {
  try {
    const playwright = await import("playwright")
    const executablePath = playwright.chromium.executablePath()
    if (executablePath && existsSync(executablePath)) {
      return { executablePath, args: BASE_ARGS, headless: true, source: "playwright" }
    }
  } catch {
    // playwright not installed or browsers missing
  }
  return null
}

export async function resolveBrowserTarget(): Promise<BrowserTarget> {
  const override = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_EXECUTABLE_PATH
  if (override) {
    if (existsSync(override)) {
      return { executablePath: override, args: BASE_ARGS, headless: true, source: "env" }
    }
    console.warn(`[pdf] PUPPETEER_EXECUTABLE_PATH is set but does not exist: ${override}`)
  }

  if (isServerlessLinux()) {
    return sparticuzTarget()
  }

  for (const candidate of localCandidates()) {
    if (existsSync(candidate)) {
      return { executablePath: candidate, args: BASE_ARGS, headless: true, source: "local" }
    }
  }

  const playwright = await playwrightTarget()
  if (playwright) return playwright

  if (process.platform === "linux") {
    return sparticuzTarget()
  }

  throw new Error(
    "No Chromium executable found for PDF rendering. Install Google Chrome, or set PUPPETEER_EXECUTABLE_PATH."
  )
}

export async function launchBrowser(): Promise<{ browser: Browser; target: BrowserTarget }> {
  const puppeteer = (await import("puppeteer-core")).default
  const target = await resolveBrowserTarget()
  const browser = await puppeteer.launch({
    executablePath: target.executablePath,
    args: target.args,
    headless: target.headless,
    timeout: 30_000,
  })
  return { browser, target }
}
