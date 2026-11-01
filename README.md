# Infinity Invoice

Create, send and track invoices and quotations — with clients, products, recurring invoicing, payment reminders and multi-currency support.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/krutik/invoice)

## Features

- **Invoices & quotations** — create, edit, preview and export to PDF; share a public link (`/invoice/[token]`)
- **Clients, products & presets** — reusable data for faster document creation
- **Email delivery & reminders** — send invoices via Resend; clients with auto reminders on get a reminder email every week while an invoice is overdue
- **Recurring invoicing, late fees & weekly overdue reminders** — daily cron job (`/api/cron/invoicing`, 01:00 UTC)
- **Multi-currency** — per-document currency plus a built-in currency converter
- **Subscriptions** — Pro and Lifetime plans via Dodo Payments
- **Admin panel** — users, documents, subscriptions, revenue and analytics

## Tech stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui · Neon (Postgres + Neon Auth) · Drizzle ORM · Resend · Dodo Payments · Turborepo + pnpm

## Monorepo layout

| Path | What it is | Dev URL |
| --- | --- | --- |
| `apps/web` | The invoicing app (dashboard, auth, API) | http://localhost:3000 |
| `apps/landing` | Marketing landing page | http://localhost:3001 |
| `apps/admin` | Internal admin panel | http://localhost:3002 |
| `packages/ui` | Shared theme tokens (`theme.css`) and `cn()` | |
| `packages/db` | Drizzle schema and Neon client shared by `web` and `admin` | |
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

The app uses a Neon project with Neon Auth enabled. Link it and pull its env vars into `apps/web/.env` with the Neon CLI (`neon link`, then `neon deploy`), then create the tables from the Drizzle schema:

```bash
pnpm --filter @infinity/db db:push
```

Users live in Neon Auth's `neon_auth` schema; the app's tables are in `public` ([`packages/db/src/schema.ts`](packages/db/src/schema.ts)). There is no row-level security: every query is scoped to the signed-in user in server code. To make someone an admin, insert their user id into `super_admins`.

### Environment variables

Each app reads its own env files: `apps/web/.env` / `.env.local`, `apps/admin/.env.local` and `apps/landing/.env.local`. On Vercel, the Neon integration adds the database and auth variables with a `STORAGE_` prefix; the code reads both spellings.

**`apps/web`**

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Neon Postgres (pooled for the app, unpooled for schema pushes) |
| `NEON_AUTH_BASE_URL` | Neon Auth endpoint |
| `NEON_AUTH_COOKIE_SECRET` | Signs the session cookie cache; 32+ random characters (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the app |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Sending invoices and reminders |
| `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, `DODO_PAYMENTS_ENVIRONMENT` | Checkout and subscription webhooks |
| `NEXT_PUBLIC_DODO_PRO_PRODUCT_ID`, `NEXT_PUBLIC_DODO_LIFETIME_PRODUCT_ID` | Dodo product IDs per plan (Pro monthly, Lifetime one-time) |
| `CRON_SECRET` | Protects `/api/cron/invoicing` |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Logo uploads (see [`IMGBB_SETUP.md`](apps/web/IMGBB_SETUP.md)) |

**`apps/admin`**

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `NEON_AUTH_BASE_URL` | Same Neon project as `apps/web` |
| `NEON_AUTH_COOKIE_SECRET` | Its own 32+ character secret |
| `NEXT_PUBLIC_APP_URL` | URL of the invoicing app |

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
