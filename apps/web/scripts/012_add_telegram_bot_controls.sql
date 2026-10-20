-- Applied to Supabase as add_telegram_bot_controls.
create table if not exists public.telegram_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  telegram_user_id bigint not null unique,
  telegram_chat_id bigint not null,
  telegram_username text,
  first_name text,
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  is_active boolean not null default true
);
create table if not exists public.telegram_link_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.telegram_pending_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  telegram_chat_id bigint not null,
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.telegram_processed_updates (update_id bigint primary key, processed_at timestamptz not null default now());
create table if not exists public.telegram_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  telegram_user_id bigint,
  action text not null,
  resource_type text,
  resource_id uuid,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists telegram_link_tokens_user_id_idx on public.telegram_link_tokens(user_id);
create index if not exists telegram_link_tokens_expires_at_idx on public.telegram_link_tokens(expires_at);
create index if not exists telegram_pending_actions_lookup_idx on public.telegram_pending_actions(user_id, telegram_chat_id, expires_at);
create index if not exists telegram_audit_logs_user_created_idx on public.telegram_audit_logs(user_id, created_at desc);
alter table public.telegram_accounts enable row level security;
alter table public.telegram_link_tokens enable row level security;
alter table public.telegram_pending_actions enable row level security;
alter table public.telegram_processed_updates enable row level security;
alter table public.telegram_audit_logs enable row level security;
create policy "Users can view own Telegram account" on public.telegram_accounts for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can delete own Telegram account" on public.telegram_accounts for delete to authenticated using ((select auth.uid()) = user_id);
create policy "Users can view own Telegram link tokens" on public.telegram_link_tokens for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create own Telegram link tokens" on public.telegram_link_tokens for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can delete own Telegram link tokens" on public.telegram_link_tokens for delete to authenticated using ((select auth.uid()) = user_id);
create policy "Users can view own Telegram audit logs" on public.telegram_audit_logs for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.telegram_pending_actions from anon, authenticated;
revoke all on public.telegram_processed_updates from anon, authenticated;
revoke insert, update, delete on public.telegram_accounts from anon, authenticated;
revoke update on public.telegram_link_tokens from anon, authenticated;
revoke insert, update, delete on public.telegram_audit_logs from anon, authenticated;
