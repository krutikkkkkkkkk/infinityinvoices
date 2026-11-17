import { CodeXml, Database, FileDown, GitPullRequest, Scale, Server } from "lucide-react"
import { DataTable } from "@/components/blog/blocks"
import { GITHUB_URL } from "@/lib/config"
import type { ToolPage } from "@/lib/tools"

export const tool: ToolPage = {
  slug: "open-source-invoice-generator",
  name: "Open source invoice generator",
  summary: "MIT licensed. Read it, fork it or self-host it.",
  title: "Open Source Invoice Generator (MIT) | Infinity Invoices",
  description:
    "An open source invoice generator you can read, fork and self-host. MIT licensed, built with Next.js and Postgres. Or use the hosted version free.",
  keywords: [
    "open source invoice generator",
    "open source invoicing software",
    "self-hosted invoice generator",
    "self-hosted invoicing",
    "MIT invoice software",
    "Next.js invoice app",
    "free invoicing software",
  ],
  updatedAt: "2026-11-17",
  icon: CodeXml,
  eyebrow: "Open source",
  h1: "Open source invoice generator",
  lead: "Infinity Invoices is MIT licensed and on GitHub. Self-host it on your own Vercel and Neon accounts, or use the hosted version and skip the setup. It is the same code either way.",
  cta: "Use the hosted version free",
  secondaryCta: { label: "View on GitHub", href: GITHUB_URL },
  facts: ["MIT licensed", "Next.js and Postgres", "Self-host or use ours"],
  features: {
    heading: "Invoicing software you can read",
    description: "Nothing is hidden behind an enterprise edition. What runs in production is what is in the repository.",
    items: [
      {
        icon: Scale,
        title: "MIT licensed",
        description: "Use it, change it and run it for your own business, including commercially.",
      },
      {
        icon: CodeXml,
        title: "A stack you already know",
        description: "Next.js, React, Tailwind CSS, Drizzle ORM and Postgres. Nothing exotic to learn before you can change a template.",
      },
      {
        icon: Server,
        title: "Deploys to Vercel and Neon",
        description: "Run the app on Vercel with a Neon Postgres database. Both have free plans to start on.",
      },
      {
        icon: Database,
        title: "Your data in your database",
        description: "Self-hosted, your invoices and client details live in a Postgres database that you control.",
      },
      {
        icon: FileDown,
        title: "No lock-in either way",
        description: "Every invoice downloads as a PDF, hosted or self-hosted, so your records never depend on us.",
      },
      {
        icon: GitPullRequest,
        title: "Open to contributions",
        description: "Issues and pull requests are welcome. The contributing guide is in the repository.",
      },
    ],
  },
  steps: {
    heading: "How to self-host it",
    items: [
      {
        title: "Clone the repository",
        description: "Clone it from GitHub and run pnpm install. You need Node.js 22 or newer and pnpm.",
      },
      {
        title: "Create a Neon database",
        description: "Create a Neon project with Neon Auth turned on, add its details to apps/web/.env, and push the schema with pnpm --filter @infinity/db db:push.",
      },
      {
        title: "Run it",
        description: "pnpm dev starts the app on localhost:3000. To put it online, deploy apps/web to Vercel.",
      },
      {
        title: "Add email if you want it",
        description: "Add a Resend API key to send invoices and reminders by email. PDF download works without one.",
      },
    ],
  },
  guide: {
    heading: "Self-host or hosted?",
    body: (
      <>
        <p>
          The code is identical. The difference is who looks after it. Self-hosting costs nothing but your time, and the
          hosted version costs a little so that you never have to think about a database.
        </p>
        <DataTable
          head={["", "Self-hosted", "Hosted"]}
          rows={[
            ["Cost", "Your own Vercel and Neon accounts", "Free for 5 invoices a month, then $5 a month or $29 once"],
            ["Setup", "Clone, configure and deploy it yourself", "Sign up and send an invoice"],
            ["Updates", "Pull and redeploy when you want them", "Handled for you"],
            ["Data", "In your own Postgres database", "In ours, with every invoice downloadable as a PDF"],
          ]}
        />
        <p>
          The setup steps, environment variables and project layout are in the{" "}
          <a href={`${GITHUB_URL}#readme`}>README on GitHub</a>.
        </p>
      </>
    ),
  },
  faqs: [
    {
      q: "Is Infinity Invoices really open source?",
      a: "Yes. The full source code is on GitHub under the MIT license, which lets you use, modify and self-host it, including for commercial work.",
    },
    {
      q: "What is it built with?",
      a: "Next.js and React with Tailwind CSS, a Neon Postgres database with Drizzle ORM, Neon Auth for sign-in and Resend for email.",
    },
    {
      q: "Do I have to self-host to use it?",
      a: "No. The hosted version at infinityinvoices.com runs the same code. It is free for 5 invoices a month, and paying for Pro is what funds the project.",
    },
    {
      q: "Can I contribute?",
      a: "Yes. Bug reports, fixes and new templates are welcome. Start with the contributing guide in the repository.",
    },
  ],
  guides: ["how-to-write-an-invoice", "invoice-international-clients"],
}
