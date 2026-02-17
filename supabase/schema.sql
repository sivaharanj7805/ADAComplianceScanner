-- ============================================================================
-- AccessAudit / ADA Compliance Scanner - Supabase Database Schema
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE plan_type AS ENUM (
  'free',
  'agency_starter',
  'agency_growth',
  'agency_scale',
  'ecom_shield',
  'ecom_guard',
  'ecom_fortress',
  'municipal_starter',
  'municipal_pro'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'inactive'
);

CREATE TYPE scan_frequency AS ENUM (
  'manual',
  'weekly',
  'daily'
);

CREATE TYPE scan_status AS ENUM (
  'pending',
  'running',
  'completed',
  'failed'
);

CREATE TYPE violation_severity AS ENUM (
  'critical',
  'serious',
  'moderate',
  'minor'
);

CREATE TYPE scan_page_status AS ENUM (
  'pending',
  'scanned',
  'failed'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  company_name text,
  plan plan_type NOT NULL DEFAULT 'free',
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text,
  subscription_status subscription_status NOT NULL DEFAULT 'inactive',
  sites_limit integer NOT NULL DEFAULT 1,
  pages_per_site_limit integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. sites
CREATE TABLE sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  url text NOT NULL,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  scan_frequency scan_frequency NOT NULL DEFAULT 'manual',
  last_scanned_at timestamptz,
  current_score integer CHECK (current_score >= 0 AND current_score <= 100),
  total_violations integer NOT NULL DEFAULT 0,
  critical_violations integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. scans
CREATE TABLE scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  status scan_status NOT NULL DEFAULT 'pending',
  score integer CHECK (score >= 0 AND score <= 100),
  total_violations integer NOT NULL DEFAULT 0,
  critical_count integer NOT NULL DEFAULT 0,
  serious_count integer NOT NULL DEFAULT 0,
  moderate_count integer NOT NULL DEFAULT 0,
  minor_count integer NOT NULL DEFAULT 0,
  pages_scanned integer NOT NULL DEFAULT 0,
  pages_total integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. violations
CREATE TABLE violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES scans ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES sites ON DELETE CASCADE,
  page_url text NOT NULL,
  rule_id text NOT NULL,
  severity violation_severity NOT NULL,
  impact text NOT NULL,
  description text NOT NULL,
  help_text text NOT NULL,
  html_snippet text,
  css_selector text,
  wcag_criteria text[] NOT NULL DEFAULT '{}',
  is_new boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. scan_pages
CREATE TABLE scan_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES scans ON DELETE CASCADE,
  url text NOT NULL,
  status scan_page_status NOT NULL DEFAULT 'pending',
  violation_count integer NOT NULL DEFAULT 0,
  score integer CHECK (score >= 0 AND score <= 100),
  scanned_at timestamptz
);

-- 6. agency_settings (white-label)
CREATE TABLE agency_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles ON DELETE CASCADE,
  agency_name text NOT NULL,
  logo_url text,
  primary_color text NOT NULL DEFAULT '#2563EB',
  secondary_color text NOT NULL DEFAULT '#1E293B',
  custom_domain text,
  report_footer_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_sites_user_id ON sites (user_id);
CREATE INDEX idx_scans_site_id ON scans (site_id);
CREATE INDEX idx_scans_user_id ON scans (user_id);
CREATE INDEX idx_violations_scan_id ON violations (scan_id);
CREATE INDEX idx_violations_site_id ON violations (site_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;

-- profiles: users can only read/update their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- sites: users can only CRUD their own sites
CREATE POLICY "Users can read own sites"
  ON sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites"
  ON sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites"
  ON sites FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites"
  ON sites FOR DELETE
  USING (auth.uid() = user_id);

-- scans: users can only read their own scans
CREATE POLICY "Users can read own scans"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- violations: users can only read violations from their own scans
CREATE POLICY "Users can read own violations"
  ON violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scans
      WHERE scans.id = violations.scan_id
        AND scans.user_id = auth.uid()
    )
  );

-- scan_pages: users can only read pages from their own scans
CREATE POLICY "Users can read own scan pages"
  ON scan_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scans
      WHERE scans.id = scan_pages.scan_id
        AND scans.user_id = auth.uid()
    )
  );

-- agency_settings: users can only CRUD their own settings
CREATE POLICY "Users can read own agency settings"
  ON agency_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agency settings"
  ON agency_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agency settings"
  ON agency_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own agency settings"
  ON agency_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at triggers for profiles, sites, agency_settings
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_agency_settings_updated_at
  BEFORE UPDATE ON agency_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile when a new auth.user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update site stats when a scan completes
CREATE OR REPLACE FUNCTION handle_scan_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE sites
    SET
      current_score = NEW.score,
      total_violations = NEW.total_violations,
      critical_violations = NEW.critical_count,
      last_scanned_at = NEW.completed_at
    WHERE id = NEW.site_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_scan_completed
  AFTER UPDATE ON scans
  FOR EACH ROW EXECUTE FUNCTION handle_scan_completed();
