CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  county TEXT,
  town TEXT,
  verification_status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_kes NUMERIC(12,2) NOT NULL CHECK (amount_kes > 0),
  status TEXT NOT NULL DEFAULT 'RECORDED',
  method TEXT NOT NULL DEFAULT 'PENDING_PROVIDER',
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.contributions TO authenticated;
GRANT ALL ON public.contributions TO service_role;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own contributions read" ON public.contributions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own contributions insert" ON public.contributions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.assistance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_requested NUMERIC(12,2) NOT NULL CHECK (amount_requested > 0),
  county TEXT,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  review_notes TEXT,
  approved_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.assistance_requests TO authenticated;
GRANT ALL ON public.assistance_requests TO service_role;
ALTER TABLE public.assistance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own requests read" ON public.assistance_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own requests insert" ON public.assistance_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own requests update" ON public.assistance_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'SUBMITTED') WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER requests_updated_at BEFORE UPDATE ON public.assistance_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.community_stats()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_contributed', COALESCE((SELECT SUM(amount_kes) FROM public.contributions), 0),
    'contribution_count', (SELECT COUNT(*) FROM public.contributions),
    'members', (SELECT COUNT(*) FROM public.profiles),
    'requests_submitted', (SELECT COUNT(*) FROM public.assistance_requests),
    'people_lifted', (SELECT COUNT(*) FROM public.assistance_requests WHERE status IN ('APPROVED','DISBURSED')),
    'total_disbursed', COALESCE((SELECT SUM(approved_amount) FROM public.assistance_requests WHERE status = 'DISBURSED'), 0)
  );
$$;
GRANT EXECUTE ON FUNCTION public.community_stats() TO anon, authenticated, service_role;