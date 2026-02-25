
-- ============================================
-- 1. DAILY CODING CHALLENGES
-- ============================================
CREATE TABLE public.daily_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  hints text[] DEFAULT '{}'::text[],
  solution_code text,
  challenge_date date NOT NULL DEFAULT CURRENT_DATE,
  xp_reward integer NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges" ON public.daily_challenges
  FOR SELECT USING (true);

CREATE UNIQUE INDEX idx_daily_challenges_domain_date ON public.daily_challenges (domain_id, challenge_date);

-- Challenge submissions
CREATE TABLE public.challenge_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  code text NOT NULL,
  is_correct boolean DEFAULT false,
  time_taken_seconds integer,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions" ON public.challenge_submissions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON public.challenge_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX idx_one_correct_per_challenge ON public.challenge_submissions (user_id, challenge_id) WHERE is_correct = true;

-- ============================================
-- 2. XP & ACHIEVEMENTS SYSTEM
-- ============================================
CREATE TABLE public.user_xp (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  total_xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp" ON public.user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xp" ON public.user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own xp" ON public.user_xp FOR UPDATE USING (auth.uid() = user_id);

-- Public leaderboard view
CREATE POLICY "Anyone can view leaderboard" ON public.user_xp FOR SELECT USING (true);

-- Achievements definitions
CREATE TABLE public.achievements (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏆',
  xp_reward integer NOT NULL DEFAULT 100,
  category text NOT NULL DEFAULT 'general',
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- User earned achievements
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id text NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX idx_user_achievement_unique ON public.user_achievements (user_id, achievement_id);

-- ============================================
-- 3. AI SKILL RADAR (stored per user per domain)
-- ============================================
CREATE TABLE public.skill_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  domain_id text NOT NULL,
  topic text NOT NULL,
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  assessed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assessments" ON public.skill_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessments" ON public.skill_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessments" ON public.skill_assessments FOR UPDATE USING (auth.uid() = user_id);

CREATE UNIQUE INDEX idx_skill_assessment_unique ON public.skill_assessments (user_id, domain_id, topic);

-- ============================================
-- SEED ACHIEVEMENTS
-- ============================================
INSERT INTO public.achievements (id, name, description, icon, xp_reward, category, requirement_type, requirement_value) VALUES
  ('first_code', 'First Code', 'Submit your first code in the editor', '💻', 50, 'coding', 'submissions', 1),
  ('streak_3', 'On Fire', 'Maintain a 3-day learning streak', '🔥', 100, 'streak', 'streak', 3),
  ('streak_7', 'Week Warrior', '7-day learning streak', '⚡', 250, 'streak', 'streak', 7),
  ('streak_30', 'Monthly Legend', '30-day learning streak', '🌟', 1000, 'streak', 'streak', 30),
  ('domain_1', 'Explorer', 'Start learning in your first domain', '🗺️', 100, 'domains', 'domains_started', 1),
  ('domain_3', 'Polyglot', 'Active in 3 different domains', '🌐', 300, 'domains', 'domains_started', 3),
  ('domain_master', 'Domain Master', 'Complete all topics in a domain', '👑', 500, 'domains', 'domain_completed', 1),
  ('topics_10', 'Knowledge Seeker', 'Complete 10 topics across all domains', '📚', 200, 'learning', 'topics_completed', 10),
  ('topics_50', 'Scholar', 'Complete 50 topics', '🎓', 500, 'learning', 'topics_completed', 50),
  ('challenge_1', 'Challenger', 'Complete your first daily challenge', '🎯', 100, 'challenges', 'challenges_completed', 1),
  ('challenge_10', 'Challenge Pro', 'Complete 10 daily challenges', '🏅', 300, 'challenges', 'challenges_completed', 10),
  ('mentor_1', 'Mentee', 'Book your first mentor session', '🤝', 150, 'mentoring', 'mentor_sessions', 1),
  ('bookmark_5', 'Curator', 'Bookmark 5 resources', '📌', 75, 'engagement', 'bookmarks', 5);
