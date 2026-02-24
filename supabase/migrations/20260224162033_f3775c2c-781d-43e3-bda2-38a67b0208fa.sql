
-- Add domain_id column to subscriptions (nullable for backward compat with existing rows)
ALTER TABLE public.subscriptions ADD COLUMN domain_id text;

-- Update existing subscriptions to have a null domain_id (they'll be treated as "all domains" for legacy)
