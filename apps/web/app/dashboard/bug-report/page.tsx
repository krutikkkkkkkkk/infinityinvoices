"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, ExternalLink, BookOpen } from "lucide-react"
import Link from "next/link"

const GITHUB_REPO = "https://github.com/krutikkkkkkkkk/infinityinvoices"
const GITHUB_ISSUES = `${GITHUB_REPO}/issues`
const GITHUB_DISCUSSIONS = `${GITHUB_REPO}/discussions`

export default function BugReportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Report a Bug</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Help us improve Infinity Invoices by reporting issues you encounter
        </p>
      </div>

      {/* Main Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Report Bug Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Report a Bug
            </CardTitle>
            <CardDescription>
              Found something broken? Create an issue on GitHub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Report bugs and technical issues directly on our GitHub repository. Be as detailed as possible to help us fix things faster.
            </p>
            <Button asChild className="w-full">
              <a href={GITHUB_ISSUES} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Open GitHub Issues
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Suggestions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Feature Requests
            </CardTitle>
            <CardDescription>
              Have an idea? Share it with the community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Suggest new features and improvements. Discussions help us understand what users need most.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <a href={GITHUB_DISCUSSIONS} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                View Discussions
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* How to Report */}
      <Card>
        <CardHeader>
          <CardTitle>How to Report a Bug</CardTitle>
          <CardDescription>
            Follow these steps to create a helpful bug report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">Describe the Problem</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Explain what you were trying to do and what happened instead of expected behavior
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">Steps to Reproduce</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Provide clear steps on how we can reproduce the issue on our end
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">Environment Details</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Mention your browser, device, and any relevant configuration
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                4
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">Screenshots or Logs</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Attach screenshots, error messages, or console logs to help us understand the issue
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Source Info */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">This is Open Source</CardTitle>
          <CardDescription className="text-blue-800 dark:text-blue-200">
            Infinity Invoices is open source. You can view, contribute, and report issues on GitHub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900">
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              View on GitHub
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
