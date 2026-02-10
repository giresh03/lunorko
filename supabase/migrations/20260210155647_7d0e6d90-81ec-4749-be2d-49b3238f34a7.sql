
-- Add roadmap/guidance columns to mentors table
ALTER TABLE public.mentors
ADD COLUMN IF NOT EXISTS college_preparation text,
ADD COLUMN IF NOT EXISTS tech_stack text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS career_tips text,
ADD COLUMN IF NOT EXISTS journey_summary text;
