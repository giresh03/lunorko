
-- Mentors table
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  domain_id TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  meeting_link TEXT,
  years_experience INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- Anyone can view active mentors
CREATE POLICY "Anyone can view active mentors"
  ON public.mentors FOR SELECT
  USING (is_active = true);

-- Mentor availability slots
CREATE TABLE public.mentor_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(mentor_id, slot_date, start_time)
);

ALTER TABLE public.mentor_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can view available slots
CREATE POLICY "Anyone can view slots"
  ON public.mentor_slots FOR SELECT
  USING (true);

-- Only authenticated users can update slots (for booking)
CREATE POLICY "Auth users can update slots"
  ON public.mentor_slots FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.mentor_slots(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slot_id)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Students can view their own bookings
CREATE POLICY "Students can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert bookings
CREATE POLICY "Students can insert bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can cancel their own bookings
CREATE POLICY "Students can delete own bookings"
  ON public.bookings FOR DELETE
  USING (auth.uid() = student_id);
