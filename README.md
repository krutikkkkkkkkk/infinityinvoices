# Infinity Invoice

Create, send and track invoices and quotations — with clients, products, recurring invoicing, payment reminders, multi-currency support and a Telegram bot.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/krutik/invoice)

## Features

- **Invoices & quotations** — create, edit, preview and export to PDF; share a public link (`/invoice/[token]`)
- **Clients, products & presets** — reusable data for faster document creation
- **Email delivery & reminders** — send invoices and automatic payment reminders via Resend
- **Recurring invoicing** — daily cron job (`/api/cron/invoicing`, 01:00 UTC)
- **Multi-currency** — per-document currency plus a built-in currency converter
- **Telegram bot** — manage documents from Telegram
- **Subscriptions** — Pro and Lifetime plans via Dodo Payments
- **Admin panel** — users, documents, subscriptions, revenue and analytics

## Tech stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui · Supabase (auth + Postgres) · Resend · Dodo Payments · Turborepo + pnpm

## Monorepo layout

| Path | What it is | Dev URL |
| --- | --- | --- |
| `apps/web` | The invoicing app (dashboard, auth, API) | http://localhost:3000 |
| `apps/landing` | Marketing landing page | http://localhost:3001 |
| `packages/ui` | Shared theme tokens (`theme.css`) and `cn()` | |
| `packages/typescript-config` | Shared `tsconfig` presets | |

## Getting started

Requires Node.js 22+ and pnpm.

```bash
pnpm install          # install everything
pnpm dev              # run both apps
pnpm dev:web          # run only the app
pnpm dev:landing      # run only the landing page
pnpm build            # build everything
pnpm lint             # lint everything
```

### Database

Create a Supabase project, then run the SQL files in [`apps/web/scripts/`](apps/web/scripts/) in order using the Supabase SQL editor.

### Environment variables

Each app reads its own env file: `apps/web/.env.local` and `apps/landing/.env.local`.

**`apps/web`**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin access (webhooks, cron) |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the app |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | Auth redirect URL in local dev |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Sending invoices and reminders |
| `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, `DODO_PAYMENTS_ENVIRONMENT` | Checkout and subscription webhooks |
| `NEXT_PUBLIC_DODO_PRO_PRODUCT_ID`, `NEXT_PUBLIC_DODO_LIFETIME_PRODUCT_ID` | Dodo product IDs per plan |
| `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET` | Legacy Polar subscribers (portal + webhook) |
| `CRON_SECRET` | Protects `/api/cron/invoicing` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET` | Telegram bot |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Logo uploads (see [`IMGBB_SETUP.md`](apps/web/IMGBB_SETUP.md)) |

**`apps/landing`**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | URL of the invoicing app that the landing page links to |

See also [`MULTI_CURRENCY_SETUP.md`](apps/web/MULTI_CURRENCY_SETUP.md).

## Deployment

Both apps deploy to Vercel as separate projects, with **Root Directory** set to `apps/web` or `apps/landing`. The cron schedule is defined in [`apps/web/vercel.json`](apps/web/vercel.json).

Production: **[vercel.com/krutik/invoice](https://vercel.com/krutik/invoice)**

## Contributing

We welcome community contributions.

- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [Support](./SUPPORT.md)

If you'd like to support development, check the **Sponsor** button on GitHub.
