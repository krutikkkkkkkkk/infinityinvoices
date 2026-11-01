---
name: security-audit
description: Security review checklist for Infinity Invoices (Next.js + Supabase + Dodo + Resend). Use when adding or changing API routes, server actions, SQL migrations/RLS, emails, PDF generation, webhooks, or anything touching plans, payments or auth; or when asked to audit or check security.
---

# Infinity Invoices security audit

Apps: `apps/web` (customer app), `apps/admin` (admin console), `apps/landing` (static).
Data lives in Supabase with RLS; SQL migrations are in `apps/web/scripts/` (numbered, applied by hand in the Supabase SQL editor).

Work through every section that the change touches. Report each finding with file:line, a concrete exploit scenario and the fix. Fix only what you can verify.

## 1. Supabase RLS and the two clients

- `createClient()` (`lib/supabase/server.ts`, `client.ts`) runs as the signed-in user, under RLS. The anon key is public, so **any RLS policy is callable directly from the browser**: never rely on server code alone to restrict what a user writes with this client.
- `createAdminClient()` (`lib/supabase/admin.ts`) is the service role and bypasses RLS. Every query with it must be scoped explicitly (`.eq("user_id", userId)`, a validated share token, etc.) and must only run after authentication/authorization.
- Tables users must never write themselves: `subscriptions`, `usage_tracking`, `super_admins` (privileges revoked in `015_security_hardening.sql`). Writes to them go through the service role: Dodo webhook, `lib/usage.ts`, admin actions.
- For a new table: `ENABLE ROW LEVEL SECURITY`, policies per command, and for child rows (`document_id`, `source_document_id`, ...) a `WITH CHECK` that the parent row belongs to `auth.uid()`. `USING` alone does not validate foreign keys on insert.
- Never add a public (`anon`) SELECT policy on `documents` for the share page; `app/invoice/[token]` uses the service role scoped to one token.
- Quick live check (read-only): query `/rest/v1/<table>?select=*&limit=1` with only the anon key and `Prefer: count=exact`; every table should report `*/0`.

## 2. Authorization in routes and actions

- Every `route.ts` and `"use server"` function is a public endpoint. Call `supabase.auth.getUser()` first (not `getSession()`).
- Validate ownership of every ID received from the client before using it, especially before handing it to service-role code (cron). Example: `createRecurringSchedule` checks the invoice belongs to the user, and the cron re-checks `source.user_id === schedule.user_id`.
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
- Usage counters are checked and incremented server-side via `consumeUsage` with the service role.

## 6. Finish

- Run `pnpm --filter web exec tsc --noEmit` and `pnpm --filter admin exec tsc --noEmit`.
- If the fix needs a DB change, add the next numbered script in `apps/web/scripts/` and tell the user it must be run in Supabase; don't claim it is applied.
