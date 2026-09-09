
-- SEATS
CREATE TABLE public.seats (
  id TEXT PRIMARY KEY,
  row_label TEXT NOT NULL,
  seat_number INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seats TO anon, authenticated;
GRANT ALL ON public.seats TO service_role;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read seats"   ON public.seats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public update seats" ON public.seats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public insert seats" ON public.seats FOR INSERT TO anon, authenticated WITH CHECK (true);

-- WAITLIST
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id TEXT NOT NULL REFERENCES public.seats(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  position INT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist TO anon, authenticated;
GRANT ALL ON public.waitlist TO service_role;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read waitlist"   ON public.waitlist FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert waitlist" ON public.waitlist FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update waitlist" ON public.waitlist FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX waitlist_seat_position_idx ON public.waitlist(seat_id, position);

-- Realtime
ALTER TABLE public.seats    REPLICA IDENTITY FULL;
ALTER TABLE public.waitlist REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waitlist;

-- Seed 192 seats: rows A-L (12 rows) x 1-16
INSERT INTO public.seats (id, row_label, seat_number, status)
SELECT r || n::text, r, n, 'available'
FROM (VALUES ('A'),('B'),('C'),('D'),('E'),('F'),('G'),('H'),('I'),('J'),('K'),('L')) AS rows(r)
CROSS JOIN generate_series(1,16) AS n;
