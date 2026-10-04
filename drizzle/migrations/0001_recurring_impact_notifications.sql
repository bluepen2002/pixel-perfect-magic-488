-- 1) Recurring giving: contributions can be one-time, weekly or monthly pledges
ALTER TABLE public.contributions
  ADD COLUMN recurrence text NOT NULL DEFAULT 'ONE_TIME'
  CHECK (recurrence IN ('ONE_TIME', 'WEEKLY', 'MONTHLY'));

-- 2) Impact stories: admin-published stories shown on the public transparency page
CREATE TABLE public.impact_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  county text,
  person_label text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.impact_stories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.impact_stories TO authenticated;
GRANT ALL ON public.impact_stories TO service_role;
ALTER TABLE public.impact_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads published stories" ON public.impact_stories
  FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "admins manage stories" ON public.impact_stories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER impact_stories_updated_at BEFORE UPDATE ON public.impact_stories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) In-app notifications: members are told when a request status changes
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications read" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own notifications mark read" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notify the request owner whenever a status event is logged
CREATE OR REPLACE FUNCTION public.notify_request_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner uuid;
  req_title text;
BEGIN
  SELECT user_id, title INTO owner, req_title
  FROM public.assistance_requests
  WHERE id = NEW.request_id;
  IF owner IS NULL THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.notifications (user_id, title, body, link)
  VALUES (
    owner,
    'Update on your request',
    'Your request "' || req_title || '" is now ' || NEW.status ||
      COALESCE('. Note: ' || NEW.note, ''),
    '/requests/' || NEW.request_id
  );
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_request_status() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER request_status_notify AFTER INSERT ON public.request_status_events
  FOR EACH ROW EXECUTE FUNCTION public.notify_request_status();