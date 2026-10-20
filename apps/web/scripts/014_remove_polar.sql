-- Polar has been removed; Dodo Payments is the only payment provider.
-- Drops the Polar ID columns from subscriptions. This permanently deletes the stored Polar IDs.
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS polar_customer_id;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS polar_subscription_id;
