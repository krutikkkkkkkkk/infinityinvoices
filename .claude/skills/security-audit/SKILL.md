---
name: security-audit
description: Security review checklist for Infinity Invoices (Next.js + Neon Postgres/Neon Auth + Drizzle + Dodo + Resend). Use when adding or changing API routes, server actions, database schema or queries, emails, PDF generation, webhooks, or anything touching plans, payments or auth; or when asked to audit or check security.
---

# Infinity Invoices security audit

Apps: `apps/web` (customer app), `apps/admin` (admin console), `apps/landing` (static).
Data lives in Neon Postgres. The schema is `packages/db/src/schema.ts` (Drizzle, applied with `pnpm --filter @infinity/db db:push`); users and sessions are in Neon Auth's `neon_auth` schema.

Work through every section that the change touches. Report each finding with file:line, a concrete exploit scenario and the fix. Fix only what you can verify.

## 1. Data access (no row-level security)

- The database is only reachable from server code through `db` from `@infinity/db`, which connects as the database owner. There is no RLS: **the WHERE clause is the only access control**. Every query on a user-owned table must filter by the signed-in user's id (`eq(table.user_id, user.id)`), including the WHERE of every UPDATE and DELETE.
- Child rows (`line_items`, `payment_records`, `credit_notes`, `recurring_schedules`, ...) are only read or written after checking that the parent document belongs to the user.
- Never import `@infinity/db` (or anything that does) into a `"use client"` module, and never expose `DATABASE_URL` to the browser.
- Tables users must never write directly: `subscriptions`, `usage_tracking`, `super_admins`. Writes to them come only from trusted server code: Dodo webhook, `lib/usage.ts`, admin actions — never with values taken from a client request.
- Cron and webhooks run without a user: scope each query to the record's own `user_id` explicitly.
- Public share links use the document's `share_token` and must select exactly that one document.

## 2. Authorization in routes and actions

- Every `route.ts` and `"use server"` function is a public endpoint. Call `requireUser()` / `getCurrentUser()` from `@/lib/auth/server` first; the proxy only guards `/dashboard` pages, not actions or API routes.
- Validate ownership of every ID received from the client before using it, especially before handing it to user-less code (cron). Example: `createRecurringSchedule` checks the invoice belongs to the user, and the cron re-checks `source.user_id === schedule.user_id`.
- Admin: `requireAdmin()` / `getAdminUser()` in **every** admin page and server action, not just the layout (layouts are not re-run on client navigation).
- Plan gates (`isPro`) must read the plan from `subscriptions`, which users can't write.

## 3. Secrets and webhooks

- Cron (`/api/cron/*`): fail closed when `CRON_SECRET` is missing.
- Dodo webhook: signature verified by `@dodopayments/nextjs` using `DODO_PAYMENTS_WEBHOOK_KEY`; don't add handlers that skip it.
- Never prefix a secret with `NEXT_PUBLIC_`: it gets inlined into client bundles. Never commit `.env*` or `.claude/settings.local.json`.

## 4. Injection

- HTML strings (`lib/generate-document-html.ts`, Resend emails in `app/api/send-*`): every user-controlled value must go through `escapeHtml` / `escapeHtmlFields` (`lib/escape-html.ts`). User URLs (logos) go through `safeHttpUrl`; values in query strings through `encodeURIComponent`.
- The PDF route renders HTML in server-side Chromium: keep JavaScript disabled and request interception limited to `https:`/`data:` (SSRF).
- React escapes JSX; flag any `dangerouslySetInnerHTML`, `document.write`, `innerHTML`, `srcdoc`.
- Redirects: only same-site relative paths (`/^\/(?![/\\])/`) from `next`/`returnTo` params.
- Response headers built from user data (`Content-Disposition`) must be sanitized.

## 5. Abuse and limits

- Uploads: authenticate, allowlist MIME types, cap size server-side (client checks don't count).
- Email sending: authenticated, plan-gated, recipient validated, usage counted.
- Usage counters are checked and incremented server-side via `consumeUsage` (atomic conditional UPDATE).

## 6. Finish

- Run `pnpm --filter web exec tsc --noEmit` and `pnpm --filter admin exec tsc --noEmit`.
- If the fix needs a DB change, edit `packages/db/src/schema.ts` and tell the user to run `pnpm --filter @infinity/db db:push`; don't claim it is applied.
