ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS dob date,
  ADD COLUMN IF NOT EXISTS stream text,
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}';