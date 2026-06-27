-- Add default_currency column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'INR';

-- Add constraint to ensure valid currency values
ALTER TABLE public.profiles ADD CONSTRAINT valid_currency CHECK (
  default_currency IN ('INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'CHF', 'SGD', 'AED', 'SAR', 'MXN', 'BRL', 'ZAR')
);
