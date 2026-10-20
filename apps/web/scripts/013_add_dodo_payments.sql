-- Dodo Payments replaces Polar for new purchases.
-- Polar columns are kept so existing Polar subscribers keep syncing via /api/webhooks/polar.
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS subscriptions_dodo_customer_id_idx ON public.subscriptions (dodo_customer_id);
CREATE INDEX IF NOT EXISTS subscriptions_dodo_subscription_id_idx ON public.subscriptions (dodo_subscription_id);
