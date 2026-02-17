// TypeScript types matching the Supabase database schema.
// Compatible with Supabase's generated type system.

// ============================================================================
// Enums
// ============================================================================

export type PlanType =
  | 'free'
  | 'agency_starter'
  | 'agency_growth'
  | 'agency_scale'
  | 'ecom_shield'
  | 'ecom_guard'
  | 'ecom_fortress'
  | 'municipal_starter'
  | 'municipal_pro';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'inactive';

export type ScanFrequency = 'manual' | 'weekly' | 'daily';

export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed';

export type ViolationSeverity = 'critical' | 'serious' | 'moderate' | 'minor';

export type ScanPageStatus = 'pending' | 'scanned' | 'failed';

// ============================================================================
// Row types (what you get back from a SELECT)
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  plan: PlanType;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  sites_limit: number;
  pages_per_site_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  user_id: string;
  url: string;
  name: string;
  is_active: boolean;
  scan_frequency: ScanFrequency;
  last_scanned_at: string | null;
  current_score: number | null;
  total_violations: number;
  critical_violations: number;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  site_id: string;
  user_id: string;
  status: ScanStatus;
  score: number | null;
  total_violations: number;
  critical_count: number;
  serious_count: number;
  moderate_count: number;
  minor_count: number;
  pages_scanned: number;
  pages_total: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface Violation {
  id: string;
  scan_id: string;
  site_id: string;
  page_url: string;
  rule_id: string;
  severity: ViolationSeverity;
  impact: string;
  description: string;
  help_text: string;
  html_snippet: string | null;
  css_selector: string | null;
  wcag_criteria: string[];
  is_new: boolean;
  created_at: string;
}

export interface ScanPage {
  id: string;
  scan_id: string;
  url: string;
  status: ScanPageStatus;
  violation_count: number;
  score: number | null;
  scanned_at: string | null;
}

export interface AgencySettings {
  id: string;
  user_id: string;
  agency_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  custom_domain: string | null;
  report_footer_text: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Insert types (what you pass to an INSERT — omit generated/default columns)
// ============================================================================

export interface ProfileInsert {
  id: string;
  email: string;
  full_name?: string | null;
  company_name?: string | null;
  plan?: PlanType;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: SubscriptionStatus;
  sites_limit?: number;
  pages_per_site_limit?: number;
}

export interface SiteInsert {
  id?: string;
  user_id: string;
  url: string;
  name: string;
  is_active?: boolean;
  scan_frequency?: ScanFrequency;
  last_scanned_at?: string | null;
  current_score?: number | null;
  total_violations?: number;
  critical_violations?: number;
}

export interface ScanInsert {
  id?: string;
  site_id: string;
  user_id: string;
  status?: ScanStatus;
  score?: number | null;
  total_violations?: number;
  critical_count?: number;
  serious_count?: number;
  moderate_count?: number;
  minor_count?: number;
  pages_scanned?: number;
  pages_total?: number;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
}

export interface ViolationInsert {
  id?: string;
  scan_id: string;
  site_id: string;
  page_url: string;
  rule_id: string;
  severity: ViolationSeverity;
  impact: string;
  description: string;
  help_text: string;
  html_snippet?: string | null;
  css_selector?: string | null;
  wcag_criteria?: string[];
  is_new?: boolean;
}

export interface ScanPageInsert {
  id?: string;
  scan_id: string;
  url: string;
  status?: ScanPageStatus;
  violation_count?: number;
  score?: number | null;
  scanned_at?: string | null;
}

export interface AgencySettingsInsert {
  id?: string;
  user_id: string;
  agency_name: string;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  custom_domain?: string | null;
  report_footer_text?: string | null;
}

// ============================================================================
// Update types (all fields optional except you can't change id)
// ============================================================================

export interface ProfileUpdate {
  email?: string;
  full_name?: string | null;
  company_name?: string | null;
  plan?: PlanType;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: SubscriptionStatus;
  sites_limit?: number;
  pages_per_site_limit?: number;
}

export interface SiteUpdate {
  user_id?: string;
  url?: string;
  name?: string;
  is_active?: boolean;
  scan_frequency?: ScanFrequency;
  last_scanned_at?: string | null;
  current_score?: number | null;
  total_violations?: number;
  critical_violations?: number;
}

export interface ScanUpdate {
  status?: ScanStatus;
  score?: number | null;
  total_violations?: number;
  critical_count?: number;
  serious_count?: number;
  moderate_count?: number;
  minor_count?: number;
  pages_scanned?: number;
  pages_total?: number;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
}

export interface ViolationUpdate {
  severity?: ViolationSeverity;
  impact?: string;
  description?: string;
  help_text?: string;
  html_snippet?: string | null;
  css_selector?: string | null;
  wcag_criteria?: string[];
  is_new?: boolean;
}

export interface ScanPageUpdate {
  status?: ScanPageStatus;
  violation_count?: number;
  score?: number | null;
  scanned_at?: string | null;
}

export interface AgencySettingsUpdate {
  agency_name?: string;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  custom_domain?: string | null;
  report_footer_text?: string | null;
}

// ============================================================================
// Supabase Database type (compatible with createClient<Database>())
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      sites: {
        Row: Site;
        Insert: SiteInsert;
        Update: SiteUpdate;
      };
      scans: {
        Row: Scan;
        Insert: ScanInsert;
        Update: ScanUpdate;
      };
      violations: {
        Row: Violation;
        Insert: ViolationInsert;
        Update: ViolationUpdate;
      };
      scan_pages: {
        Row: ScanPage;
        Insert: ScanPageInsert;
        Update: ScanPageUpdate;
      };
      agency_settings: {
        Row: AgencySettings;
        Insert: AgencySettingsInsert;
        Update: AgencySettingsUpdate;
      };
    };
    Enums: {
      plan_type: PlanType;
      subscription_status: SubscriptionStatus;
      scan_frequency: ScanFrequency;
      scan_status: ScanStatus;
      violation_severity: ViolationSeverity;
      scan_page_status: ScanPageStatus;
    };
  };
}
