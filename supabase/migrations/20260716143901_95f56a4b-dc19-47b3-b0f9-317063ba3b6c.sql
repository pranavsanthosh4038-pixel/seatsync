
-- MOVIES
CREATE TABLE public.movies (
  slug text PRIMARY KEY,
  title text NOT NULL,
  genre text,
  language text,
  rating text,
  duration text,
  poster text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.movies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movies TO authenticated;
GRANT ALL ON public.movies TO service_role;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movies public read" ON public.movies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "movies staff write" ON public.movies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "movies staff update" ON public.movies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "movies staff delete" ON public.movies FOR DELETE TO authenticated USING (true);

-- SHOWS
CREATE TABLE public.shows (
  id text PRIMARY KEY,
  movie_slug text NOT NULL REFERENCES public.movies(slug) ON DELETE CASCADE,
  theatre text NOT NULL,
  screen text NOT NULL,
  time text NOT NULL,
  starts_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX shows_movie_idx ON public.shows(movie_slug);
GRANT SELECT ON public.shows TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shows TO authenticated;
GRANT ALL ON public.shows TO service_role;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shows public read" ON public.shows FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "shows staff write" ON public.shows FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "shows staff update" ON public.shows FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shows staff delete" ON public.shows FOR DELETE TO authenticated USING (true);

-- ADMIN ACTIVITY
CREATE TABLE public.admin_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  seat_id text,
  show_id text,
  target_phone text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_activity_created_idx ON public.admin_activity(created_at DESC);
GRANT SELECT, INSERT ON public.admin_activity TO authenticated;
GRANT ALL ON public.admin_activity TO service_role;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity staff read" ON public.admin_activity FOR SELECT TO authenticated USING (true);
CREATE POLICY "activity staff insert" ON public.admin_activity FOR INSERT TO authenticated WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shows;

-- SEED MOVIES
INSERT INTO public.movies (slug, title, genre, language, rating, duration, poster) VALUES
('alpha','ALPHA','Sci-Fi Thriller','English','UA','2h 14m','linear-gradient(135deg, #00f0ff, #003a4a)'),
('toy-story-5','TOY STORY 5','Animation / Family','English / Hindi','U','1h 58m','linear-gradient(135deg, #ffcc00, #7a5a00)'),
('minions-and-monsters','MINIONS & MONSTERS','Animation / Comedy','English / Kannada','U','1h 42m','linear-gradient(135deg, #00ff88, #004a20)'),
('nagabandham','NAGABANDHAM','Mythological / Action','Kannada / Telugu','UA','2h 32m','linear-gradient(135deg, #bf00ff, #3a0055)'),
('kantara-chapter-2','KANTARA CHAPTER 2','Drama / Folklore','Kannada','UA','2h 48m','linear-gradient(135deg, #ff6b1a, #4a1a00)'),
('devara-part-2','DEVARA PART 2','Action / Drama','Telugu / Hindi','UA','2h 41m','linear-gradient(135deg, #ff2e5b, #4a0011)'),
('coolie','COOLIE','Action / Thriller','Tamil / Hindi','UA','2h 28m','linear-gradient(135deg, #00f0ff, #bf00ff)'),
('bagheera','BAGHEERA','Superhero / Vigilante','Kannada','UA','2h 22m','linear-gradient(135deg, #1a1a1a, #00f0ff)')
ON CONFLICT (slug) DO NOTHING;

-- SEED SHOWS
INSERT INTO public.shows (id, movie_slug, theatre, screen, time) VALUES
('alpha-1030-0','alpha','PVR Orion Mall','Screen 1','10:30 AM'),
('alpha-145-1','alpha','INOX Garuda Mall','Screen 2','1:45 PM'),
('alpha-600-2','alpha','Cinepolis Nexus Koramangala','Screen 3','6:00 PM'),
('alpha-1015-3','alpha','PVR Forum Mall','Screen 4','10:15 PM'),
('toy-story-5-900-0','toy-story-5','PVR Orion Mall','Screen 1','9:00 AM'),
('toy-story-5-1215-1','toy-story-5','INOX Garuda Mall','Screen 2','12:15 PM'),
('toy-story-5-330-2','toy-story-5','Cinepolis Nexus Koramangala','Screen 3','3:30 PM'),
('toy-story-5-745-3','toy-story-5','PVR Forum Mall','Screen 4','7:45 PM'),
('minions-1000-0','minions-and-monsters','PVR Orion Mall','Screen 1','10:00 AM'),
('minions-100-1','minions-and-monsters','INOX Garuda Mall','Screen 2','1:00 PM'),
('minions-400-2','minions-and-monsters','Cinepolis Nexus Koramangala','Screen 3','4:00 PM'),
('minions-930-3','minions-and-monsters','PVR Forum Mall','Screen 4','9:30 PM'),
('nagabandham-1130-0','nagabandham','PVR Orion Mall','Screen 1','11:30 AM'),
('nagabandham-245-1','nagabandham','INOX Garuda Mall','Screen 2','2:45 PM'),
('nagabandham-615-2','nagabandham','Cinepolis Nexus Koramangala','Screen 3','6:15 PM'),
('nagabandham-1000-3','nagabandham','PVR Forum Mall','Screen 4','10:00 PM'),
('kantara-2-1015-0','kantara-chapter-2','PVR Orion Mall','Screen 1','10:15 AM'),
('kantara-2-130-1','kantara-chapter-2','INOX Garuda Mall','Screen 2','1:30 PM'),
('kantara-2-545-2','kantara-chapter-2','Cinepolis Nexus Koramangala','Screen 3','5:45 PM'),
('kantara-2-900-3','kantara-chapter-2','PVR Forum Mall','Screen 4','9:00 PM'),
('kantara-2-1130-4','kantara-chapter-2','INOX Mantri Square','Screen 1','11:30 PM'),
('devara-2-1045-0','devara-part-2','PVR Orion Mall','Screen 1','10:45 AM'),
('devara-2-200-1','devara-part-2','INOX Garuda Mall','Screen 2','2:00 PM'),
('devara-2-530-2','devara-part-2','Cinepolis Nexus Koramangala','Screen 3','5:30 PM'),
('devara-2-915-3','devara-part-2','PVR Forum Mall','Screen 4','9:15 PM'),
('coolie-1100-0','coolie','PVR Orion Mall','Screen 1','11:00 AM'),
('coolie-215-1','coolie','INOX Garuda Mall','Screen 2','2:15 PM'),
('coolie-630-2','coolie','Cinepolis Nexus Koramangala','Screen 3','6:30 PM'),
('coolie-1000-3','coolie','PVR Forum Mall','Screen 4','10:00 PM'),
('bagheera-1000-0','bagheera','PVR Orion Mall','Screen 1','10:00 AM'),
('bagheera-115-1','bagheera','INOX Garuda Mall','Screen 2','1:15 PM'),
('bagheera-445-2','bagheera','Cinepolis Nexus Koramangala','Screen 3','4:45 PM'),
('bagheera-800-3','bagheera','PVR Forum Mall','Screen 4','8:00 PM'),
('bagheera-1100-4','bagheera','INOX Mantri Square','Screen 1','11:00 PM')
ON CONFLICT (id) DO NOTHING;
