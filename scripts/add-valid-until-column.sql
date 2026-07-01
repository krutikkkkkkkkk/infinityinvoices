-- Add valid_until column for quotations
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS valid_until timestamp with time zone;

-- Add comment explaining the column
COMMENT ON COLUMN public.documents.valid_until IS 'Expiry/validity date for quotations. Used for quotation documents to indicate when the quote is no longer valid.';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_documents_valid_until ON public.documents(valid_until);
