-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'reviewer', 'member');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ADMIN ACCESS TO EXISTING TABLES
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins read all contributions" ON public.contributions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins read all requests" ON public.assistance_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update requests" ON public.assistance_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- REQUEST STATUS HISTORY
CREATE TABLE public.request_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.assistance_requests(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX request_status_events_request_idx ON public.request_status_events (request_id, created_at);
GRANT SELECT, INSERT ON public.request_status_events TO authenticated;
GRANT ALL ON public.request_status_events TO service_role;
ALTER TABLE public.request_status_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read own request updates" ON public.request_status_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.assistance_requests r WHERE r.id = request_id AND r.user_id = auth.uid()));
CREATE POLICY "admins read all request updates" ON public.request_status_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins add request updates" ON public.request_status_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_request_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.request_status_events (request_id, status, note, actor_id)
    VALUES (NEW.id, NEW.status, 'Request submitted and queued for review.', NEW.user_id);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.request_status_events (request_id, status, note, actor_id)
    VALUES (NEW.id, NEW.status, NEW.review_notes, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER requests_log_status_insert AFTER INSERT ON public.assistance_requests
FOR EACH ROW EXECUTE FUNCTION public.log_request_status();
CREATE TRIGGER requests_log_status_update AFTER UPDATE ON public.assistance_requests
FOR EACH ROW EXECUTE FUNCTION public.log_request_status();

-- TRANSPARENCY CONTENT
CREATE TABLE public.transparency_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transparency_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.transparency_content TO authenticated;
GRANT ALL ON public.transparency_content TO service_role;
ALTER TABLE public.transparency_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads published content" ON public.transparency_content FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "admins manage content" ON public.transparency_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER transparency_content_updated_at BEFORE UPDATE ON public.transparency_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.transparency_content (slug, title, body, sort_order) VALUES
('how-the-fund-works', 'How the community fund works', 'Every shilling contributed by members goes into the community assistance fund. The fund is tracked separately from Lift1''s operating business revenue and is only used for approved, needs-based assistance.', 1),
('needs-based-only', 'Needs-based assistance only', 'Assistance is allocated by reviewers against published need and priority criteria. There are no draws, no winners and no chance-based allocation of any kind.', 2),
('platform-fee', 'Platform fee', 'The platform fee is currently switched off. If a fee is ever applied it will be disclosed here, shown on every contribution, and recorded in the ledger.', 3),
('your-data', 'Your data', 'We collect only the details needed to verify members and send assistance. Sensitive verification documents are stored separately and are never shown on public pages.', 4);

-- KENYA LOCATIONS
CREATE TABLE public.kenya_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  county text NOT NULL,
  subcounty text NOT NULL,
  ward text NOT NULL,
  village text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (county, subcounty, ward, village)
);
CREATE INDEX kenya_locations_county_idx ON public.kenya_locations (county, subcounty, ward);
GRANT SELECT ON public.kenya_locations TO anon, authenticated;
GRANT ALL ON public.kenya_locations TO service_role;
ALTER TABLE public.kenya_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads locations" ON public.kenya_locations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage locations" ON public.kenya_locations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.kenya_locations (county, subcounty, ward, village) VALUES
('Nairobi', 'Embakasi East', 'Utawala', 'Benedicta'),
('Nairobi', 'Embakasi East', 'Mihango', 'Mowlem'),
('Nairobi', 'Kibra', 'Laini Saba', 'Lindi'),
('Nairobi', 'Kibra', 'Sarangombe', 'Gatwekera'),
('Nairobi', 'Dagoretti North', 'Kilimani', 'Kileleshwa'),
('Nairobi', 'Kasarani', 'Mwiki', 'Sunton'),
('Kiambu', 'Thika Town', 'Township', 'Majengo'),
('Kiambu', 'Juja', 'Witeithie', 'Kiganjo'),
('Kiambu', 'Limuru', 'Ndeiya', 'Thigio'),
('Nakuru', 'Nakuru Town East', 'Biashara', 'Kaptembwo'),
('Nakuru', 'Naivasha', 'Hells Gate', 'Kongoni'),
('Nakuru', 'Molo', 'Elburgon', 'Turi'),
('Kisumu', 'Kisumu Central', 'Market Milimani', 'Nyalenda'),
('Kisumu', 'Nyando', 'Ahero', 'Kakola'),
('Kisumu', 'Muhoroni', 'Chemelil', 'Tamu'),
('Mombasa', 'Mvita', 'Majengo', 'Bondeni'),
('Mombasa', 'Likoni', 'Mtongwe', 'Shika Adabu'),
('Mombasa', 'Kisauni', 'Mjambere', 'Mwandoni'),
('Uasin Gishu', 'Eldoret East', 'Kapsoya', 'Munyaka'),
('Uasin Gishu', 'Ainabkoi', 'Kaptagat', 'Flax'),
('Machakos', 'Machakos Town', 'Mua', 'Kiima Kimwe'),
('Machakos', 'Mavoko', 'Athi River', 'Kinanie'),
('Kakamega', 'Lurambi', 'Shieywe', 'Amalemba'),
('Kakamega', 'Mumias East', 'Lusheya', 'Ekero'),
('Kilifi', 'Malindi', 'Shella', 'Muyeye'),
('Kilifi', 'Kaloleni', 'Mariakani', 'Mwanamwinga'),
('Meru', 'Imenti North', 'Municipality', 'Makutano'),
('Meru', 'Tigania West', 'Athwana', 'Kianjai'),
('Garissa', 'Garissa Township', 'Waberi', 'Bulla Iftin'),
('Turkana', 'Turkana Central', 'Lodwar Township', 'Napetet'),
('Homa Bay', 'Homa Bay Town', 'Homa Bay Central', 'Shauri Yako'),
('Bungoma', 'Kanduyi', 'Bukembe West', 'Musikoma');

-- SAMPLE (DEMO) COMMUNITY DATA
CREATE TABLE public.demo_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  county text NOT NULL,
  subcounty text NOT NULL,
  ward text NOT NULL,
  village text NOT NULL,
  verification_status text NOT NULL DEFAULT 'VERIFIED',
  joined_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.demo_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.demo_members TO authenticated;
GRANT ALL ON public.demo_members TO service_role;
ALTER TABLE public.demo_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads sample members" ON public.demo_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage sample members" ON public.demo_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.demo_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name text NOT NULL,
  amount_kes numeric(12,2) NOT NULL CHECK (amount_kes > 0),
  method text NOT NULL DEFAULT 'M-PESA',
  county text NOT NULL,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.demo_contributions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.demo_contributions TO authenticated;
GRANT ALL ON public.demo_contributions TO service_role;
ALTER TABLE public.demo_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads sample contributions" ON public.demo_contributions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage sample contributions" ON public.demo_contributions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  amount_requested numeric(12,2) NOT NULL CHECK (amount_requested > 0),
  approved_amount numeric(12,2),
  county text NOT NULL,
  subcounty text,
  ward text,
  village text,
  status text NOT NULL DEFAULT 'SUBMITTED',
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.demo_requests TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.demo_requests TO authenticated;
GRANT ALL ON public.demo_requests TO service_role;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads sample requests" ON public.demo_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage sample requests" ON public.demo_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.demo_members (first_name, last_name, phone, county, subcounty, ward, village, verification_status, joined_at) VALUES
('Amina', 'Hassan', '+2547** *** 214', 'Mombasa', 'Mvita', 'Majengo', 'Bondeni', 'VERIFIED', now() - interval '210 days'),
('Brian', 'Otieno', '+2547** *** 883', 'Kisumu', 'Kisumu Central', 'Market Milimani', 'Nyalenda', 'VERIFIED', now() - interval '180 days'),
('Caroline', 'Wanjiku', '+2547** *** 455', 'Kiambu', 'Thika Town', 'Township', 'Majengo', 'VERIFIED', now() - interval '150 days'),
('Dennis', 'Kipkorir', '+2547** *** 021', 'Uasin Gishu', 'Eldoret East', 'Kapsoya', 'Munyaka', 'PENDING', now() - interval '120 days'),
('Esther', 'Mutheu', '+2547** *** 764', 'Machakos', 'Mavoko', 'Athi River', 'Kinanie', 'VERIFIED', now() - interval '96 days'),
('Faith', 'Nyawira', '+2547** *** 190', 'Nairobi', 'Kasarani', 'Mwiki', 'Sunton', 'VERIFIED', now() - interval '80 days'),
('Geoffrey', 'Barasa', '+2547** *** 337', 'Bungoma', 'Kanduyi', 'Bukembe West', 'Musikoma', 'UNDER_REVIEW', now() - interval '64 days'),
('Halima', 'Abdi', '+2547** *** 902', 'Garissa', 'Garissa Township', 'Waberi', 'Bulla Iftin', 'VERIFIED', now() - interval '52 days'),
('Ian', 'Mwangi', '+2547** *** 548', 'Nakuru', 'Nakuru Town East', 'Biashara', 'Kaptembwo', 'VERIFIED', now() - interval '40 days'),
('Joyce', 'Akinyi', '+2547** *** 613', 'Homa Bay', 'Homa Bay Town', 'Homa Bay Central', 'Shauri Yako', 'PENDING', now() - interval '28 days'),
('Kevin', 'Mutua', '+2547** *** 776', 'Kilifi', 'Malindi', 'Shella', 'Muyeye', 'VERIFIED', now() - interval '18 days'),
('Lucy', 'Cherono', '+2547** *** 305', 'Nairobi', 'Embakasi East', 'Utawala', 'Benedicta', 'VERIFIED', now() - interval '9 days');

INSERT INTO public.demo_contributions (member_name, amount_kes, method, county, reference, created_at) VALUES
('Amina Hassan', 1, 'M-PESA', 'Mombasa', 'SAMPLE-0001', now() - interval '30 days'),
('Brian Otieno', 50, 'M-PESA', 'Kisumu', 'SAMPLE-0002', now() - interval '29 days'),
('Caroline Wanjiku', 100, 'M-PESA', 'Kiambu', 'SAMPLE-0003', now() - interval '27 days'),
('Dennis Kipkorir', 20, 'M-PESA', 'Uasin Gishu', 'SAMPLE-0004', now() - interval '25 days'),
('Esther Mutheu', 500, 'M-PESA', 'Machakos', 'SAMPLE-0005', now() - interval '23 days'),
('Faith Nyawira', 1, 'M-PESA', 'Nairobi', 'SAMPLE-0006', now() - interval '21 days'),
('Geoffrey Barasa', 200, 'M-PESA', 'Bungoma', 'SAMPLE-0007', now() - interval '18 days'),
('Halima Abdi', 50, 'M-PESA', 'Garissa', 'SAMPLE-0008', now() - interval '15 days'),
('Ian Mwangi', 1000, 'BANK', 'Nakuru', 'SAMPLE-0009', now() - interval '12 days'),
('Joyce Akinyi', 20, 'M-PESA', 'Homa Bay', 'SAMPLE-0010', now() - interval '9 days'),
('Kevin Mutua', 100, 'M-PESA', 'Kilifi', 'SAMPLE-0011', now() - interval '6 days'),
('Lucy Cherono', 1, 'M-PESA', 'Nairobi', 'SAMPLE-0012', now() - interval '3 days'),
('Amina Hassan', 300, 'M-PESA', 'Mombasa', 'SAMPLE-0013', now() - interval '2 days'),
('Brian Otieno', 1, 'M-PESA', 'Kisumu', 'SAMPLE-0014', now() - interval '1 day'),
('Faith Nyawira', 250, 'M-PESA', 'Nairobi', 'SAMPLE-0015', now() - interval '6 hours');

INSERT INTO public.demo_requests (member_name, category, title, description, amount_requested, approved_amount, county, subcounty, ward, village, status, review_notes, created_at) VALUES
('Amina Hassan', 'Medical', 'Hospital bill for my daughter', 'My daughter was admitted at Coast General for three days with pneumonia. The discharge bill is outstanding and I cannot clear it alone.', 18000, 15000, 'Mombasa', 'Mvita', 'Majengo', 'Bondeni', 'DISBURSED', 'Bill verified with the hospital. Partial assistance sent directly to the facility.', now() - interval '26 days'),
('Brian Otieno', 'Education', 'School fees arrears for form two', 'My son was sent home over fees arrears for term two. I sell fish at Jubilee market and business has been slow.', 12000, 12000, 'Kisumu', 'Kisumu Central', 'Market Milimani', 'Nyalenda', 'DISBURSED', 'Fee structure confirmed with the school. Paid to the school account.', now() - interval '22 days'),
('Caroline Wanjiku', 'Rent / Housing', 'Two months rent arrears', 'I lost my job at a Thika textile factory in June and owe two months rent. I need help to avoid eviction while I look for work.', 16000, 10000, 'Kiambu', 'Thika Town', 'Township', 'Majengo', 'APPROVED', 'Landlord statement received. Approved at a reduced amount pending fund availability.', now() - interval '17 days'),
('Esther Mutheu', 'Small Business Restart', 'Restart my vegetable stall', 'My stall at Athi River was demolished during road works. I need stock and a new table to start selling again.', 9000, NULL, 'Machakos', 'Mavoko', 'Athi River', 'Kinanie', 'UNDER_REVIEW', 'Awaiting a visit report from the local committee.', now() - interval '11 days'),
('Geoffrey Barasa', 'Food / Basic Needs', 'Food support for five children', 'I am a widower caring for five children in Musikoma. Casual work has dried up and we are down to one meal a day.', 6000, NULL, 'Bungoma', 'Kanduyi', 'Bukembe West', 'Musikoma', 'NEEDS_MORE_INFO', 'Please share an ID copy and the childrens school details.', now() - interval '8 days'),
('Halima Abdi', 'Disaster / Emergency', 'Flood damage to our home', 'Flood water destroyed our roof and bedding in Bulla Iftin. We need iron sheets and mattresses.', 22000, NULL, 'Garissa', 'Garissa Township', 'Waberi', 'Bulla Iftin', 'UNDER_REVIEW', 'Referred to the county disaster committee for confirmation.', now() - interval '6 days'),
('Joyce Akinyi', 'Medical', 'Clinic transport for dialysis', 'I travel to Kisumu twice a week for dialysis and can no longer afford the fare.', 8000, NULL, 'Homa Bay', 'Homa Bay Town', 'Homa Bay Central', 'Shauri Yako', 'SUBMITTED', NULL, now() - interval '4 days'),
('Kevin Mutua', 'Livelihood', 'Fishing net replacement', 'My nets were damaged in a storm off Malindi. Without them I have no income for my family.', 14000, NULL, 'Kilifi', 'Malindi', 'Shella', 'Muyeye', 'SUBMITTED', NULL, now() - interval '2 days'),
('Lucy Cherono', 'Family Support', 'Support after my husbands death', 'My husband passed away last month. I need short term help with food and my childrens transport to school.', 11000, NULL, 'Nairobi', 'Embakasi East', 'Utawala', 'Benedicta', 'SUBMITTED', NULL, now() - interval '1 day'),
('Ian Mwangi', 'Emergency', 'Emergency surgery deposit', 'I need a deposit for emergency appendix surgery at a Nakuru hospital.', 25000, NULL, 'Nakuru', 'Nakuru Town East', 'Biashara', 'Kaptembwo', 'DECLINED', 'Cost already covered by the members NHIF cover. Referred back to the insurer.', now() - interval '14 days');